import figma from "@figma/code-connect";

import { Dropdown } from "./Dropdown.js";

figma.connect(Dropdown, "<TDS>?node-id=1-2981", {
  props: {
    label: figma.string("Input Title Text"),
    helperText: figma.boolean("Show Helper Text", {
      true: figma.string("Input Helper Text"),
      false: undefined,
    }),
    disabled: figma.enum("State", {
      "Unselected Disabled": true,
      "Selected Disabled": true,
    } as const),
    error: figma.enum("State", { "Unselected Error": true } as const),
  },
  example: ({ label, helperText, disabled, error }) => (
    <Dropdown label={label} helperText={helperText} disabled={disabled} error={error} placeholder="Choose one">
      <option value="a">Option A</option>
    </Dropdown>
  ),
});
