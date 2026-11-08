# Payment prototype (shareable copy)

Payment + Experimentation only, copied from Design-Exp. Edits here never touch the main board.

- Dev:     `cd apps/adit-board && node node_modules/vite/bin/vite.js`  → http://localhost:5274/projects/payment/
- Build:   `cd apps/adit-board && node node_modules/vite/bin/vite.js build --outDir ../../dist --emptyOutDir`
- Deploy:  `cd payment-prototype && npx vercel@latest deploy --prod`  (uploads the prebuilt `dist/`; run Build first)
