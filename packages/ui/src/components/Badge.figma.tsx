import figma from "@figma/code-connect";

import { Badge } from "./Badge.js";

const variant = figma.enum("Variant", {
  Red: "red",
  Green: "green",
  Grey: "grey",
} as const);

figma.connect(Badge, "<TDS>?node-id=1-1546", {
  props: { variant },
  example: ({ variant: v }) => <Badge kind="indicator" variant={v} />,
});

figma.connect(Badge, "<TDS>?node-id=1-1525", {
  props: {
    variant,
    gradient: figma.enum("Gradient", { True: true, False: false } as const),
    // Figma splits single- and double-digit into separate text props and a variant.
    // In code the digit count is derived from the number itself.
    count: figma.string("Input Double Digit"),
  },
  example: ({ variant: v, gradient }) => <Badge kind="number" variant={v} gradient={gradient} count={10} />,
});

figma.connect(Badge, "<TDS>?node-id=1-1550", {
  props: {
    variant,
    gradient: figma.enum("Gradient", { True: true, False: false } as const),
    children: figma.string("Input Text"),
  },
  example: ({ variant: v, gradient, children }) => (
    <Badge kind="text" variant={v} gradient={gradient}>
      {children}
    </Badge>
  ),
});
