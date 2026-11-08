import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { Plugin } from "vite";

import { JOBS } from "../shared/jobs.js";

/** Only the skills the jobs name can be written; nothing else in the repo. */
const NAMES = new Set(JOBS.flatMap((job) => (job.skill ? [job.skill] : [])));
const MAX_BYTES = 200_000;

/** A skill's description, from its frontmatter. */
const describe = (text: string) => text.match(/^description:\s*(.+)$/m)?.[1]?.replace(/^["']|["']$/g, "") ?? "";

/**
 * Claude Code reads a skill's `name` and `description` from its frontmatter. Keeps the author's,
 * with `name` set to the folder; adds both when the file has none.
 */
function withFrontmatter(name: string, text: string, fallback: string): string {
  // Drops the byte-order mark some editors put at the start.
  const body = text.replace(/^\uFEFF/, "");
  const match = body.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return `---\nname: ${name}\ndescription: ${fallback}\n---\n\n${body.trimStart()}`;
  let head = match[1]!;
  head = /^name:/m.test(head) ? head.replace(/^name:.*$/m, `name: ${name}`) : `name: ${name}\n${head}`;
  if (!/^description:/m.test(head)) head += `\ndescription: ${fallback}`;
  return `---\n${head}\n---\n${body.slice(match[0].length)}`;
}

/**
 * Dev server only: the Jobs & skills page's editor. GET /api/skills lists the skills in
 * `.claude/skills` (name → description), GET /api/skills?name=<skill> answers with one's text;
 * POST /api/skills {name, text} saves one as
 * `.claude/skills/<name>/SKILL.md`, for a name the jobs use.
 */
export function skillFiles(): Plugin {
  const root = fileURLToPath(new URL("../../../.claude/skills/", import.meta.url));
  return {
    name: "skill-files",
    configureServer(server) {
      server.middlewares.use("/api/skills", (req, res) => {
        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };
        const list = () =>
          Object.fromEntries(
            (existsSync(root) ? readdirSync(root) : [])
              .filter((name) => existsSync(`${root}${name}/SKILL.md`))
              .map((name) => [name, describe(readFileSync(`${root}${name}/SKILL.md`, "utf8"))]),
          );
        if (req.method === "GET") {
          // ?name=<skill>: that skill's text, for the editor.
          const name = new URL(req.url ?? "", "http://x").searchParams.get("name");
          if (!name) return send(200, list());
          if (!NAMES.has(name) || !existsSync(`${root}${name}/SKILL.md`)) return send(404, { error: "No such skill" });
          return send(200, { text: readFileSync(`${root}${name}/SKILL.md`, "utf8") });
        }
        if (req.method !== "POST") return send(405, { error: "GET or POST only" });
        // A page on another site can't send JSON without a preflight, which this server never answers.
        if (!String(req.headers["content-type"]).includes("application/json")) return send(415, { error: "JSON only" });
        let raw = "";
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", () => {
          let input: { name?: unknown; text?: unknown };
          try {
            input = JSON.parse(raw);
          } catch {
            return send(400, { error: "Bad request" });
          }
          const { name, text } = input;
          if (typeof name !== "string" || !NAMES.has(name)) return send(400, { error: "Unknown skill" });
          if (typeof text !== "string" || !text.trim()) return send(400, { error: "The skill is empty" });
          if (Buffer.byteLength(text) > MAX_BYTES) return send(400, { error: "The skill is over 200 KB" });
          const job = JOBS.find((j) => j.skill === name)!;
          mkdirSync(`${root}${name}`, { recursive: true });
          writeFileSync(`${root}${name}/SKILL.md`, withFrontmatter(name, text, `How to do "${job.name}" in Krakatoa's board. ${job.skillTeaches}.`));
          send(200, list());
        });
      });
    },
  };
}
