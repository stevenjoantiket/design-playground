#!/usr/bin/env node
/**
 * Claude Code hook (see .claude/settings.json): turns a session's events into one progress line
 * each, for the "Open in Claude Code" step in the prototype sidebar to show.
 *
 * Only a session the sidebar opened has BRIEF_PROGRESS set (to the progress file `briefs.ts`
 * named); in every other session this exits at once and writes nothing. It never blocks Claude.
 */
import { appendFileSync } from "node:fs";
import { basename } from "node:path";

const file = process.env.BRIEF_PROGRESS;
if (!file) process.exit(0);

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
let event;
try {
  event = JSON.parse(raw);
} catch {
  process.exit(0);
}

/** What a tool call is doing, in a few words. */
function describe(tool, input = {}) {
  const file = typeof input.file_path === "string" ? basename(input.file_path) : "";
  if (tool === "Read") return `Reading ${file}`;
  if (tool === "Edit" || tool === "MultiEdit") return `Editing ${file}`;
  if (tool === "Write") return `Writing ${file}`;
  if (tool === "Bash") return `Running ${String(input.command ?? "").split("\n")[0].slice(0, 60)}`;
  if (tool === "Grep" || tool === "Glob") return "Searching the code";
  if (tool === "ToolSearch") return "Loading tools";
  const figma = tool.match(/^mcp__claude_ai_Figma__(.+)$/)?.[1];
  if (figma === "use_figma") return `Figma: ${String(input.description ?? "editing the file").slice(0, 80)}`;
  if (figma === "get_figma_skill") return "Figma: loading guidance";
  if (figma === "search_design_system") return "Figma: searching the design system";
  if (figma === "get_screenshot") return "Figma: checking a screenshot";
  if (figma) return `Figma: ${figma.replaceAll("_", " ")}`;
  if (/^mcp__claude_ai_Atlassian/.test(tool)) return "Reading the Atlassian ticket";
  return tool.replace(/^mcp__claude_ai_/, "").replaceAll("__", ": ");
}

/** state: working while tools run, waiting when Claude needs you, idle after it answers, closed at exit. */
const line = (() => {
  switch (event.hook_event_name) {
    case "PreToolUse":
      return { state: "working", text: describe(event.tool_name ?? "", event.tool_input) };
    case "UserPromptSubmit":
      return { state: "working", text: "Working on your reply" };
    case "Notification":
      return { state: "waiting", text: String(event.message ?? "Claude needs you in Terminal") };
    case "Stop":
      return { state: "idle", text: "Claude replied. Check Terminal for the summary or a question." };
    case "SessionEnd":
      return { state: "closed", text: "Session closed" };
    default:
      return null;
  }
})();

if (line) appendFileSync(file, JSON.stringify({ t: Date.now(), ...line }) + "\n");
