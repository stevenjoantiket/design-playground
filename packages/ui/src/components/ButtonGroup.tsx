import { forwardRef, type HTMLAttributes } from "react";

import { cx } from "../utils/cx.js";
import { Inset } from "./Inset.js";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Figma: `Buttons - 06 Group - 01 Full Width` stacks buttons; `02 Side By Side`
   * places them on one row.
   */
  layout?: "stacked" | "sideBySide";
  /** Figma: Sticky = True. Pins the group to the bottom of the viewport. */
  sticky?: boolean;
  /**
   * Figma: Show Inset. The iOS home indicator, on the group's own surface below the
   * buttons — a sticky group is the last thing above it, so it owns that space.
   */
  homeIndicator?: boolean;
}

/**
 * Figma: `Buttons - 06 Group - 01 Full Width` (408:19510) and `02 Side By Side` (408:19521).
 *
 * The buttons are a row inside the group rather than its direct children, because the home
 * indicator shares the surface but not the padding.
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { layout = "stacked", sticky = false, homeIndicator = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("tds-button-group", className)}
      data-layout={layout}
      data-sticky={sticky ? "true" : undefined}
      {...rest}
    >
      <div className="tds-button-group__row">{children}</div>
      {homeIndicator ? <Inset /> : null}
    </div>
  );
});
