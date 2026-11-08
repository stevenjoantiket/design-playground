import figma from "@figma/code-connect";

import { TextField } from "./TextField.js";

/*
 * Figma has eight states because it has to draw every combination. In code only two of
 * them are props: Disabled and Error. Unfilled/Filled follow the value, Focused/Typing
 * follow real focus.
 */
figma.connect(TextField, "<TDS>?node-id=1-2916", {
  props: {
    label: figma.string("Input Title Text"),
    helperText: figma.boolean("Show Helper Text", {
      true: figma.string("Input Helper Text"),
      false: undefined,
    }),
    disabled: figma.enum("State", {
      "Unfilled Disabled": true,
      "Filled Disabled": true,
    } as const),
    error: figma.enum("State", {
      "Unfilled Error": true,
      "Filled Error": true,
    } as const),
    endIcon: figma.boolean("Show Icon", {
      true: figma.instance("Select Icon"),
      false: undefined,
    }),
  },
  example: ({ label, helperText, disabled, error, endIcon }) => (
    <TextField label={label} helperText={helperText} disabled={disabled} error={error} endIcon={endIcon} />
  ),
});
