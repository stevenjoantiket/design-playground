import type { HTMLAttributes } from "react";

import { cx } from "../utils/cx.js";

/**
 * Figma: `Divider - Horizontal` (1:2086) and `Divider - Vertical` (1:2109), both with a
 * single `Type = Light` variant.
 */
export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
}

/**
 * A 1px rule. Figma places it as an explicit instance rather than as a border on the
 * thing above it, and that is worth copying: inside a search form or a sheet the rule is
 * inset from the container's padding, which a border can't be.
 *
 * The vertical one takes its height from the row it sits in, so it needs a parent with
 * `align-items: stretch` — `SearchFormField` is one.
 */
export function Divider({ orientation = "horizontal", className, ...rest }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cx("tds-divider", className)}
      data-orientation={orientation}
      {...rest}
    />
  );
}
