import type { ReactNode } from "react";

import { cx } from "../utils/cx.js";
import { Inset } from "./Inset.js";

export interface BottomAppBarProps {
  /**
   * The slot above the bar, outside its surface. Figma uses it for a nudge or banner that
   * rides along with the bar.
   */
  top?: ReactNode;
  /** The bar itself: a price summary and a button, a stepper, whatever the page needs. */
  children?: ReactNode;
  /** Figma: Scrolling = True. The bar lifts off the content passing under it. */
  scrolling?: boolean;
  homeIndicator?: boolean;
  className?: string;
}

/**
 * Figma: `Navigation - 04 Bottom App Bar` (55549:2485), Scrolling = False | True.
 *
 * Both of Figma's slots are marked "place your local contents here without detaching the
 * instance", so the component is the frame around them — surface, padding, elevation and
 * the home indicator — and everything visible is passed in.
 */
export function BottomAppBar({
  top,
  children,
  scrolling = false,
  homeIndicator = false,
  className,
}: BottomAppBarProps) {
  return (
    <div
      className={cx("tds-bottom-app-bar", className)}
      data-scrolling={scrolling ? "true" : undefined}
    >
      {top ? <div className="tds-bottom-app-bar__top">{top}</div> : null}
      <div className="tds-bottom-app-bar__content">{children}</div>
      {homeIndicator ? <Inset /> : null}
    </div>
  );
}
