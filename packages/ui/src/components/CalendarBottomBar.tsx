import type { ReactNode } from "react";

import { OvalCrossIcon } from "../icons/index.js";
import { cx } from "../utils/cx.js";
import { Inset } from "./Inset.js";

export interface CalendarSummaryItemProps {
  /** The small line: "Departure", "Start Date", "Want great deals?". */
  label?: ReactNode;
  /** The big line: a formatted date, a time, or a link. */
  value?: ReactNode;
  /** Right-hand items are right-aligned in every one of Figma's four types. */
  align?: "start" | "end";
  /** Figma's Time type puts the label under the value instead of over it. */
  labelPlacement?: "top" | "bottom";
  /** Paints the value blue, as Figma's Roundtrip with Duration does with its start date. */
  active?: boolean;
  /** Adds the ⓧ after the label. Figma dismisses a nudge or clears a date with it. */
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
}

export function CalendarSummaryItem({
  label,
  value,
  align = "start",
  labelPlacement = "top",
  active = false,
  onDismiss,
  dismissLabel = "Dismiss",
  className,
}: CalendarSummaryItemProps) {
  return (
    <div
      className={cx("tds-calendar-summary__item", className)}
      data-align={align}
      data-label-placement={labelPlacement}
    >
      <span className="tds-calendar-summary__label">
        {label}
        {onDismiss ? (
          <button
            type="button"
            className="tds-calendar-summary__dismiss"
            onClick={onDismiss}
            aria-label={dismissLabel}
          >
            <OvalCrossIcon />
          </button>
        ) : null}
      </span>
      <span className="tds-calendar-summary__value" data-active={active ? "true" : undefined}>
        {value}
      </span>
    </div>
  );
}

export interface CalendarSummaryProps {
  children?: ReactNode;
  className?: string;
}

/** The row of `CalendarSummaryItem`s above the bar's button. */
export function CalendarSummary({ children, className }: CalendarSummaryProps) {
  return <div className={cx("tds-calendar-summary", className)}>{children}</div>;
}

export interface CalendarBottomBarProps {
  /** Figma: the `Legend Price` strip, on every type. Pass `<CalendarLegend />`. */
  legend?: ReactNode;
  /** Figma's Roundtrip with Duration marks this "Dynamic Content" — a banner or a nudge. */
  top?: ReactNode;
  /** The summary. Usually a `CalendarSummary`. */
  children?: ReactNode;
  /** The full-width button group. */
  action?: ReactNode;
  homeIndicator?: boolean;
  className?: string;
}

/**
 * Figma: `.Calendar - BottomBar` (55549:3388), Type = Single Trip | Roundtrip Trip | Time |
 * Roundtrip with Duration.
 *
 * The four types are four fillings of one frame — legend, then a two-column summary, then a
 * full-width button, then the home indicator — so they are composed here rather than being
 * a `type` prop. Single Trip and Roundtrip differ only in whether the right-hand value is a
 * link or a second date; Time moves its labels under the values; Roundtrip with Duration
 * adds the banner slot and turns the start date blue.
 */
export function CalendarBottomBar({
  legend,
  top,
  children,
  action,
  homeIndicator = false,
  className,
}: CalendarBottomBarProps) {
  return (
    <div className={cx("tds-calendar-bottom-bar", className)}>
      {legend}
      {top ? <div className="tds-calendar-bottom-bar__top">{top}</div> : null}
      {children ? <div className="tds-calendar-bottom-bar__summary">{children}</div> : null}
      {action ? <div className="tds-calendar-bottom-bar__action">{action}</div> : null}
      {homeIndicator ? <Inset /> : null}
    </div>
  );
}
