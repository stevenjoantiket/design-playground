import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { Plugin } from "vite";

import { isProductProject } from "../shared/projects.js";
import { RESEARCH_COLORS, type ResearchColor } from "../shared/researchColors.js";

const MAX_BYTES = 500_000;


/** Only a name an upload could have made, so nothing outside `research/` can be named. */
const FILE_NAME = /^[a-z0-9]+(-[a-z0-9]+)*\.(md|html)$/;

/** "Checkout survey (Oct).md" → "checkout-survey-oct.md": the file's name in `research/`, its kind kept. */
const KIND = /\.(md|markdown|html?)$/i;
const slugOf = (name: string) =>
  name
    .replace(KIND, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const extOf = (name: string) => (/\.html?$/i.test(name) ? "html" : "md");

/**
 * Dev server only: the Research page's upload. POST /api/research/<project> {name, text} saves a
 * Markdown or HTML file as `projects/<project>/data/research/<slug>.md` (or `.html`) and answers {file}; the same
 * name again replaces it. DELETE /api/research/<project>?file=<name> removes one, by the exact name
 * an upload gave it. PATCH /api/research/<project> {file, color} sets a file's colour dot in
 * `projects/<project>/data/research/colors.json` ("" clears it). Only product projects (`PRODUCT_PROJECTS` in
 * `shared/projects.ts`) take uploads.
 */
export function researchFiles(): Plugin {
  const dirOf = (project: string) => fileURLToPath(new URL(`../projects/${project}/data/`, import.meta.url));
  return {
    name: "research-files",
    configureServer(server) {
      server.middlewares.use("/api/research", (req, res) => {
        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };
        const url = new URL(req.url ?? "", "http://x");
        const project = url.pathname.slice(1);
        if (!isProductProject(project)) return send(404, { error: "Unknown project" });
        const colorsFile = `${dirOf(project)}research/colors.json`;
        /** Sets or clears one file's colour, keeping the others; the file goes when the last colour does. */
        const setColor = (file: string, color: string) => {
          const colors: Record<string, string> = existsSync(colorsFile) ? JSON.parse(readFileSync(colorsFile, "utf8")) : {};
          if (color) colors[file] = color;
          else delete colors[file];
          if (Object.keys(colors).length) writeFileSync(colorsFile, JSON.stringify(colors, Object.keys(colors).sort(), 2) + "\n");
          else if (existsSync(colorsFile)) unlinkSync(colorsFile);
        };
        if (req.method === "DELETE") {
          const file = url.searchParams.get("file") ?? "";
          const path = `${dirOf(project)}research/${file}`;
          if (!FILE_NAME.test(file) || !existsSync(path)) return send(404, { error: "No such file" });
          unlinkSync(path);
          setColor(file, "");
          return send(200, { file });
        }
        if (req.method !== "POST" && req.method !== "PATCH") return send(405, { error: "POST, PATCH or DELETE only" });
        // A page on another site can't send JSON without a preflight, which this server never answers.
        if (!String(req.headers["content-type"]).includes("application/json")) return send(415, { error: "JSON only" });
        let raw = "";
        req.on("data", (chunk) => (raw += chunk));
        // A file that is malformed or mid-write must answer an error, not crash the dev server.
        const guard = (run: () => void) => {
          try {
            run();
          } catch (error) {
            send(500, { error: `Couldn't save it: ${(error as Error).message}` });
          }
        };
        req.on("end", () =>
          guard(() => {
          let input: { name?: unknown; text?: unknown; file?: unknown; color?: unknown };
          try {
            input = JSON.parse(raw);
          } catch {
            return send(400, { error: "Bad request" });
          }
          if (req.method === "PATCH") {
            const { file, color } = input;
            if (typeof file !== "string" || !FILE_NAME.test(file) || !existsSync(`${dirOf(project)}research/${file}`)) return send(404, { error: "No such file" });
            if (color !== "" && !RESEARCH_COLORS.includes(color as ResearchColor)) return send(400, { error: "Unknown colour" });
            setColor(file, color as string);
            return send(200, { file, color });
          }
          const { name, text } = input;
          if (typeof name !== "string" || !KIND.test(name)) return send(400, { error: "Pick a Markdown (.md) or HTML (.html) file." });
          const slug = slugOf(name);
          if (!slug) return send(400, { error: "The file needs a name with letters or numbers." });
          if (typeof text !== "string" || !text.trim()) return send(400, { error: "The file is empty." });
          if (Buffer.byteLength(text) > MAX_BYTES) return send(400, { error: "The file is over 500 KB." });
          mkdirSync(`${dirOf(project)}research`, { recursive: true });
          const file = `${slug}.${extOf(name)}`;
          writeFileSync(`${dirOf(project)}research/${file}`, text.replace(/^\uFEFF/, ""));
          send(200, { file });
        }));
      });
    },
  };
}
