import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import type { Plugin } from "vite";

import { isChartType } from "../shared/chartTypes.js";
import { isMixpanelLink } from "../shared/mixpanelLink.js";
import { isProductProject } from "../shared/projects.js";

/** A chart's file name without `.json`: the base-36 time it was added, so the files sort oldest first. */
const ID = /^[a-z0-9]+$/;

/**
 * Dev server only: the Mixpanel page's added charts. POST /api/mixpanel-charts/<project> {url}
 * saves `projects/<project>/data/mixpanel-charts/<id>.json` as `{report, addedAt, pending: true}` and answers
 * {id}; Claude Code then fills it in from the report. PATCH /api/mixpanel-charts/<project> {id, chart}
 * saves the chart type picked on the page (`CHART_TYPES`). DELETE /api/mixpanel-charts/<project>?id=<id>
 * removes one. Only product projects (`PRODUCT_PROJECTS` in `shared/projects.ts`) take charts.
 */
export function mixpanelCharts(): Plugin {
  const dirOf = (project: string) => fileURLToPath(new URL(`../projects/${project}/data/mixpanel-charts/`, import.meta.url));
  return {
    name: "mixpanel-charts",
    configureServer(server) {
      server.middlewares.use("/api/mixpanel-charts", (req, res) => {
        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };
        const url = new URL(req.url ?? "", "http://x");
        const project = url.pathname.slice(1);
        if (!isProductProject(project)) return send(404, { error: "Unknown project" });
        if (req.method === "DELETE") {
          const id = url.searchParams.get("id") ?? "";
          const path = `${dirOf(project)}${id}.json`;
          if (!ID.test(id) || !existsSync(path)) return send(404, { error: "No such chart" });
          unlinkSync(path);
          return send(200, { id });
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
          let input: { url?: unknown; id?: unknown; chart?: unknown };
          try {
            input = JSON.parse(raw);
          } catch {
            return send(400, { error: "Bad request" });
          }
          if (req.method === "PATCH") {
            const { id, chart } = input;
            const path = `${dirOf(project)}${id}.json`;
            if (typeof id !== "string" || !ID.test(id) || !existsSync(path)) return send(404, { error: "No such chart" });
            if (!isChartType(chart)) return send(400, { error: "Unknown chart type" });
            writeFileSync(path, JSON.stringify({ ...JSON.parse(readFileSync(path, "utf8")), chart }, null, 2) + "\n");
            return send(200, { id, chart });
          }
          if (typeof input.url !== "string" || !isMixpanelLink(input.url.trim())) return send(400, { error: "Paste a link to a Mixpanel report (https://mixpanel.com/…)." });
          const addedAt = Date.now();
          const id = addedAt.toString(36);
          mkdirSync(dirOf(project), { recursive: true });
          writeFileSync(`${dirOf(project)}${id}.json`, JSON.stringify({ report: input.url.trim(), addedAt, pending: true }, null, 2) + "\n");
          send(200, { id });
        }));
      });
    },
  };
}
