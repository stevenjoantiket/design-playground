import figma from "@figma/code-connect";

import { Tooltip } from "./Tooltip.js";

figma.connect(Tooltip, "<TDS>?node-id=1-4140", {
  props: {
    tail: figma.enum("Tail", {
      "↑ Up": "up",
      "↓ Down": "down",
      "← Left": "left",
      "→ Right": "right",
    } as const),
    children: figma.string("Input Text"),
  },
  example: ({ tail, children }) => <Tooltip tail={tail}>{children}</Tooltip>,
});
