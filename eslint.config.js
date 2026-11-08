import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { URL } from "node:url";

/** The board's uploaded pages, `projects/<project>/pages/<page>/`, as each project's `data/page-code.json` lists them. */
function uploadedPages() {
  const projects = "apps/adit-board/projects";
  // Read beside this file, wherever eslint runs from; the patterns are relative to it too.
  const dir = new URL(`./${projects}/`, import.meta.url);
  return readdirSync(dir).flatMap((project) => {
    const manifest = new URL(`${project}/data/page-code.json`, dir);
    if (!existsSync(manifest)) return [];
    try {
      const pages = Object.entries(JSON.parse(readFileSync(manifest, "utf8")));
      // An upload replacing a built page sits beside it (`folder`, e.g. landing-upload); the built page is linted.
      return pages.map(([page, entry]) => `${projects}/${project}/pages/${entry.folder ?? page}/**`);
    } catch {
      return [];
    }
  });
}

export default tseslint.config(
  // Uploaded premade pages are someone else's built code, not ours to lint; built pages beside them are.
  { ignores: ["**/dist/**", "**/dist-types/**", "**/node_modules/**", ...uploadedPages()] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.mjs", "**/scripts/**/*.{js,ts}"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Code Connect examples are templates read by the Figma CLI, not runtime code.
    files: ["**/*.figma.tsx"],
    rules: { "@typescript-eslint/no-empty-function": "off" },
  },
);
