/**
 * Fails the build if a component stylesheet hardcodes a color or a font family.
 *
 * This is the guardrail that keeps the library honest. Colors are the values most
 * likely to drift from Figma, and the drift is invisible in review — a `#007CFF`
 * looks identical to `var(--tds-bg-high-blue)` until the day the token changes and
 * one of them doesn't.
 *
 * Token definitions themselves are exempt; that is where raw values belong.
 */

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const styleDir = join(repoRoot, "packages/ui/src/styles");

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const FUNCTIONAL_COLOR = /\b(?:rgba?|hsla?|color-mix)\(/;
const FONT_FAMILY = /font-family\s*:/;

const ALLOWED_FONT_FAMILY = /font-family\s*:\s*(var\(--tds-font-family\)|inherit)\s*;/;

const failures = [];

for (const file of readdirSync(styleDir).filter((name) => name.endsWith(".css"))) {
  const path = join(styleDir, file);
  const lines = readFileSync(path, "utf8").split("\n");

  lines.forEach((line, index) => {
    const location = `${relative(repoRoot, path)}:${index + 1}`;
    const code = line.split("/*")[0] ?? line;

    if (HEX.test(code)) {
      failures.push(`${location}  hardcoded hex color — use a var(--tds-*) token\n    ${line.trim()}`);
    }
    if (FUNCTIONAL_COLOR.test(code)) {
      failures.push(`${location}  literal color function — use a var(--tds-*) token\n    ${line.trim()}`);
    }
    if (FONT_FAMILY.test(code) && !ALLOWED_FONT_FAMILY.test(code)) {
      failures.push(
        `${location}  font-family must be var(--tds-font-family) or inherit\n    ${line.trim()}`,
      );
    }
  });
}

// Krakatoa's board: the portal (menu, panels, portal pages) has its own style; the Tiket design system
// is for the mockups only. Portal CSS reads no TDS token or class; portal-only code imports no TDS.
const board = join(repoRoot, "apps/adit-board");
const PORTAL_CSS = ["shared/portal.css", "shared/side-menu.css", "shared/panel.css", "shared/research-page.css", "shared/mixpanel-page.css", "shared/build-step.css", "shared/page-code.css", "portal/home/board.css", "portal/skills/skills.css", "portal/project/project.css"];
// ponytail: SideMenu, panel.tsx and UxPanel still wrap mockup pieces in a TiketProvider, so they are not listed.
const PORTAL_CODE = ["shared/portal.tsx", "shared/MixpanelPage.tsx", "shared/ResearchPage.tsx", "shared/BuildStep.tsx", "shared/BlankProject.tsx", "shared/ChartTypeIcon.tsx", "shared/FigmaFiles.tsx", "shared/PageCode.tsx", "portal/home/App.tsx", "portal/skills/App.tsx", "portal/project/App.tsx"];
for (const [files, bad, why] of [
  [PORTAL_CSS, /--tds-|\.tds-/, "portal CSS uses a Tiket design system token or class — use --portal-* (shared/portal.css)"],
  [PORTAL_CODE, /from "@tiket-ds\/ui"/, "portal code imports @tiket-ds/ui — use shared/portal.tsx"],
]) {
  for (const file of files) {
    // Comments blanked out, line breaks kept, so a note that names a TDS token doesn't count.
    readFileSync(join(board, file), "utf8")
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, (comment) => comment.replace(/[^\n]/g, " "))
      .split("\n")
      .forEach((line, index) => {
        if (bad.test(line)) failures.push(`apps/adit-board/${file}:${index + 1}  ${why}\n    ${line.trim()}`);
      });
  }
}

if (failures.length > 0) {
  process.stderr.write(`\ncheck-tokens found ${failures.length} violation(s):\n\n`);
  process.stderr.write(`${failures.join("\n\n")}\n\n`);
  process.exit(1);
}

process.stdout.write("check-tokens: no hardcoded colors or font families in component CSS; no Tiket styles in the board's portal\n");
