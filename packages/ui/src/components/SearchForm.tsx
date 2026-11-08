import type { ButtonHTMLAttributes, ReactNode } from "react";

import { UpDownIcon } from "../icons/index.js";
import { cx } from "../utils/cx.js";

export interface SearchFormProps {
  children: ReactNode;
  /**
   * The floating reverse button, for the `Reversible` sets. Pass
   * `<SearchFormSwapButton />`; it is positioned over the seam between the two fields.
   */
  swap?: ReactNode;
  className?: string;
}

/**
 * Figma: the `Forms - 05 Search Form` family — `01 Group` (1:3170), `02 Reversible - 01
 * General` (55547:766) and `02 With Subtitle` (55547:801), `03 With Toggle` (55547:828),
 * `04 Single` (55547:853).
 *
 * Those five sets are one sunken card with a different number of rows and a different
 * trailing slot, so they are one container plus `SearchFormField` rather than five
 * components. The dividers between rows are drawn by the container, because Figma insets
 * them by the card's own padding.
 */
export function SearchForm({ children, swap, className }: SearchFormProps) {
  return (
    <div
      className={cx("tds-search-form", className)}
      data-swap={swap ? "true" : undefined}
    >
      {children}
      {swap}
    </div>
  );
}

export interface SearchFormFieldProps {
  /** 20px slot. Figma fills it with `tds_ic_placeholder`; pass the real glyph. */
  icon?: ReactNode;
  /** The small line above the value, e.g. "Departing from". */
  label?: ReactNode;
  /** Absent means the field is still empty, which is Figma's `Initial` state. */
  value?: ReactNode;
  placeholder?: ReactNode;
  /** Sits inline after the value in the same bold weight, one shade lighter. */
  subtitle?: ReactNode;
  /** Counters, a toggle, a vertical `Divider` — whatever the row carries on its right. */
  trailing?: ReactNode;
  /** Makes the icon and text a button. Leave it off for a row that only displays. */
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * One row. `Initial` versus `Filled` is `value` being absent or present, so a row can't
 * be drawn in the wrong state for the data it holds.
 */
export function SearchFormField({
  icon,
  label,
  value,
  placeholder,
  subtitle,
  trailing,
  onSelect,
  disabled = false,
  className,
}: SearchFormFieldProps) {
  const filled = value !== undefined && value !== null && value !== "";

  const content = (
    <>
      {icon ? <span className="tds-search-form__icon">{icon}</span> : null}
      <span className="tds-search-form__text">
        {label ? <span className="tds-search-form__label">{label}</span> : null}
        <span className="tds-search-form__value">
          <span>{filled ? value : placeholder}</span>
          {filled && subtitle ? (
            <span className="tds-search-form__subtitle">{subtitle}</span>
          ) : null}
        </span>
      </span>
    </>
  );

  return (
    <div
      className={cx("tds-search-form__field", className)}
      data-filled={filled ? "true" : "false"}
      data-labelled={label ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
    >
      {onSelect ? (
        <button
          type="button"
          className="tds-search-form__control"
          onClick={onSelect}
          disabled={disabled}
        >
          {content}
        </button>
      ) : (
        <span className="tds-search-form__control">{content}</span>
      )}
      {trailing}
    </div>
  );
}

export interface SearchFormPieceProps {
  icon?: ReactNode;
  /** Figma calls it Counter: the passenger or room count beside the icon. */
  count?: ReactNode;
  className?: string;
}

/** The icon-plus-count pairs on the right of `04 Single`. */
export function SearchFormPiece({ icon, count, className }: SearchFormPieceProps) {
  return (
    <span className={cx("tds-search-form__piece", className)}>
      {icon ? <span className="tds-search-form__icon">{icon}</span> : null}
      {count}
    </span>
  );
}

export type SearchFormSwapButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
>;

/** The raised `tds_ic_up_down` button that swaps the two fields it sits between. */
export function SearchFormSwapButton({
  className,
  "aria-label": ariaLabel = "Reverse",
  ...rest
}: SearchFormSwapButtonProps) {
  return (
    <button
      type="button"
      className={cx("tds-search-form__swap", className)}
      aria-label={ariaLabel}
      {...rest}
    >
      <UpDownIcon />
    </button>
  );
}
