import figma from "@figma/code-connect";

import { Accordion } from "./Accordion.js";

figma.connect(Accordion, "<TDS>?node-id=1-1460", {
  props: {
    type: figma.enum("Type", {
      Basic: "basic",
      Flat: "flat",
      Outline: "outline",
    } as const),
    // Figma's Initial/Expand is a drawn state; in code it is the starting value of a
    // component that manages its own open/closed state.
    defaultExpanded: figma.enum("State", { Expand: true, Initial: false } as const),
    children: figma.children("Add Slot Content"),
  },
  example: ({ type, defaultExpanded, children }) => (
    <Accordion title="Title has no max line limit" type={type} defaultExpanded={defaultExpanded}>
      {children}
    </Accordion>
  ),
});
