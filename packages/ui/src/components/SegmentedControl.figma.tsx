import figma from "@figma/code-connect";

import { SegmentedControl } from "./SegmentedControl.js";

/*
 * Figma models the segment count with three booleans (Show 3rd/4th/5th Control) because
 * a variant set cannot hold an array. In code it is just the length of `options`.
 */
const example = (shape: "squircle" | "pill") =>
  function Example({ size }: { size: "medium" | "small" }) {
    return (
      <SegmentedControl
        aria-label="Label"
        shape={shape}
        size={size}
        value="one"
        onChange={() => {}}
        options={[
          { value: "one", label: "One" },
          { value: "two", label: "Two" },
        ]}
      />
    );
  };

const props = {
  size: figma.enum("Size", { Medium: "medium", Small: "small" } as const),
};

figma.connect(SegmentedControl, "<TDS>?node-id=1-2804", { props, example: example("squircle") });
figma.connect(SegmentedControl, "<TDS>?node-id=1-2817", { props, example: example("pill") });
