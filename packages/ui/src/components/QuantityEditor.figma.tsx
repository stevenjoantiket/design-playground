import figma from "@figma/code-connect";

import { QuantityEditor, QuantityStepButton } from "./QuantityEditor.js";

/*
 * None of the four states on the multi-button set is a prop: Minimum and Maximum are the
 * value sitting on a bound, and Typing is the caret being in the field. Pass `min`/`max`
 * and all four are reachable.
 */
figma.connect(QuantityEditor, "<TDS>?node-id=1-2761", {
  props: {
    value: figma.string("Input Numeric"),
  },
  example: () => (
    <QuantityEditor aria-label="Guests" value={2} min={1} max={4} onChange={() => {}} />
  ),
});

figma.connect(QuantityStepButton, "<TDS>?node-id=1-2795", {
  props: {
    direction: figma.enum("Type", { Plus: "plus", Minus: "minus" } as const),
    disabled: figma.enum("Disabled", { True: true, False: false } as const),
  },
  example: ({ direction, disabled }) => (
    <QuantityStepButton direction={direction} disabled={disabled} aria-label="Increase" />
  ),
});
