import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Payment-only build for sharing: just the payment prototype + its Experimentation page, static. */
const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: { port: 5274 },
  optimizeDeps: { entries: ["projects/payment/index.html"] },
  build: {
    rolldownOptions: { input: { main: page("index.html"), payment: page("projects/payment/index.html"), beforeAfter: page("projects/payment/before-after/index.html") } },
    assetsInlineLimit: 0,
  },
});
