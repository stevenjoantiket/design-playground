import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cx } from "../utils/cx.js";

/** Figma: Labels - 01 Primary | 02 Secondary | 03 Ribbon | 04 Multi. */
export type LabelKind = "primary" | "secondary" | "ribbon" | "multi";
/** Figma: Size = Medium | Small. Only Primary has two sizes. */
export type LabelSize = "medium" | "small";

/**
 * Figma documents five tones per kind, and not the same five: Primary has Neutral, Green,
 * Blue, Yellow and Red; Secondary and Ribbon have Red, Green, Blue, Orange and Violet;
 * Multi drops Violet. The rest come from the documented semantic pairs, which exist
 * independently of the label component.
 *
 * `violet` is gradient only — it ships as a single gradient variant with no solid fill, so
 * it ignores `gradient={false}`.
 */
export type LabelTone =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "neutral"
  | "magenta"
  | "orange"
  | "purple"
  | "violet"
  | "turquoise";

export interface LabelProps extends HTMLAttributes<HTMLSpanElement> {
  kind?: LabelKind;
  size?: LabelSize;
  tone?: LabelTone;
  /** Figma: Gradient = True. Not offered by Primary. */
  gradient?: boolean;
  startIcon?: ReactNode;
  /** Figma: Icon Size = 16px | 12px, on Secondary. Multi is always 12. */
  iconSize?: 12 | 16;
  /**
   * The slot Figma fills with a `Countdown - 01 Unboxed` instance, inline after the text
   * and in the same colour. Any node works — it is a slot, not a timer.
   */
  countdown?: ReactNode;
  /** Multi's second segment, e.g. "100%". Ignored by the other kinds. */
  extra?: ReactNode;
  extraIcon?: ReactNode;
}

export const Label = forwardRef<HTMLSpanElement, LabelProps>(function Label(
  {
    kind = "primary",
    size = "medium",
    tone = "red",
    gradient = false,
    startIcon,
    iconSize,
    countdown,
    extra,
    extraIcon,
    className,
    children,
    ...rest
  },
  ref,
) {
  const icon = startIcon ? (
    <span className="tds-label__icon" data-size={iconSize}>
      {startIcon}
    </span>
  ) : null;

  return (
    <span
      ref={ref}
      className={cx("tds-label", className)}
      data-kind={kind}
      data-size={size}
      data-tone={tone}
      data-gradient={kind !== "primary" && (gradient || tone === "violet") ? "true" : undefined}
      {...rest}
    >
      {/*
       * Multi is two chips that overlap, so it needs the extra element. The other kinds
       * stay flat — a wrapper nobody styles is a wrapper that gets in the way of `gap`.
       */}
      {kind === "multi" ? (
        <>
          <span className="tds-label__pill">
            {icon}
            {children}
            {countdown}
          </span>
          <span className="tds-label__extra">
            {extraIcon ? <span className="tds-label__icon" data-size={12}>{extraIcon}</span> : null}
            {extra}
          </span>
        </>
      ) : (
        <>
          {icon}
          {children}
          {countdown}
        </>
      )}
    </span>
  );
});
