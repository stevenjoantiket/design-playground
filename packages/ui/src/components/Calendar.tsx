import { useMemo, type ReactNode } from "react";

import { cx } from "../utils/cx.js";

export type CalendarPrecision = "date" | "month";

export type CalendarSelectionMode = "single" | "range";

/**
 * Figma ships three date sets and three month sets that differ only in what sits under the
 * number:
 *
 * - `none` — `.Calendar - No Price` / `.Calendar - Month No Price`. No second line at all.
 * - `hidden` — `.Calendar - Hide Price`. The same cell, for a vertical that has prices but
 *   has them switched off. It renders identically to `none`; the two exist so a designer
 *   can say which of the two situations a screen is in.
 * - `specific` — `.Calendar - Specific Price` / `Month Specific Price`. The price itself.
 * - `general` — `.Calendar - Month General Price`. An 8px dot instead of a figure: green on
 *   the cheap days, invisible elsewhere, so the row keeps its height.
 */
export type CalendarPriceDisplay = "none" | "hidden" | "specific" | "general";

export interface CalendarRange {
  /** Inclusive. A key of the calendar's own precision: `2026-06-05` or `2026-06`. */
  start: string | null;
  end: string | null;
}

export interface CalendarEntry {
  /** The second line of the cell. Pre-formatted — Figma's cells read "100K", "6.5M". */
  price?: ReactNode;
  /** Figma's Cheapest cell: a green wash, a green bold price, and the legend's dot. */
  cheapest?: boolean;
  /** Figma's Sold Out number: struck through, and not selectable. */
  soldOut?: boolean;
  /** Turns the number red and lists the day in the strip under the grid. */
  holiday?: ReactNode;
  disabled?: boolean;
}

export interface CalendarProps {
  /** `date` renders day grids, `month` the month-per-year grids. */
  precision?: CalendarPrecision;
  selectionMode?: CalendarSelectionMode;
  /** A key for `single`, a `CalendarRange` for `range`. Controlled. */
  value?: string | CalendarRange | null;
  onValueChange?: (value: string | CalendarRange) => void;
  /**
   * The span rendered, inclusive. A month (`2026-06`) in date precision, a year (`2026`)
   * in month precision; longer keys are truncated. Defaults to twelve months from `today`,
   * or three years.
   */
  from?: string;
  to?: string;
  /**
   * Selectable bounds. Anything outside them draws as Figma's Past cell — grey, no price,
   * not clickable — so `min={today}` is what produces the greyed-out start of a travel
   * calendar.
   */
  min?: string;
  max?: string;
  /** Defaults to the real today. */
  today?: string;
  /** Keyed by day (`2026-06-05`) or month (`2026-06`), matching `precision`. */
  entries?: Readonly<Record<string, CalendarEntry>>;
  priceDisplay?: CalendarPriceDisplay;
  /** 0 = Sunday, as Figma's header reads. */
  weekStartsOn?: 0 | 1;
  locale?: string;
  /**
   * The caption above today's cell — "Today" by default.
   *
   * Month grids have none unless you ask for one: the cell supports it ("Current month"), but
   * every one of Figma's month sets ships with it switched off, and a caption wider than its
   * cell would land on the filled cell above rather than in the 8px between the rows.
   */
  todayLabel?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

const DAY_MS = 86_400_000;
/** A Sunday, so `+ n days` walks the week in the order Figma's header uses. */
const SUNDAY = Date.UTC(2024, 8, 1);

const pad = (value: number) => String(value).padStart(2, "0");
const monthKey = (year: number, month: number) => `${year}-${pad(month)}`;
const dayKey = (year: number, month: number, day: number) =>
  `${monthKey(year, month)}-${pad(day)}`;

const utc = (year: number, month: number, day = 1) => new Date(Date.UTC(year, month - 1, day));

const localToday = () => {
  const now = new Date();
  return dayKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
};

/** Trims a key to the width the precision compares at, so `min` can be given as a date. */
const clampKey = (key: string | undefined, width: number) => key?.slice(0, width);

function isSingle(value: CalendarProps["value"]): value is string {
  return typeof value === "string";
}

function asRange(value: CalendarProps["value"]): CalendarRange {
  if (value && typeof value === "object") return value;
  return { start: null, end: null };
}

export interface CalendarWeekdaysProps {
  weekStartsOn?: 0 | 1;
  locale?: string;
  className?: string;
}

/**
 * Figma: `.Calendar - Attributes`, Types = Day (55549:3364). Sunday is red, and the row
 * ends in a rule.
 *
 * It sits above the scrolling months rather than inside them, which is why `Calendar`
 * renders it outside its own scroll container.
 */
export function CalendarWeekdays({
  weekStartsOn = 0,
  locale,
  className,
}: CalendarWeekdaysProps) {
  const labels = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
    return Array.from({ length: 7 }, (_, index) => {
      const weekday = (weekStartsOn + index) % 7;
      return { weekday, label: format.format(new Date(SUNDAY + weekday * DAY_MS)) };
    });
  }, [locale, weekStartsOn]);

  return (
    <div className={cx("tds-calendar-weekdays", className)}>
      <div className="tds-calendar-weekdays__row">
        {labels.map(({ weekday, label }) => (
          <span
            className="tds-calendar-weekdays__day"
            key={weekday}
            data-sunday={weekday === 0 ? "true" : undefined}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="tds-calendar-weekdays__rule" />
    </div>
  );
}

export interface CalendarLegendProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Figma: `.Calendar - Attributes`, Types = Legend Price (55549:3382). The green swatch that
 * explains the green prices, on the sunken surface. Part of `.Calendar - BottomBar` in every
 * one of its four types.
 */
export function CalendarLegend({ children = "Cheapest price", className }: CalendarLegendProps) {
  return (
    <div className={cx("tds-calendar-legend", className)}>
      <span className="tds-calendar-legend__swatch" />
      <span className="tds-calendar-legend__label">{children}</span>
    </div>
  );
}

export interface CalendarHolidaysProps {
  items: readonly { day: ReactNode; name: ReactNode }[];
  className?: string;
}

/**
 * Figma: `.Calendar - Attributes`, Types = Holiday (55549:3374) — the month's red dates
 * spelled out, bullet-separated and scrolling sideways when there are too many.
 *
 * `Calendar` builds one per month out of the entries that carry a `holiday`, so the strip
 * cannot drift from the red numbers above it.
 */
export function CalendarHolidays({ items, className }: CalendarHolidaysProps) {
  return (
    <div className={cx("tds-calendar-holidays", className)}>
      {items.map((item, index) => (
        <span className="tds-calendar-holidays__item" key={index}>
          <span className="tds-calendar-holidays__day">{item.day}</span> {item.name}
        </span>
      ))}
    </div>
  );
}

interface CellState {
  key: string;
  label: ReactNode;
  entry?: CalendarEntry;
  today: boolean;
  alert: boolean;
  disabled: boolean;
  selected: boolean;
  inRange: boolean;
  bleedStart: boolean;
  bleedEnd: boolean;
  accessibleName: string;
}

/**
 * Figma: `.Calendar - Date` and `.Calendar - Month` (55549:3362).
 *
 * The eleven sets in that section are one component. Each set's Type — Unselected,
 * Selecting Date, Range Single Month, Next Month, Range Multi Month 1st/2nd, and the year
 * equivalents — is a picture of a value, not a style: they are all "what the grid looks
 * like when the range is here", so they fall out of `value` rather than being props.
 *
 * What is left as props is the axis Figma varies deliberately: day or month cells, one date
 * or a range, and which of the four price treatments the vertical uses.
 *
 * The range wash is painted by the cells rather than by the absolutely-placed
 * `.Calendar - Selection` rectangles Figma uses, so it cannot fall out of step with the
 * selection. Those rectangles bleed past the grid into the screen margin on the side the
 * range continues towards — the first row reaches the right edge, the row below starts at
 * the left one — and `data-bleed-*` reproduces exactly that: the margin is filled only
 * where the range carries on into the next row.
 */
export function Calendar({
  precision = "date",
  selectionMode = "single",
  value = null,
  onValueChange,
  from,
  to,
  min,
  max,
  today = localToday(),
  entries,
  priceDisplay = "none",
  weekStartsOn = 0,
  locale,
  todayLabel,
  className,
  "aria-label": ariaLabel,
}: CalendarProps) {
  const byMonth = precision === "month";
  const width = byMonth ? 7 : 10;

  const range = asRange(value);
  const selectedKey = isSingle(value) ? value : null;
  const rangeStart = clampKey(range.start ?? undefined, width) ?? null;
  const rangeEnd = clampKey(range.end ?? undefined, width) ?? null;
  const lower = clampKey(min, width);
  const upper = clampKey(max, width);
  const todayKey = clampKey(today, width) ?? "";
  const marker = todayLabel ?? (byMonth ? null : "Today");

  const formats = useMemo(
    () => ({
      monthTitle: new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      monthShort: new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }),
      full: new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    }),
    [locale],
  );

  const select = (key: string) => {
    if (!onValueChange) return;
    if (selectionMode === "single") {
      onValueChange(key);
      return;
    }
    if (!rangeStart || rangeEnd || key < rangeStart) {
      onValueChange({ start: key, end: null });
      return;
    }
    onValueChange({ start: rangeStart, end: key });
  };

  const describe = (
    key: string,
    column: number,
    { label, alert = false, accessibleName }: Pick<CellState, "label" | "accessibleName"> &
      Partial<Pick<CellState, "alert">>,
  ): CellState => {
    const entry = entries?.[key];
    const outOfBounds = (lower && key < lower) || (upper && key > upper);
    const disabled = Boolean(entry?.disabled || entry?.soldOut || outOfBounds);
    const inRange = Boolean(rangeStart && rangeEnd && key >= rangeStart && key <= rangeEnd);
    return {
      key,
      label,
      entry,
      today: key === todayKey,
      alert,
      disabled,
      selected: key === selectedKey || key === rangeStart || key === rangeEnd,
      inRange,
      bleedStart: inRange && !byMonth && column === 0 && key !== rangeStart,
      bleedEnd: inRange && !byMonth && column === 6 && key !== rangeEnd,
      accessibleName,
    };
  };

  const renderCell = (cell: CellState, kind: "day" | "month") => {
    const { entry } = cell;
    /* A day that cannot be booked does not advertise a cheap fare, however cheap it was. */
    const cheapest = Boolean(entry?.cheapest) && !cell.disabled;
    const showPill = kind === "day" && (cell.selected || cheapest);
    return (
      <button
        type="button"
        key={cell.key}
        className={cx("tds-calendar__cell", `tds-calendar__cell--${kind}`)}
        disabled={cell.disabled}
        aria-label={cell.accessibleName}
        aria-current={cell.today ? (kind === "day" ? "date" : "true") : undefined}
        aria-pressed={selectionMode === "single" ? cell.selected : undefined}
        data-selected={cell.selected ? "true" : undefined}
        data-in-range={cell.inRange ? "true" : undefined}
        data-cheapest={cheapest ? "true" : undefined}
        data-alert={cell.alert ? "true" : undefined}
        data-sold-out={entry?.soldOut ? "true" : undefined}
        data-bleed-start={cell.bleedStart ? "true" : undefined}
        data-bleed-end={cell.bleedEnd ? "true" : undefined}
        onClick={() => select(cell.key)}
      >
        {showPill ? <span className="tds-calendar__pill" /> : null}
        {cell.today && marker ? <span className="tds-calendar__marker">{marker}</span> : null}
        <span className="tds-calendar__value">{cell.label}</span>
        {priceDisplay === "specific" ? (
          // Kept even when there is nothing to put in it: Figma's sold-out cell holds an
          // empty price line so the rows either side of it stay on the same baseline.
          <span className="tds-calendar__price">{cell.disabled ? null : entry?.price}</span>
        ) : null}
        {priceDisplay === "general" ? (
          <span className="tds-calendar__dot" data-on={cheapest ? "true" : undefined} />
        ) : null}
      </button>
    );
  };

  const sections: ReactNode[] = [];

  if (byMonth) {
    const firstYear = Number((from ?? todayKey).slice(0, 4));
    const lastYear = Number((to ?? String(firstYear + 2)).slice(0, 4));
    for (let year = firstYear; year <= lastYear; year += 1) {
      const cells = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const key = monthKey(year, month);
        const cell = describe(key, index % 3, {
          label: formats.monthShort.format(utc(year, month)),
          accessibleName: formats.monthTitle.format(utc(year, month)),
        });
        return renderCell(cell, "month");
      });
      sections.push(
        <section className="tds-calendar__section" key={year}>
          <h3 className="tds-calendar__title">{year}</h3>
          <div className="tds-calendar__months">{cells}</div>
        </section>,
      );
    }
  } else {
    const start = (from ?? todayKey).slice(0, 7);
    let year = Number(start.slice(0, 4));
    let month = Number(start.slice(5, 7));
    const end =
      (to ?? monthKey(month === 1 ? year : year + 1, month === 1 ? 12 : month - 1)).slice(0, 7);

    while (monthKey(year, month) <= end) {
      const first = utc(year, month);
      const leading = (first.getUTCDay() - weekStartsOn + 7) % 7;
      const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const cells: ReactNode[] = [];
      const holidays: { day: ReactNode; name: ReactNode }[] = [];

      for (let index = 0; index < leading; index += 1) {
        cells.push(
          <span
            className="tds-calendar__cell tds-calendar__cell--day"
            key={`lead-${index}`}
            aria-hidden="true"
          />,
        );
      }

      for (let day = 1; day <= length; day += 1) {
        const key = dayKey(year, month, day);
        const holiday = entries?.[key]?.holiday;
        const column = (leading + day - 1) % 7;
        const weekday = (weekStartsOn + column) % 7;
        const cell = describe(key, column, {
          label: day,
          // The two things Figma's red number means.
          alert: weekday === 0 || Boolean(holiday),
          accessibleName: formats.full.format(utc(year, month, day)),
        });
        if (holiday) holidays.push({ day, name: holiday });
        cells.push(renderCell(cell, "day"));
      }

      sections.push(
        <section className="tds-calendar__section" key={monthKey(year, month)}>
          <h3 className="tds-calendar__title">{formats.monthTitle.format(first)}</h3>
          <div className="tds-calendar__grid">{cells}</div>
          {holidays.length > 0 ? <CalendarHolidays items={holidays} /> : null}
        </section>,
      );

      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
  }

  return (
    <div className={cx("tds-calendar", className)} data-precision={precision}>
      {byMonth ? null : <CalendarWeekdays weekStartsOn={weekStartsOn} locale={locale} />}
      <div className="tds-calendar__scroll" role="group" aria-label={ariaLabel}>
        {sections}
      </div>
    </div>
  );
}
