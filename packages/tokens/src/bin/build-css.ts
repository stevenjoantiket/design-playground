import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderTokensCss } from "../css.js";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(outDir, { recursive: true });

const outFile = join(outDir, "tokens.css");
writeFileSync(outFile, renderTokensCss(), "utf8");

process.stdout.write(`@tiket-ds/tokens: wrote ${outFile}\n`);
