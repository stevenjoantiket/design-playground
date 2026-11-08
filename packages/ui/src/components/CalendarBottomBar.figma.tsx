import figma from "@figma/code-connect";

import { Button } from "./Button.js";
import { CalendarLegend } from "./Calendar.js";
import {
  CalendarBottomBar,
  CalendarSummary,
  CalendarSummaryItem,
} from "./CalendarBottomBar.js";

/*
 * One frame, four fillings. Each Type keeps the same skeleton — legend, summary, button, home
 * indicator — and changes only what goes in the two summary columns, so the snippets differ
 * in their children rather than in a prop.
 */

figma.connect(CalendarBottomBar, "<TDS-2>?node-id=55549-3388", {
  variant: { Type: "Single Trip" },
  example: () => (
    <CalendarBottomBar
      legend={<CalendarLegend />}
      homeIndicator
      action={<Button>Primary button</Button>}
    >
      <CalendarSummary>
        <CalendarSummaryItem label="Departure" value="05 June 2026" />
        <CalendarSummaryItem
          align="end"
          label="Want great deals?"
          onDismiss={() => {}}
          value="Book Roundtrip"
        />
      </CalendarSummary>
    </CalendarBottomBar>
  ),
});

figma.connect(CalendarBottomBar, "<TDS-2>?node-id=55549-3388", {
  variant: { Type: "Roundtrip Trip" },
  example: () => (
    <CalendarBottomBar
      legend={<CalendarLegend />}
      homeIndicator
      action={<Button>Primary button</Button>}
    >
      <CalendarSummary>
        <CalendarSummaryItem label="Departure" value="05 June 2026" />
        <CalendarSummaryItem
          align="end"
          label="Want great deals?"
          onDismiss={() => {}}
          value="16 June 2026"
        />
      </CalendarSummary>
    </CalendarBottomBar>
  ),
});

/* Time is the only type that reads value-then-label. */
figma.connect(CalendarBottomBar, "<TDS-2>?node-id=55549-3388", {
  variant: { Type: "Time" },
  example: () => (
    <CalendarBottomBar
      legend={<CalendarLegend />}
      homeIndicator
      action={<Button>Primary button</Button>}
    >
      <CalendarSummary>
        <CalendarSummaryItem labelPlacement="bottom" label="Departure" value="12:00" />
        <CalendarSummaryItem
          align="end"
          labelPlacement="bottom"
          label="Return"
          value="12:00"
        />
      </CalendarSummary>
    </CalendarBottomBar>
  ),
});

figma.connect(CalendarBottomBar, "<TDS-2>?node-id=55549-3388", {
  variant: { Type: "Roundtrip with Duration" },
  example: () => (
    <CalendarBottomBar
      legend={<CalendarLegend />}
      homeIndicator
      top={<div>Place your local content here</div>}
      action={<Button>Primary button</Button>}
    >
      <CalendarSummary>
        <CalendarSummaryItem
          label="Start Date"
          onDismiss={() => {}}
          active
          value="05 June 2026"
        />
        <CalendarSummaryItem
          align="end"
          label="End Date"
          onDismiss={() => {}}
          value="Book Roundtrip"
        />
      </CalendarSummary>
    </CalendarBottomBar>
  ),
});
