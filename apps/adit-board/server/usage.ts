import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import type { Plugin } from "vite";

type Window = { used_percentage?: number; resets_at?: number } | null | undefined;

/** A window still running: its share used (0-100) and when it resets (epoch ms), else null. */
function current(window: Window) {
  if (typeof window?.used_percentage !== "number") return null;
  const resetsAt = (window.resets_at ?? 0) * 1000;
  if (resetsAt && resetsAt < Date.now()) return null; // Reset since the save: what is used now is unknown, not 0.
  return { percent: window.used_percentage, resetsAt: resetsAt || null };
}

type Saved = { at: number; fiveHour: ReturnType<typeof current>; weekly: ReturnType<typeof current> };

/** ~/.claude/tixai-usage.json: tiket.com's own copy of the plan's usage, kept fresh on this Mac. */
function fromTixai(text: string): Saved {
  const data = JSON.parse(text);
  const window = (w?: { percent?: number; resets_at?: string }) =>
    current(w ? { used_percentage: w.percent, resets_at: w.resets_at ? Date.parse(w.resets_at) / 1000 : undefined } : null);
  return { at: Date.parse(data.at), fiveHour: window(data.session), weekly: window(data.weekly) };
}

/** ~/.claude/rate-limits.json: what `scripts/statusline.mjs` saved from a Terminal session. */
function fromStatusLine(text: string): Saved {
  const data = JSON.parse(text);
  return { at: data.at, fiveHour: current(data.five_hour), weekly: current(data.seven_day) };
}

/**
 * Dev server only: GET /api/usage answers with your Claude plan limits, the 5-hour and the weekly
 * window, as a share used, from whichever of the two files above was saved last. `at` is when;
 * null means neither exists yet. Nothing leaves the machine.
 */
export function usage(): Plugin {
  const sources = [
    [join(homedir(), ".claude", "tixai-usage.json"), fromTixai],
    [join(homedir(), ".claude", "rate-limits.json"), fromStatusLine],
  ] as const;
  return {
    name: "usage",
    configureServer(server) {
      server.middlewares.use("/api/usage", (_req, res) => {
        const latest = sources
          .flatMap(([file, read]) => {
            try {
              return [read(readFileSync(file, "utf8"))];
            } catch {
              return []; // Not saved yet, or unreadable.
            }
          })
          .sort((x, y) => y.at - x.at)[0];
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(latest ?? { at: null, fiveHour: null, weekly: null }));
      });
    },
  };
}
