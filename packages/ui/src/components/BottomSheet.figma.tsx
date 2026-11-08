import figma from "@figma/code-connect";

import { BottomSheet } from "./BottomSheet.js";
import { Button } from "./Button.js";
import { SearchBox } from "./SearchBox.js";
import { WheelPicker } from "./WheelPicker.js";

/*
 * The two variants differ only in their body, so they map to the same shell with different
 * children. `open` and `onClose` have no counterpart in Figma — a frame is always open.
 */

figma.connect(BottomSheet, "<TDS>?node-id=1-2627", {
  variant: { "Property 1": "Bottom Sheet - Picker" },
  props: {
    title: figma.string("Input Title Text"),
  },
  example: ({ title }) => (
    <BottomSheet
      open
      onClose={() => {}}
      title={title}
      subtext="Subtext is limited to 2 lines."
      homeIndicator
      footer={<Button>Primary button</Button>}
    >
      <WheelPicker
        columns={[
          {
            label: "Day",
            options: [{ value: "12" }],
            value: "12",
            onChange: () => {},
          },
        ]}
      />
    </BottomSheet>
  ),
});

figma.connect(BottomSheet, "<TDS>?node-id=1-2627", {
  variant: { "Property 1": "Bottom Sheet - Searchable Lists" },
  props: {
    title: figma.string("Input Title Text"),
  },
  example: ({ title }) => (
    <BottomSheet
      open
      onClose={() => {}}
      title={title}
      link={<button type="button">Text Link</button>}
      homeIndicator
    >
      <SearchBox size="medium" placeholder="Search Box" />
      {/* One row per option — `Lists - 04 Image + Action` is still a todo. */}
    </BottomSheet>
  ),
});
