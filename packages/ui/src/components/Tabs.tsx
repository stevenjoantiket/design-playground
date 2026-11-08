import { type ReactNode } from "react";

import { cx } from "../utils/cx.js";

export interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  /** Figma's tab slot has a badge position after the label. */
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label": string;
}

/**
 * Figma: Tabs - 01 General. The design draws 12 tab slots on a 360px frame, so the
 * strip scrolls horizontally rather than compressing tabs.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: TabsProps<T>) {
  return (
    <div className={cx("tds-tabs", className)} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          disabled={item.disabled}
          className="tds-tabs__tab"
          data-selected={item.value === value ? "true" : undefined}
          onClick={() => onChange(item.value)}
        >
          <span className="tds-tabs__body">
            {item.icon}
            <span className="tds-tabs__label">{item.label}</span>
            {item.badge}
          </span>
          <span className="tds-tabs__indicator" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
