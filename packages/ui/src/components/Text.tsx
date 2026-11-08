import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import type { TypographyToken } from "@tiket-ds/tokens";

import { cx } from "../utils/cx.js";
import { kebab } from "../utils/kebab.js";

export type TextColor =
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
  | "staticBlack";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** A token from the Figma type ramp. */
  variant?: TypographyToken;
  color?: TextColor;
  as?: ElementType;
  /** Clamp to n lines with an ellipsis. */
  lineClamp?: number;
}

/**
 * The only sanctioned way to render type. Every size/weight/line-height combination
 * comes from a named token — there is no free-form `fontSize` prop by design.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { variant = "body2", color = "highEmphasis", as, lineClamp, className, style, ...rest },
  ref,
) {
  const Component = (as ?? "span") as ElementType;

  return (
    <Component
      ref={ref}
      className={cx("tds-text", className)}
      data-variant={kebab(variant)}
      data-color={kebab(color)}
      style={
        lineClamp
          ? { ...style, ["--tds-line-clamp" as string]: String(lineClamp) }
          : style
      }
      data-clamped={lineClamp ? "true" : undefined}
      {...rest}
    />
  );
});
