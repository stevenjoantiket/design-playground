import { useCallback, useRef, useState, type PointerEvent, type ReactNode } from "react";

import { ArrowRightIcon } from "../icons/index.js";
import { SmileLoadingIcon } from "../icons/loading.js";
import { cx } from "../utils/cx.js";

/**
 * Figma: `State`, minus the five it spends mid-gesture. `Pushed`, `On Drag half`,
 * `On Drag 96%` and `On Drag Full` are frames of one drag, and `Initial Disabled` is the
 * `disabled` attribute — so what is left as a prop is the three the caller decides.
 */
export type SlideButtonState = "idle" | "loading" | "complete";

export interface SlideButtonProps {
  /** Figma: Input Text. */
  children: ReactNode;
  /** Figma: Complete Text. Shown once `state` is `complete`. */
  completeLabel?: ReactNode;
  state?: SlideButtonState;
  disabled?: boolean;
  /** Fires once, when the handle reaches the far end. */
  onComplete?: () => void;
  className?: string;
}

/** Figma: On Drag 96% is already the end of the gesture — the last 4% is the snap. */
const COVERED_AT = 0.96;

/**
 * Figma: `Buttons - 07 Slide` (408:19535).
 *
 * A button you have to mean: the arrow is dragged the width of the track before anything
 * happens. Let go short of the end and it springs back, which is the whole point of using
 * one — it is for the actions that should be hard to do by accident.
 *
 * The handle is the button rather than the track, so a keyboard gets one deliberate target
 * to activate instead of a whole bar that fires on any stray click.
 */
export function SlideButton({
  children,
  completeLabel,
  state = "idle",
  disabled = false,
  onComplete,
  className,
}: SlideButtonProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const finish = useCallback(() => {
    setProgress(1);
    onComplete?.();
  }, [onComplete]);

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const track = trackRef.current;
    if (!track || !dragging) return;

    const { left, width } = track.getBoundingClientRect();
    // The handle is 40px wide inside 4px of padding, so it can only travel width - 48.
    const travel = width - 48;
    setProgress(travel <= 0 ? 0 : Math.min(Math.max(event.clientX - left - 24, 0) / travel, 1));
  };

  const release = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    if (progress >= COVERED_AT) finish();
    else setProgress(0);
  };

  if (state === "loading") {
    return (
      <div className={cx("tds-slide-button", className)} data-state="loading" aria-busy="true">
        <SmileLoadingIcon className="tds-slide-button__loader" />
      </div>
    );
  }

  if (state === "complete") {
    return (
      <div className={cx("tds-slide-button", className)} data-state="complete">
        <span className="tds-slide-button__label">{completeLabel ?? children}</span>
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className={cx("tds-slide-button", className)}
      data-state="idle"
      data-disabled={disabled ? "true" : undefined}
      data-dragging={dragging ? "true" : undefined}
      style={{ ["--tds-slide-progress" as string]: progress }}
    >
      <span className="tds-slide-button__shimmer" aria-hidden="true" />
      <span className="tds-slide-button__label">{children}</span>
      <div className="tds-slide-button__fill">
        <button
          type="button"
          className="tds-slide-button__handle"
          disabled={disabled}
          aria-label={typeof children === "string" ? children : undefined}
          onPointerDown={(event) => {
            if (disabled) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={move}
          onPointerUp={release}
          onPointerCancel={release}
          // Enter and Space reach the same end as a full drag. Without this the control is
          // only operable by pointer, which is not a trade the gesture is worth.
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            finish();
          }}
        >
          <ArrowRightIcon className="tds-slide-button__arrow" />
        </button>
      </div>
    </div>
  );
}
