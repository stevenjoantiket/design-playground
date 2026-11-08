import figma from "@figma/code-connect";

import { WheelPicker } from "./WheelPicker.js";

/*
 * The frame draws three columns of static text with the middle row bold. In code the bold
 * row is the selected option and the columns are data, so the whole mapping is the shape
 * of that data.
 */
figma.connect(WheelPicker, "<TDS>?node-id=1-2146", {
  example: () => (
    <WheelPicker
      columns={[
        {
          label: "Day",
          options: Array.from({ length: 31 }, (_, index) => ({ value: String(index + 1) })),
          value: "12",
          onChange: () => {},
        },
        {
          label: "Month",
          options: [{ value: "Aug" }, { value: "Sep" }],
          value: "Aug",
          onChange: () => {},
        },
        {
          label: "Year",
          options: [{ value: "2026" }, { value: "2027" }],
          value: "2026",
          onChange: () => {},
        },
      ]}
    />
  ),
});
