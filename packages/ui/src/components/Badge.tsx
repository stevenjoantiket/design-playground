import { forwardRef, type HTMLAttributes } from "react";

import { cx } from "../utils/cx.js";

/** Figma: Variant = Red | Green | Grey. */
export type BadgeVariant = "red" | "green" | "grey";

interface BadgeBase extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  variant?: BadgeVariant;
}

export interface IndicatorBadgeProps extends BadgeBase {
  /** Figma: Badges - Indicator. A bare dot, no content. */
  kind: "indicator";
}

export interface NumberBadgeProps extends BadgeBase {
  /** Figma: Badges - Number. */
  kind: "number";
  count: number;
  /** Counts above this render as `{max}+`. */
  max?: number;
  /** Figma: Gradient = True. Grey has no gradient variant. */
  gradient?: boolean;
}

export interface TextBadgeProps extends BadgeBase {
  /** Figma: Badges - Text. */
  kind: "text";
  children: string;
  gradient?: boolean;
}

export type BadgeProps = IndicatorBadgeProps | NumberBadgeProps | TextBadgeProps;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const { kind, variant = "red", className, ...rest } = props as BadgeProps & {
    className?: string;
  };

  // Only Red and Green have gradient variants in Figma; Grey does not.
  const gradient =
    (kind === "number" || kind === "text") &&
    (props as NumberBadgeProps).gradient === true &&
    variant !== "grey";

  const shared = {
    ref,
    className: cx("tds-badge", className),
    "data-kind": kind,
    "data-variant": variant,
    "data-gradient": gradient ? "true" : undefined,
  };

  if (kind === "indicator") {
    const { kind: _kind, variant: _variant, ...domProps } = rest as IndicatorBadgeProps;
    return <span {...shared} {...domProps} />;
  }

  if (kind === "number") {
    const {
      kind: _kind,
      variant: _variant,
      count,
      max = 99,
      gradient: _gradient,
      ...domProps
    } = rest as NumberBadgeProps;
    const label = count > max ? `${max}+` : String(count);
    return (
      <span {...shared} data-single-digit={label.length === 1 ? "true" : undefined} {...domProps}>
        {label}
      </span>
    );
  }

  const {
    kind: _kind,
    variant: _variant,
    gradient: _gradient,
    children,
    ...domProps
  } = rest as TextBadgeProps;
  return (
    <span {...shared} {...domProps}>
      {children}
    </span>
  );
});
