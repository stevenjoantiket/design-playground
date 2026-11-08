import figma from "@figma/code-connect";

import { Toggle } from "./Toggle.js";

figma.connect(Toggle, "<TDS>?node-id=1-2738", {
  props: {
    size: figma.enum("Size", { Large: "large", Small: "small" } as const),
    checked: figma.enum("State", {
      Activated: true,
      "Activated Disabled": true,
      Inactivated: false,
      "Inactivated Disabled": false,
    } as const),
    disabled: figma.enum("State", {
      "Activated Disabled": true,
      "Inactivated Disabled": true,
    } as const),
  },
  example: ({ size, checked, disabled }) => (
    <Toggle aria-label="Label" size={size} checked={checked} disabled={disabled} />
  ),
});
