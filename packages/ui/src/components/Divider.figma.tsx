import figma from "@figma/code-connect";

import { Divider } from "./Divider.js";

/* Two Figma components, one prop. `Type = Light` is the only type either one ships. */

figma.connect(Divider, "<TDS>?node-id=1-2086", {
  example: () => <Divider />,
});

figma.connect(Divider, "<TDS>?node-id=1-2109", {
  example: () => <Divider orientation="vertical" />,
});
