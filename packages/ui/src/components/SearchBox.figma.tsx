import figma from "@figma/code-connect";

import { SearchBox } from "./SearchBox.js";

/*
 * Unfilled / Focused / Typing / Filled are all runtime state, so only `size` maps to a
 * prop. The magnifier is intentionally not in the example: the `tds_ic_*` icon library
 * is not part of this Figma export, so the app supplies the glyph.
 */
figma.connect(SearchBox, "<TDS>?node-id=1-3857", {
  props: {
    size: figma.enum("Size", { Small: "small", Medium: "medium" } as const),
    placeholder: figma.string("Input Text"),
  },
  example: ({ size, placeholder }) => <SearchBox size={size} placeholder={placeholder} />,
});
