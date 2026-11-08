import { cpSync, createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

import type { Plugin } from "vite";

import { PROJECTS, isProductProject } from "../shared/projects.js";

/** Exported pages carry their images inline, so this is far roomier than a research file. Keep in step with `PageCode.tsx`. */
const MAX_BYTES = 20_000_000;
/** What a zip may unpack to, all files together: a guard against a zip bomb. */
const MAX_UNPACKED = 200_000_000;

type SiteFile = { path: string; data: Buffer };

/**
 * A zip's files, read with zlib alone: stored and deflated entries, no encryption, no zip64. Paths are
 * checked here, so nothing can land outside the folder it unpacks into.
 */
export function unzip(zip: Buffer): SiteFile[] {
  let end = zip.length - 22;
  while (end >= 0 && zip.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0) throw new Error("That isn't a zip file.");
  const count = zip.readUInt16LE(end + 10);
  let at = zip.readUInt32LE(end + 16);
  let budget = MAX_UNPACKED;
  const files: SiteFile[] = [];
  for (let i = 0; i < count; i++) {
    if (zip.readUInt32LE(at) !== 0x02014b50) throw new Error("The zip is damaged.");
    const flags = zip.readUInt16LE(at + 8);
    const method = zip.readUInt16LE(at + 10);
    const packed = zip.readUInt32LE(at + 20);
    const nameLength = zip.readUInt16LE(at + 28);
    const local = zip.readUInt32LE(at + 42);
    const path = zip.toString("utf8", at + 46, at + 46 + nameLength).replace(/\\/g, "/");
    at += 46 + nameLength + zip.readUInt16LE(at + 30) + zip.readUInt16LE(at + 32);
    // Folders, and the Mac's resource-fork copies, are nothing to serve.
    if (path.endsWith("/") || path.startsWith("__MACOSX/") || path.split("/").pop() === ".DS_Store") continue;
    if (path.startsWith("/") || /^[a-z]:/i.test(path) || path.split("/").some((part) => part === ".." || part === "")) {
      throw new Error(`The zip has an unsafe path: ${path}`);
    }
    if (flags & 1) throw new Error("The zip is password-protected.");
    if (method !== 0 && method !== 8) throw new Error(`${path} uses a compression this can't read; zip it again with standard settings.`);
    const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const raw = zip.subarray(start, start + packed);
    const data = method === 0 ? Buffer.from(raw) : inflateRawSync(raw, { maxOutputLength: Math.max(budget, 1) });
    budget -= data.length;
    if (budget < 0) throw new Error("The zip unpacks to more than 200 MB.");
    files.push({ path, data });
  }
  return files;
}

/**
 * The zip's page: its files with the folder they were zipped in taken off (`site/index.html` →
 * `index.html`), and the page to open, which is `index.html`, or the only HTML file there is.
 */
export function pageOf(files: SiteFile[]) {
  const top = files[0]?.path.split("/")[0] ?? "";
  const wrapped = files.length > 0 && files.every((f) => f.path.startsWith(`${top}/`));
  const unwrapped = wrapped ? files.map((f) => ({ ...f, path: f.path.slice(top.length + 1) })) : files;
  const pages = unwrapped.filter((f) => /\.html?$/i.test(f.path));
  const index = pages.find((f) => f.path.toLowerCase() === "index.html") ?? (pages.length === 1 ? pages[0] : undefined);
  if (!index) {
    throw new Error(pages.length ? "The zip has several HTML files and no index.html; name the page to open index.html." : "The zip has no HTML file.");
  }
  return { files: unwrapped, index: index.path };
}

/**
 * A site built for the root (`src="/assets/app.js"`) would look for its files at the board's root; in
 * its HTML, a root path to one of its own files is made relative, so it is found beside the page.
 */
export function relativize(html: string, paths: Set<string>) {
  return html.replace(/(\b(?:src|href)\s*=\s*["'])\/(?!\/)([^"'?#]+)/gi, (match, attr: string, path: string) =>
    paths.has(path) ? `${attr}./${path}` : match,
  );
}

/** What an uploaded page's files are served as. Anything else goes as plain bytes. */
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf", ".mp4": "video/mp4",
  ".webm": "video/webm", ".txt": "text/plain; charset=utf-8", ".map": "application/json",
};

/**
 * A page's premade code, kept in its project: `projects/<project>/pages/<page>/`, listed in
 * `projects/<project>/data/page-code.json`. A built page's code lives in the same `pages/` (Payment's
 * `pages/landing/`); only the pages that manifest lists are uploads, and nothing here touches the rest. Dev server: POST /api/pages/<project>/<page> takes {name, text}
 * for an HTML file or {name, data} (base64) for a zip of a page and unpacks it there (replacing what
 * was there); DELETE removes it. Only a product project's own pages (not Experimentation) take one.
 * The files are served as they are, not through Vite (which would rewrite their HTML), to any origin,
 * so the page's sandboxed frame (an opaque origin) can still load its module scripts; the build copies
 * them beside the project's page.
 */
export function pageFiles(): Plugin {
  const app = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));
  type Entry = { name: string; kind: "html" | "zip"; files: number; addedAt: number; folder?: string };
  const manifestOf = (project: string): Record<string, Entry> => {
    const file = app(`projects/${project}/data/page-code.json`);
    try {
      return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
    } catch {
      return {};
    }
  };
  /**
   * Whether a folder in `pages/` holds uploaded code, not a built page's source. An upload sits in its
   * page's folder (`pages/success/`), or, replacing a built page, beside it (`pages/landing-upload/`).
   */
  const uploaded = (project: string, folder: string) =>
    Object.entries(manifestOf(project)).some(([page, entry]) => (entry.folder ?? page) === folder);
  let outDir = "";
  return {
    name: "page-files",
    configResolved(config) {
      // The copy is for a build; closeBundle also runs when the dev server stops.
      if (config.command === "build") outDir = resolve(config.root, config.build.outDir);
    },
    // Uploading a page writes HTML under the app; that is content, not the board's code, so no reload.
    handleHotUpdate({ file }) {
      const match = /\/projects\/([^/]+)\/pages\/([^/]+)\//.exec(file);
      if (match && uploaded(match[1]!, match[2]!)) return [];
    },
    closeBundle() {
      const projects = app("projects/");
      if (!outDir) return;
      for (const project of readdirSync(projects)) {
        for (const [page, entry] of Object.entries(manifestOf(project))) {
          const folder = entry.folder ?? page;
          const from = `${projects}${project}/pages/${folder}`;
          if (existsSync(from)) cpSync(from, `${outDir}/projects/${project}/pages/${folder}`, { recursive: true });
        }
      }
    },
    configureServer(server) {
      server.middlewares.use("/projects", (req, res, next) => {
        const match = /^\/([a-z0-9-]+)\/pages\/([a-z0-9-]+)\/([^?#]*)/.exec(req.url ?? "");
        // A built page's source (pages/landing/) is the board's code: Vite serves it.
        if (!match || !uploaded(match[1]!, match[2]!)) return next();
        const root = app(`projects/${match[1]}/pages/${match[2]}`);
        const file = resolve(root, decodeURIComponent(match[3] || "index.html"));
        // Only a file inside that page's own folder.
        if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
          res.statusCode = 404;
          return res.end("Not found");
        }
        res.setHeader("Content-Type", TYPES[extname(file).toLowerCase()] ?? "application/octet-stream");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "no-cache");
        createReadStream(file).pipe(res);
      });
      server.middlewares.use("/api/pages", (req, res) => {
        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };
        const [project = "", page = ""] = new URL(req.url ?? "", "http://x").pathname.slice(1).split("/");
        const pages = PROJECTS.find((p) => p.id === project)?.pages ?? [];
        if (!isProductProject(project) || page === "experiments" || !pages.some((p) => p.value === page)) {
          return send(404, { error: "Unknown page" });
        }
        const manifestFile = app(`projects/${project}/data/page-code.json`);
        const manifest = () => manifestOf(project);
        // A built page's folder holds its source, which an upload never touches: its upload goes beside it.
        const builtHere = !manifest()[page] && existsSync(app(`projects/${project}/pages/${page}`));
        const folder = manifest()[page]?.folder ?? (builtHere ? `${page}-upload` : page);
        const dir = app(`projects/${project}/pages/${folder}/`);
        const record = (entry: Entry | undefined) => {
          const next = manifest();
          if (entry) next[page] = entry;
          else delete next[page];
          if (Object.keys(next).length) writeFileSync(manifestFile, JSON.stringify(next, null, 2) + "\n");
          else if (existsSync(manifestFile)) unlinkSync(manifestFile);
        };

        if (req.method === "DELETE") {
          if (!manifest()[page]) return send(404, { error: "No code for this page" });
          rmSync(dir, { recursive: true, force: true });
          // A project whose last upload went keeps no empty pages/ behind.
          const pagesDir = dirname(dir.replace(/\/$/, ""));
          if (existsSync(pagesDir) && readdirSync(pagesDir).every((name) => name === ".DS_Store")) rmSync(pagesDir, { recursive: true });
          record(undefined);
          return send(200, { page });
        }
        if (req.method !== "POST") return send(405, { error: "POST or DELETE only" });
        // A page on another site can't send JSON without a preflight, which this server never answers.
        if (!String(req.headers["content-type"]).includes("application/json")) return send(415, { error: "JSON only" });
        let raw = "";
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", () => {
          try {
            const { name, text, data } = JSON.parse(raw) as { name?: unknown; text?: unknown; data?: unknown };
            if (typeof name !== "string") return send(400, { error: "Bad request" });
            let site: { files: SiteFile[]; index: string };
            if (/\.zip$/i.test(name) && typeof data === "string") {
              const zip = Buffer.from(data, "base64");
              if (zip.length > MAX_BYTES) return send(400, { error: "The file is over 20 MB." });
              site = pageOf(unzip(zip));
            } else if (/\.html?$/i.test(name) && typeof text === "string") {
              if (!text.trim()) return send(400, { error: "The file is empty." });
              if (Buffer.byteLength(text) > MAX_BYTES) return send(400, { error: "The file is over 20 MB." });
              site = { files: [{ path: "index.html", data: Buffer.from(text.replace(/^\uFEFF/, "")) }], index: "index.html" };
            } else {
              return send(400, { error: "Pick an HTML (.html) file or a zip of the page." });
            }
            const paths = new Set(site.files.map((f) => f.path));
            rmSync(dir, { recursive: true, force: true });
            for (const file of site.files) {
              const target = `${dir}${file.path}`;
              mkdirSync(dirname(target), { recursive: true });
              writeFileSync(target, /\.html?$/i.test(file.path) ? relativize(file.data.toString("utf8"), paths) : file.data);
            }
            // The frame always opens index.html: a zip's only page under another name gets one that sends it there.
            if (site.index !== "index.html") {
              writeFileSync(`${dir}index.html`, `<!doctype html><meta http-equiv="refresh" content="0; url=./${encodeURI(site.index)}">`);
            }
            record({
              name,
              kind: /\.zip$/i.test(name) ? "zip" : "html",
              files: site.files.length,
              addedAt: Date.now(),
              ...(folder === page ? {} : { folder }),
            });
            send(200, { page });
          } catch (error) {
            send(error instanceof SyntaxError ? 400 : 422, { error: (error as Error).message });
          }
        });
      });
    },
  };
}
