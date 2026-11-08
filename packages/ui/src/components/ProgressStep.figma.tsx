import figma from "@figma/code-connect";

import { ProgressStep } from "./ProgressStep.js";

/*
 * Initial, Middle and End are where the strip has been scrolled to, which follows from
 * `current`. Nothing maps.
 */
figma.connect(ProgressStep, "<TDS-2>?node-id=55549-1790", {
  example: () => (
    <ProgressStep
      aria-label="Booking"
      current={0}
      steps={[
        { label: "Progress Title" },
        { label: "Progress Title" },
        { label: "Final Step", final: true },
      ]}
    />
  ),
});
