#!/usr/bin/env node
/**
 * Claude Code status line (set in ~/.claude/settings.json): shows your plan limits, and saves them
 * to ~/.claude/rate-limits.json for the side menu on Krakatoa's board (`apps/adit-board/server/usage.ts`).
 * Claude Code passes the limits on stdin only to a status line, for Pro and Max plans, once a
 * session has had its first reply.
 */
import { writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
let input = {};
try {
  input = JSON.parse(raw);
} catch {
  // Nothing usable; print an empty line below.
}

const limits = input.rate_limits;
if (limits && (limits.five_hour || limits.seven_day)) {
  try {
    writeFileSync(join(homedir(), ".claude", "rate-limits.json"), JSON.stringify({ at: Date.now(), ...limits }));
  } catch {
    // The status line still prints.
  }
}

const pct = (window) => (typeof window?.used_percentage === "number" ? `${Math.round(window.used_percentage)}%` : "–");
const model = input.model?.display_name ? `${input.model.display_name} · ` : "";
console.log(`${model}5h ${pct(limits?.five_hour)} · week ${pct(limits?.seven_day)}`);
