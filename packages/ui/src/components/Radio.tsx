import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cx } from "../utils/cx.js";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Figma: State = Error. Combines with checked/disabled rather than replacing them. */
  error?: boolean;
  children?: ReactNode;
}

/**
 * Figma draws the selected state as a 6px ring rather than a separate dot element, so
 * that is how it is built here — `border-width` carries the selection.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { error = false, className, children, id, ...rest },
  ref,
) {
  return (
    <label className={cx("tds-radio", className)} data-error={error ? "true" : undefined} htmlFor={id}>
      <input
        ref={ref}
        id={id}
        type="radio"
        className="tds-radio__input"
        aria-invalid={error || undefined}
        {...rest}
      />
      <span className="tds-radio__control" aria-hidden="true" />
      {children ? <span className="tds-radio__label">{children}</span> : null}
    </label>
  );
});
