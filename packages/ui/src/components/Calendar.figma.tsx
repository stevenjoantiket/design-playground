import figma from "@figma/code-connect";

import { Calendar, CalendarHolidays, CalendarLegend, CalendarWeekdays } from "./Calendar.js";

/*
 * Eleven Figma sets, one component.
 *
 * Each set's `Type` — Unselected, Selecting Date, Range Single Month, Next Month, Range Multi
 * Month 1st/2nd — is a picture of a selection, not a variant of the component, so none of them
 * maps to a prop. What separates the sets is the axis the snippets below set: day or month
 * cells, and which of the four price treatments the vertical uses.
 *
 * The pieces inside a set — `.Calendar - Dates`, `.Calendar - Month`, `Number-General`,
 * `Number-Past`, `Price-General`, `Price-Selected`, `.Calendar - Selection` — have no
 * mappings: they are the cell and its parts, which `Calendar` draws from `entries`. A snippet
 * for one of them on its own would tell you to render a single cell, which is never the job.
 */

const RANGE = { start: "2026-06-05", end: "2026-06-16" } as const;

figma.connect(Calendar, "<TDS-2>?node-id=55549-4075", {
  example: () => (
    <Calendar
      selectionMode="range"
      value={RANGE}
      onValueChange={() => {}}
      today="2026-06-05"
      min="2026-06-05"
      from="2026-06"
    />
  ),
});

figma.connect(Calendar, "<TDS-2>?node-id=55549-3461", {
  example: () => (
    <Calendar
      selectionMode="range"
      priceDisplay="specific"
      value={RANGE}
      onValueChange={() => {}}
      entries={{ "2026-06-06": { price: "750K", cheapest: true } }}
      today="2026-06-05"
      min="2026-06-05"
      from="2026-06"
    />
  ),
});

/* Hide Price is the same grid for a vertical that has prices and has them switched off. */
figma.connect(Calendar, "<TDS-2>?node-id=55549-3768", {
  example: () => (
    <Calendar
      selectionMode="range"
      priceDisplay="hidden"
      value={RANGE}
      onValueChange={() => {}}
      today="2026-06-05"
      min="2026-06-05"
      from="2026-06"
    />
  ),
});

figma.connect(Calendar, "<TDS-2>?node-id=55549-4382", {
  example: () => (
    <Calendar
      precision="month"
      selectionMode="range"
      value={{ start: "2026-09", end: "2026-11" }}
      onValueChange={() => {}}
      today="2026-06"
      min="2026-06"
      from="2026"
    />
  ),
});

/* General Price is the dot: cheap or not, without a figure. */
figma.connect(Calendar, "<TDS-2>?node-id=55549-4478", {
  example: () => (
    <Calendar
      precision="month"
      priceDisplay="general"
      value="2026-09"
      onValueChange={() => {}}
      entries={{ "2026-09": { cheapest: true } }}
      today="2026-06"
      min="2026-06"
      from="2026"
    />
  ),
});

figma.connect(Calendar, "<TDS-2>?node-id=55549-4574", {
  example: () => (
    <Calendar
      precision="month"
      selectionMode="range"
      priceDisplay="specific"
      value={{ start: "2026-09", end: "2026-11" }}
      onValueChange={() => {}}
      entries={{ "2026-09": { price: "8.2M" }, "2026-10": { price: "8.7M" } }}
      today="2026-06"
      min="2026-06"
      from="2026"
    />
  ),
});

/*
 * `.Calendar - Attributes` is four unrelated strips in one set, so each Types value maps to
 * the piece it actually is. `Calendar` renders the first two itself — the header above its
 * months, a holiday strip under any month that has one — and they are exported for a screen
 * that needs to place them by hand.
 *
 * Mini Title Scrollig has no mapping: it is the month heading in its pinned state, which
 * `Calendar` draws with `position: sticky` rather than as a second element.
 */

figma.connect(CalendarWeekdays, "<TDS-2>?node-id=55549-3363", {
  variant: { Types: "Day" },
  example: () => <CalendarWeekdays />,
});

figma.connect(CalendarHolidays, "<TDS-2>?node-id=55549-3363", {
  variant: { Types: "Holiday" },
  example: () => (
    <CalendarHolidays
      items={[
        { day: 7, name: "Vesak day" },
        { day: 21, name: "Ascension day" },
      ]}
    />
  ),
});

figma.connect(CalendarLegend, "<TDS-2>?node-id=55549-3363", {
  variant: { Types: "Legend Price" },
  example: () => <CalendarLegend />,
});
