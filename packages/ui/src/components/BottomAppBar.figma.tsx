import figma from "@figma/code-connect";

import { BottomAppBar } from "./BottomAppBar.js";
import { Button } from "./Button.js";

/*
 * Both of Figma's slots are marked "place your local contents here", so they map to
 * children rather than to anything the component decides.
 */
figma.connect(BottomAppBar, "<TDS-2>?node-id=55549-2485", {
  props: {
    scrolling: figma.boolean("Scrolling"),
    homeIndicator: figma.boolean("Show Inset"),
    top: figma.instance("Add Top Slot Content"),
    children: figma.instance("Add Inside Slot Content"),
  },
  example: ({ scrolling, homeIndicator, top, children }) => (
    <BottomAppBar scrolling={scrolling} homeIndicator={homeIndicator} top={top}>
      {children}
      <Button>Continue</Button>
    </BottomAppBar>
  ),
});
