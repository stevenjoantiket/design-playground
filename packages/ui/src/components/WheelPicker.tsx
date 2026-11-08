import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

import { cx } from "../utils/cx.js";

export interface WheelPickerOption {
  value: string;
  label?: ReactNode;
}

export interface WheelPickerColumn {
  /** The bold heading above the column — "Day", "Month", "Year". */
  label?: ReactNode;
  options: readonly WheelPickerOption[];
  value: string;
  onChange: (value: string) => void;
  /** Needed when the column has no visible `label`. */
  "aria-label"?: string;
}

export interface WheelPickerProps {
  columns: readonly WheelPickerColumn[];
  className?: string;
}

/**
 * Figma: the `Type = Date` wheel (1:2146) that fills the Picker bottom sheet (1:2626).
 *
 * Each column scrolls independently and the selection is whatever sits in the band across
 * the middle, which is why the middle row is the bold one in the frame — that is the
 * selected state, not a per-cell style.
 *
 * Two departures from the frame, both because it is a static mock of something that
 * moves: every row here is the same height, since a wheel can only snap if its rows are
 * uniform (Figma draws the middle row 8px shorter), and the keyboard follows the listbox
 * pattern — one tab stop per column, arrows to move — rather than making all 30-odd
 * options tabbable.
 */
export function WheelPicker({ columns, className }: WheelPickerProps) {
  const scrollers = useRef<(HTMLDivElement | null)[]>([]);
  const selected = columns.map((column) => column.value).join("\u0000");

  // Centre the selected row in the band whenever it changes, including on mount.
  useEffect(() => {
    scrollers.current.forEach((scroller) => {
      const option = scroller?.querySelector<HTMLElement>('[data-selected="true"]');
      if (!scroller || !option) return;
      scroller.scrollTop =
        option.offsetTop - (scroller.clientHeight - option.clientHeight) / 2;
    });
  }, [selected]);

  const move = (column: WheelPickerColumn, offset: number) => {
    const index = column.options.findIndex((option) => option.value === column.value);
    const next = column.options[Math.min(column.options.length - 1, Math.max(0, index + offset))];
    if (next) column.onChange(next.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, column: WheelPickerColumn) => {
    const steps: Record<string, number> = {
      ArrowUp: -1,
      ArrowDown: 1,
      PageUp: -5,
      PageDown: 5,
    };
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const edge = event.key === "Home" ? column.options[0] : column.options.at(-1);
      if (edge) column.onChange(edge.value);
      return;
    }
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    move(column, step);
  };

  return (
    <div className={cx("tds-wheel", className)}>
      <div className="tds-wheel__titles">
        {columns.map((column, index) => (
          <p className="tds-wheel__title" key={index}>
            {column.label}
          </p>
        ))}
      </div>
      <div className="tds-wheel__columns">
        {columns.map((column, index) => (
          <div
            key={index}
            ref={(node) => {
              scrollers.current[index] = node;
            }}
            className="tds-wheel__scroll"
            role="listbox"
            tabIndex={-1}
            aria-label={column["aria-label"]}
            onKeyDown={(event) => onKeyDown(event, column)}
          >
            {column.options.map((option) => {
              const isSelected = option.value === column.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  // Roving tabindex: the column is one stop, arrows move within it.
                  tabIndex={isSelected ? 0 : -1}
                  className="tds-wheel__option"
                  data-selected={isSelected ? "true" : undefined}
                  onClick={() => column.onChange(option.value)}
                >
                  {option.label ?? option.value}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
