import figma from "@figma/code-connect";

import { SlideButton } from "./SlideButton.js";

/*
 * Eight Figma states, three props. `Pushed`, `On Drag half`, `On Drag 96%` and
 * `On Drag Full` are four frames of one gesture — the component runs it from pointer
 * events, so mapping them would offer a designer a prop for something they cannot set.
 * `Initial Disabled` is the `disabled` attribute, as it is on `Button`.
 */
figma.connect(SlideButton, "<NFT>?node-id=408-19535", {
  props: {
    label: figma.string("Input Text"),
    completeLabel: figma.string("Complete Text"),
    state: figma.enum("State", {
      Initial: "idle",
      Loading: "loading",
      Complete: "complete",
    } as const),
    disabled: figma.enum("State", { "Initial Disabled": true } as const),
  },
  example: ({ label, completeLabel, state, disabled }) => (
    <SlideButton state={state} disabled={disabled} completeLabel={completeLabel}>
      {label}
    </SlideButton>
  ),
});
