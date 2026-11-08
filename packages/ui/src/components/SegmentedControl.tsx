import { type ReactNode } from "react";

import { cx } from "../utils/cx.js";

/** Figma: Control - 02 Segmented - 01 Squircle | 02 Pill. */
export type SegmentedShape = "squircle" | "pill";
/** Figma: Size = Medium | Small. */
export type SegmentedSize = "medium" | "small";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  shape?: SegmentedShape;
  size?: SegmentedSize;
  className?: string;
  /** Required — a segmented control is a labelled group of radios. */
  "aria-label": string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  shape = "squircle",
  size = "medium",
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cx("tds-segmented", className)}
      data-shape={shape}
      data-size={size}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          disabled={option.disabled}
          className="tds-segmented__item"
          data-selected={option.value === value ? "true" : undefined}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
