import { forwardRef, type HTMLAttributes } from "react";

import { cx } from "../utils/cx.js";

/**
 * Figma: Tail = ↑ Up | ← Left | → Right | ↓ Down. The name describes which edge the
 * tail sits on, i.e. `up` points at something above the tooltip.
 */
export type TooltipTail = "up" | "down" | "left" | "right";

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  tail?: TooltipTail;
}

/**
 * Presentational only — it renders the bubble, it does not position itself against a
 * trigger or manage hover/focus timing. Positioning belongs to the consuming app,
 * which knows its own scroll containers.
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { tail = "up", className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="tooltip" className={cx("tds-tooltip", className)} data-tail={tail} {...rest}>
      <span className="tds-tooltip__tail" aria-hidden="true" />
      <div className="tds-tooltip__bubble">{children}</div>
    </div>
  );
});
