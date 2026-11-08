# Device chrome

Not part of the tiket icon set. These four vectors are the OS glyphs drawn inside the
status bar frame of `[SSoT] NFT` (node `408:17562`), exported from that frame and kept here
so `packages/ui/src/icons/status-bar.tsx` has a named file to transcribe from — the same
arrangement the `tds icon` drop has with `packages/ui/src/icons/index.tsx`.

| File | Figma layer | Size |
|---|---|---|
| `status_mobile_signal.svg` | Mobile Signal | 17 × 10.667 |
| `status_wifi.svg` | Wifi | 15.272 × 10.966 |
| `status_battery.svg` | Battery | 24.328 × 11.333 |
| `status_android_recents.svg` | Triangle | 12 × 10 |

Only the light-theme export is kept. Figma's dark variants are the same path data with the
fill swapped for white, which `currentColor` and a token handle instead.

Nothing outside `StatusBar` should reach for these. An app that needs a real icon takes it
from `tds icon/`.
