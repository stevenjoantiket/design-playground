import figma from "@figma/code-connect";

import { Radio } from "./Radio.js";

figma.connect(Radio, "<TDS>?node-id=1-2755", {
  props: {
    checked: figma.enum("State", {
      Selected: true,
      "Selected Disabled": true,
      Unselected: false,
      "Unselected Disabled": false,
    } as const),
    disabled: figma.enum("State", {
      "Selected Disabled": true,
      "Unselected Disabled": true,
    } as const),
    error: figma.enum("State", { Error: true } as const),
  },
  example: ({ checked, disabled, error }) => (
    <Radio name="group" checked={checked} disabled={disabled} error={error}>
      Label
    </Radio>
  ),
});
