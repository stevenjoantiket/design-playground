import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cx } from "../utils/cx.js";

/** Figma: Search Box - Grey, Size = Small | Medium. */
export type SearchBoxSize = "small" | "medium";

export interface SearchBoxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  size?: SearchBoxSize;
  /** The magnifier. 16px in the design; export the real `tds_ic_search` asset. */
  icon?: ReactNode;
  /** Rendered as the clear affordance once there is a value. Figma: `tds_ic_oval_cross`. */
  clearIcon?: ReactNode;
  onClear?: () => void;
  /** Trailing content — Figma places a location picker here. */
  trailing?: ReactNode;
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(function SearchBox(
  { size = "medium", icon, clearIcon, onClear, trailing, className, value, disabled, ...rest },
  ref,
) {
  const hasValue = typeof value === "string" ? value.length > 0 : value != null;

  return (
    <div
      className={cx("tds-search-box", className)}
      data-size={size}
      data-disabled={disabled ? "true" : undefined}
    >
      {icon ? <span className="tds-search-box__icon">{icon}</span> : null}
      <input
        ref={ref}
        type="search"
        className="tds-search-box__input"
        value={value}
        disabled={disabled}
        {...rest}
      />
      {hasValue && onClear ? (
        <button type="button" className="tds-search-box__clear" onClick={onClear} aria-label="Clear search">
          {clearIcon}
        </button>
      ) : null}
      {trailing}
    </div>
  );
});
