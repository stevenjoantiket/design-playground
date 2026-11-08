import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cx } from "../utils/cx.js";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /**
   * The floating label. When the field has a value the label shrinks to 12px above the
   * value, which is Figma's `Filled` state; when empty it sits in place of the
   * placeholder, which is `Unfilled`.
   */
  label: string;
  helperText?: ReactNode;
  /** Figma: State = …Error. Recolors the border and the helper text. */
  error?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

/**
 * Figma states map as: Unfilled/Filled = has a value, Focused/Typing = `:focus-within`,
 * Disabled = the `disabled` attribute, Error = the `error` prop. Only the last one
 * needs to be passed in.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, helperText, error = false, startIcon, endIcon, className, id, disabled, value, defaultValue, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;

  return (
    <div
      className={cx("tds-field", className)}
      data-error={error ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
    >
      <div className="tds-field__box">
        {startIcon}
        <div className="tds-field__content">
          <label className="tds-field__label" htmlFor={inputId}>
            {label}
          </label>
          <input
            ref={ref}
            id={inputId}
            className="tds-field__input"
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={error || undefined}
            aria-describedby={helperText ? helperId : undefined}
            // Drives the floating label without JavaScript: an empty input matches
            // :placeholder-shown, a filled one does not.
            placeholder=" "
            {...rest}
          />
        </div>
        {endIcon}
      </div>
      {helperText ? (
        <span className="tds-field__helper" id={helperId}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
});
