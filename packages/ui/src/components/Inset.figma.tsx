import figma from "@figma/code-connect";

import { Inset } from "./Inset.js";

/*
 * Only the iOS swipe indicator is implemented. Android's navigation bar is a different
 * shape and the frames that draw one are not in this export, so `OS` and `Gesture` have no
 * counterpart in code — mapping them would promise variants that do not exist.
 */
figma.connect(Inset, "<TDS>?node-id=1-1611", {
  props: {
    transparent: figma.enum("Background", { Transparent: true, White: false } as const),
  },
  example: ({ transparent }) => <Inset transparent={transparent} />,
});
