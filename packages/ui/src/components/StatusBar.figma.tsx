import figma from "@figma/code-connect";

import { StatusBar } from "./StatusBar.js";

/*
 * Figma's `Theme` folds two things into one property: whether the glyphs are dark or white,
 * and whether the island is drawn. `Light No Dynamic Island` is `Light` with the island
 * switched off, so it maps to the pair of props rather than to a theme name — the island is
 * already its own boolean and `Show Dynamic Island` covers the other two variants.
 *
 * `Dark` here is a photograph behind the bar, not the library's dark theme, which is why
 * the prop is `invert`.
 */
figma.connect(StatusBar, "<NFT>?node-id=408-17562", {
  props: {
    platform: figma.enum("Platform", { IOS: "ios", Android: "android" } as const),
    invert: figma.enum("Theme", {
      Light: false,
      Dark: true,
      "Light No Dynamic Island": false,
      "Dark No Dynamic Island": true,
    } as const),
    dynamicIsland: figma.enum("Theme", {
      Light: true,
      Dark: true,
      "Light No Dynamic Island": false,
      "Dark No Dynamic Island": false,
    } as const),
  },
  example: ({ platform, invert, dynamicIsland }) => (
    <StatusBar platform={platform} invert={invert} dynamicIsland={dynamicIsland} />
  ),
});
