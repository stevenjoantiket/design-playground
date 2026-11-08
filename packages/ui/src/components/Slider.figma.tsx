import figma from "@figma/code-connect";

import { Slider } from "./Slider.js";

/*
 * Initial, Half and Focussed are all runtime: two thumb positions and which one has the
 * keyboard. So there is nothing to map — the example is the whole mapping.
 */
figma.connect(Slider, "<TDS>?node-id=1-2780", {
  example: () => (
    <Slider
      value={[0, 100]}
      onChange={() => {}}
      startLabel="Lowest price"
      endLabel="Highest price"
    />
  ),
});
