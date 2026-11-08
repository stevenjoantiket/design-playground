import figma from "@figma/code-connect";

import { Snackbar } from "./Snackbar.js";
import { Tabs } from "./Tabs.js";

// Both are plain components in Figma, not variant sets, so there are no props to map.
figma.connect(Tabs, "<TDS>?node-id=1-4088", {
  example: () => (
    <Tabs
      aria-label="Label"
      value="one"
      onChange={() => {}}
      items={[
        { value: "one", label: "Tab 1" },
        { value: "two", label: "Tab 2" },
      ]}
    />
  ),
});

figma.connect(Snackbar, "<TDS>?node-id=1-4094", {
  example: () => (
    <Snackbar action={<button type="button">Text Link</button>}>
      Subtext has no maximum line limit and no truncation.
    </Snackbar>
  ),
});
