import { useEffect, useRef, type ReactNode } from "react";

import { CheckBigIcon } from "../icons/index.js";
import { cx } from "../utils/cx.js";

export interface ProgressStepItem {
  label: ReactNode;
  /**
   * Draws a tick instead of a number. Figma's last step is labelled "Final Step" and
   * shows the glyph in all three of its states.
   */
  final?: boolean;
}

export interface ProgressStepProps {
  steps: readonly ProgressStepItem[];
  /** 0-based. Everything before it is complete, everything after it is still to come. */
  current: number;
  className?: string;
  "aria-label"?: string;
}

/**
 * Figma: Progress Step - Horizontal - 01 General (55549:1790),
 * State = Initial | Middle | End.
 *
 * Those three are scroll positions, not styles: the strip is one line of steps too wide
 * for a phone, and the state is whether the current step has reached the start, the middle
 * or the end of it. So the current step is scrolled into view here and the fades at both
 * edges are always on — they have nothing to hide when the strip fits.
 *
 * A completed step shows a tick rather than its own number, which is why the numbering you
 * see is the step's position, not a count of what is left.
 */
export function ProgressStep({
  steps,
  current,
  className,
  "aria-label": ariaLabel,
}: ProgressStepProps) {
  const strip = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const item = strip.current?.querySelector<HTMLElement>('[data-state="current"]');
    if (!strip.current || !item) return;
    strip.current.scrollLeft =
      item.offsetLeft - (strip.current.clientWidth - item.clientWidth) / 2;
  }, [current]);

  return (
    <div className={cx("tds-progress", className)}>
      <ol className="tds-progress__strip" ref={strip} aria-label={ariaLabel}>
        {steps.map((step, index) => {
          const state =
            index < current ? "complete" : index === current ? "current" : "upcoming";
          return (
            <li
              className="tds-progress__step"
              key={index}
              data-state={state}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span className="tds-progress__indicator">
                {state === "complete" || step.final ? <CheckBigIcon /> : index + 1}
              </span>
              <span className="tds-progress__label">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
