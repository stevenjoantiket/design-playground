import { forwardRef, type InputHTMLAttributes } from "react";

import { cx } from "../utils/cx.js";

/** Figma: Control - 01 Selection - 03 Toggle, Size = Large | Small. */
export type ToggleSize = "large" | "small";

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  size?: ToggleSize;
  /** Required when there is no visible label next to the toggle. */
  "aria-label"?: string;
}

/**
 * Figma's `State` axis (Inactivated / Activated / …Disabled) maps onto the native
 * checkbox: checked and disabled. Rendering a real input keeps keyboard activation,
 * form participation and screen-reader semantics without reimplementing them.
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { size = "large", className, ...rest },
  ref,
) {
  return (
    <span className={cx("tds-toggle", className)} data-size={size}>
      <input ref={ref} type="checkbox" role="switch" className="tds-toggle__input" {...rest} />
      <span className="tds-toggle__track" aria-hidden="true">
        <span className="tds-toggle__handle" />
      </span>
    </span>
  );
});
