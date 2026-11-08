import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from "react";

import { ChevronDownIcon } from "../icons/index.js";
import { cx } from "../utils/cx.js";

export interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helperText?: ReactNode;
  /** Figma: State = Unselected Error. */
  error?: boolean;
  /** Shown while nothing is selected, in place of the value. */
  placeholder?: string;
}

/**
 * Shares the field chrome with `TextField` (same box, same states) but wraps a native
 * `<select>`, so the platform's own picker is used — which on mobile is the correct
 * behaviour and matches the Figma bottom-sheet picker pattern.
 */
export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(function Dropdown(
  { label, helperText, error = false, placeholder, className, id, disabled, children, value, defaultValue, ...rest },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const helperId = `${selectId}-helper`;

  return (
    <div
      className={cx("tds-field", "tds-field--select", className)}
      data-error={error ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
    >
      <div className="tds-field__box">
        <div className="tds-field__content">
          <label className="tds-field__label" htmlFor={selectId}>
            {label}
          </label>
          <select
            ref={ref}
            id={selectId}
            className="tds-field__input"
            disabled={disabled}
            value={value}
            // Without this a `<select>` silently selects its first enabled option, so
            // the Unselected state in Figma could never actually render.
            defaultValue={value === undefined ? (defaultValue ?? "") : undefined}
            aria-invalid={error || undefined}
            aria-describedby={helperText ? helperId : undefined}
            {...rest}
          >
            <option value="" disabled>
              {placeholder ?? ""}
            </option>
            {children}
          </select>
        </div>
        <span className="tds-field__chevron" aria-hidden="true">
          <ChevronDownIcon />
        </span>
      </div>
      {helperText ? (
        <span className="tds-field__helper" id={helperId}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
});
