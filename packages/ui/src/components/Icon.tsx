import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cx } from "../utils/cx.js";
import { kebab } from "../utils/kebab.js";

export type IconColor =
  | "highEmphasis"
  | "lowEmphasis"
  | "disabled"
  | "invert"
  | "subtleInvert"
  | "lightInvert"
  | "active"
  | "alert"
  | "analytic"
  | "crossSell"
  | "positive"
  | "price"
  | "usp"
  | "staticWhite"
  | "staticBlack"
  | "inherit";

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Observed sizes in the design system: 16 inside search boxes, 20 inside form fields. */
  size?: 12 | 16 | 20 | 24 | 32;
  color?: IconColor;
  children: ReactNode;
}

/**
 * A fixed-size box for an SVG glyph.
 *
 * Still no bundled icon set, but the reason has changed: the `tds_ic_*` drop now lives in
 * `tds library/tds icon`, and a thousand files do not belong in a component library that
 * ships every export it declares. Pass the asset in. `src/icons/` holds only the handful
 * of glyphs the components draw themselves, and those are transcribed from that drop.
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  { size = 20, color = "inherit", className, style, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx("tds-icon", className)}
      data-color={kebab(color)}
      style={{ ...style, width: size, height: size }}
      {...rest}
    >
      {children}
    </span>
  );
});
