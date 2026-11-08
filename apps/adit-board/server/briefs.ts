import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { Plugin } from "vite";

import { TASK_SKILL } from "../shared/jobs.js";

/** What Claude Code is asked to do with a saved brief, by the build step it comes from. */
const TASKS = {
  code: "Build the experiment brief in",
  figma: "Create the Figma design from the brief in",
  mixpanel: "Refresh the Mixpanel snapshot as described in",
  chart: "Add the Mixpanel chart described in",
  remove: "Remove the version described in",
  jira: "Sync the Jira task list as described in",
} as const;

/** `<project>/<version>`, e.g. `insurance/B-figma`. */
const KEY = /^[a-z][a-z0-9-]*\/[A-Za-z0-9-]+$/;

/** Where the hooks log a run's progress (`scripts/brief-progress.mjs`). */
const progressPath = (key: string) => `briefs/${key.replace("/", "-")}.progress.jsonl`;

/** Single-quoted for the shell; the repo lives under folders with spaces in their names. */
const sh = (text: string) => `'${text.replace(/'/g, `'\\''`)}'`;

/** Double-quoted for AppleScript. */
const as = (text: string) => `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

/**
 * Dev server only: POST /api/briefs {key, brief, kind, open?} saves an experiment's brief to
 * `briefs/<project>-<version>.md` at the repo root and answers with the `claude` command that
 * builds from it. With `open`, it also opens that command in a new Terminal window (macOS): an
 * ordinary interactive Claude Code session, where you approve each step as usual. Nothing runs
 * unattended, and the command is built here from `TASKS`, never from text the page sends.
 *
 * That session gets BRIEF_PROGRESS pointing at `briefs/<project>-<version>.progress.jsonl`, which
 * the repo's Claude Code hooks (`scripts/brief-progress.mjs`) append a line to per step.
 * GET /api/briefs/progress?key=… answers with its latest lines, for the sidebar to show.
 */
export function briefs(): Plugin {
  const root = fileURLToPath(new URL("../../..", import.meta.url));
  return {
    name: "briefs",
    configureServer(server) {
      server.middlewares.use("/api/briefs", (req, res) => {
        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };
        if (req.method === "GET" && req.url?.startsWith("/progress")) {
          const key = new URL(req.url, "http://x").searchParams.get("key") ?? "";
          if (!KEY.test(key)) return send(400, { error: "Bad key" });
          const file = `${root}${progressPath(key)}`;
          if (!existsSync(file)) return send(200, { lines: [] });
          const lines = readFileSync(file, "utf8")
            .trim()
            .split("\n")
            .flatMap((line) => {
              try {
                return [JSON.parse(line)];
              } catch {
                return [];
              }
            });
          return send(200, { lines: lines.slice(-6) });
        }
        if (req.method !== "POST") return send(405, { error: "POST only" });
        // A page on another site can't send JSON without a preflight, which this server never answers.
        if (!String(req.headers["content-type"]).includes("application/json")) return send(415, { error: "JSON only" });
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          let input: { key?: unknown; brief?: unknown; kind?: unknown; open?: unknown };
          try {
            input = JSON.parse(body);
          } catch {
            return send(400, { error: "Bad request" });
          }
          const { key, brief, kind, open } = input;
          if (typeof key !== "string" || !KEY.test(key)) return send(400, { error: "Bad key" });
          if (typeof brief !== "string" || !brief.trim() || brief.length > 200_000) return send(400, { error: "Bad brief" });
          if (typeof kind !== "string" || !Object.hasOwn(TASKS, kind)) return send(400, { error: "Bad kind" });

          const path = `briefs/${key.replace("/", "-")}.md`;
          mkdirSync(`${root}briefs`, { recursive: true });
          writeFileSync(`${root}${path}`, brief.trimEnd() + "\n");
          const progress = `${root}${progressPath(key)}`;
          // Names the job's skill (shared/jobs.ts), so Claude uses it once it exists in .claude/skills.
          const skill = TASK_SKILL[kind] ? ` If the ${TASK_SKILL[kind]} skill exists, use it.` : "";
          const command = `cd ${sh(root)} && BRIEF_PROGRESS=${sh(progress)} claude ${sh(`${TASKS[kind as keyof typeof TASKS]} ${path}.${skill}`)}`;
          if (open !== true) return send(200, { root, path, command });
          writeFileSync(progress, ""); // A new run starts with an empty log.

          if (process.platform !== "darwin") return send(200, { root, path, command, opened: false, error: "Opening Terminal works on macOS only." });
          const script = `tell application "Terminal"\n  activate\n  do script ${as(command)}\nend tell`;
          execFile("osascript", ["-e", script], (error) =>
            send(200, error ? { root, path, command, opened: false, error: "Couldn't open Terminal. Allow the dev server to control Terminal (System Settings → Privacy & Security → Automation), or copy the command." } : { root, path, command, opened: true }),
          );
        });
      });
    },
    // A saved brief is not part of the app; writing one must not reload the page.
    handleHotUpdate({ file }) {
      if (file.startsWith(`${root}briefs/`)) return [];
    },
  };
}
