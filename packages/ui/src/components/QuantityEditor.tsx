import { forwardRef, type ButtonHTMLAttributes } from "react";

import { MinusIcon, PlusIcon } from "../icons/index.js";
import { cx } from "../utils/cx.js";

/** Figma: Control - 01 Selection - 04 Quantity Editor - 02 Single Button, Type = Plus | Minus. */
export type QuantityStepDirection = "plus" | "minus";

export interface QuantityStepButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> {
  direction: QuantityStepDirection;
}

/**
 * One 32px circle. Exported on its own because Figma ships it as its own component set,
 * and a passenger row that steps two counters at once uses it without the middle field.
 */
export const QuantityStepButton = forwardRef<HTMLButtonElement, QuantityStepButtonProps>(
  function QuantityStepButton({ direction, className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cx("tds-quantity__step", className)}
        data-direction={direction}
        {...rest}
      >
        {direction === "plus" ? <PlusIcon /> : <MinusIcon />}
      </button>
    );
  },
);

export interface QuantityEditorProps {
  value: number;
  onChange: (value: number) => void;
  /** Figma's `Minimum` state is this bound being reached, not a separate mode. */
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Names the number for a screen reader, e.g. "Adults". */
  "aria-label"?: string;
  decrementLabel?: string;
  incrementLabel?: string;
  className?: string;
}

/**
 * Figma: Control - 01 Selection - 04 Quantity Editor - 01 Multi Button (1:2761),
 * State = Filled | Typing | Minimum | Maximum.
 *
 * Only two of those four are really states: `Minimum` and `Maximum` are what the frame
 * looks like when a bound is reached and the button on that side goes flat, and `Typing`
 * is `Filled` with the caret in the field. So `min`/`max`/`value` produce all four, and
 * the field is a real input rather than a label — that is what makes `Typing` reachable,
 * and it lets someone type 9 instead of pressing + nine times.
 */
export function QuantityEditor({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  disabled = false,
  "aria-label": ariaLabel,
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
  className,
}: QuantityEditorProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className={cx("tds-quantity", className)} data-disabled={disabled ? "true" : undefined}>
      <QuantityStepButton
        direction="minus"
        aria-label={decrementLabel}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - step))}
      />
      <input
        className="tds-quantity__field"
        // `role="spinbutton"` rather than `type="number"`: the design has no stepper
        // chrome, and the browser's own arrows would sit on top of the two that Figma
        // draws. inputMode keeps the numeric keypad on mobile.
        role="spinbutton"
        inputMode="numeric"
        type="text"
        value={String(value)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max === Number.MAX_SAFE_INTEGER ? undefined : max}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value.replace(/\D/g, ""), 10);
          onChange(Number.isNaN(parsed) ? min : clamp(parsed));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            onChange(clamp(value + step));
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            onChange(clamp(value - step));
          }
        }}
      />
      <QuantityStepButton
        direction="plus"
        aria-label={incrementLabel}
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + step))}
      />
    </div>
  );
}
