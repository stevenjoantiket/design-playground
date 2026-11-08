import type { CSSProperties } from "react";

import { cx } from "../utils/cx.js";

export interface SliderProps {
  /** `[start, end]`. The component keeps them in order for you. */
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  startLabel?: string;
  endLabel?: string;
  className?: string;
}

/**
 * Figma: Control - 01 Selection - 05 Slider (1:2780), State = Initial | Half | Focussed.
 * The description reads "Slider Range Picker" and every state draws two dots, so this is
 * a range, not a single value.
 *
 * Two stacked `input[type=range]` rather than divs and pointer maths: arrow keys, Home,
 * End, page keys, touch dragging and the value announcement all come from the platform,
 * and `Focussed` becomes `:focus-visible` instead of a variant nobody remembers to wire
 * up. Only the thumbs take pointer events, so the two inputs can overlap.
 *
 * The active track runs between the two thumb centres. Figma draws it edge to edge in
 * `Initial` and from the left thumb's centre in `Half`; those disagree, but only in the
 * 11px under each thumb, which the 22px thumb covers either way.
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  startLabel = "Minimum",
  endLabel = "Maximum",
  className,
}: SliderProps) {
  const [start, end] = value;
  const span = max - min || 1;
  const fraction = (raw: number) => (raw - min) / span;

  return (
    <span
      className={cx("tds-slider", className)}
      // Both thumbs sit at the same place when the range collapses. Lifting the start
      // thumb once the pair is past halfway keeps whichever one still has somewhere to go
      // on top, so a collapsed range is never a dead end.
      data-stacked={fraction(start) > 0.5 ? "start" : "end"}
      style={
        {
          "--tds-slider-start": fraction(start),
          "--tds-slider-end": fraction(end),
        } as CSSProperties
      }
    >
      <span className="tds-slider__rail" />
      <span className="tds-slider__fill" />
      <input
        type="range"
        className="tds-slider__input"
        data-thumb="start"
        min={min}
        max={max}
        step={step}
        value={start}
        aria-label={startLabel}
        onChange={(event) => onChange([Math.min(Number(event.target.value), end), end])}
      />
      <input
        type="range"
        className="tds-slider__input"
        data-thumb="end"
        min={min}
        max={max}
        step={step}
        value={end}
        aria-label={endLabel}
        onChange={(event) => onChange([start, Math.max(Number(event.target.value), start)])}
      />
    </span>
  );
}
