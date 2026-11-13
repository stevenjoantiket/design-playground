import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/** Payment-only build for sharing: just the payment prototype + its Experimentation page, static. */
const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

/** The uploaded Success page (a zip unpacked in `pages/success/`) is loaded by URL in a frame, so the build copies it beside the project. */
const copyUploadedPages = () => {
  let out = "";
  return {
    name: "copy-uploaded-pages",
    configResolved(config: { root: string; build: { outDir: string } }) {
      out = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const from = fileURLToPath(new URL("projects/payment/pages/success", import.meta.url));
      if (out && existsSync(from)) cpSync(from, resolve(out, "projects/payment/pages/success"), { recursive: true });
    },
  };
};

export default defineConfig({
  plugins: [react(), copyUploadedPages()],
  server: { port: 5274 },
  optimizeDeps: { entries: ["projects/payment/index.html"] },
  build: {
    rolldownOptions: { input: { main: page("index.html"), payment: page("projects/payment/index.html"), beforeAfter: page("projects/payment/before-after/index.html") } },
    assetsInlineLimit: 0,
  },
});
