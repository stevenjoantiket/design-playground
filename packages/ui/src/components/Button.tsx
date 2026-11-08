import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { SmileLoadingIcon } from "../icons/loading.js";
import { cx } from "../utils/cx.js";

/** Figma: Buttons - 01 Primary … 05 Alert. */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "invert" | "alert";
/** Figma: Size = Large | Medium | Small. */
export type ButtonSize = "large" | "medium" | "small";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Figma: State = 03 Loading. Swaps the label for the loading face, and blocks
   * interaction while keeping the button announced as busy.
   */
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  type?: "button" | "submit" | "reset";
}

/**
 * Figma variant `State` maps to real interaction rather than a prop:
 * `01 Enabled` is the resting style, `02 Pressed` is `:active`, `04 Disabled` is the
 * `disabled` attribute. Only `03 Loading` needs a prop, because nothing in the DOM
 * expresses it.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "large",
    loading = false,
    fullWidth = false,
    startIcon,
    endIcon,
    disabled,
    type = "button",
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("tds-button", className)}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      data-full-width={fullWidth ? "true" : undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <SmileLoadingIcon className="tds-button__loader" />
      ) : (
        <>
          {startIcon}
          <span className="tds-button__label">{children}</span>
          {endIcon}
        </>
      )}
    </button>
  );
});
