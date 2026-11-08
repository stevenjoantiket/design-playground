import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cx } from "../utils/cx.js";

/** Figma: Chips - 01 General | 03 Description. */
export type ChipKind = "general" | "description";
/** Figma: State = Inactive | Active | Disabled | Error. */
export type ChipState = "inactive" | "active" | "error";

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  kind?: ChipKind;
  /**
   * `Disabled` is not in this union — it is the `disabled` attribute, so assistive
   * technology and pointer handling both get it for free.
   */
  state?: ChipState;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /** Only rendered by `kind="description"`, which is the two-line chip. */
  description?: ReactNode;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { kind = "general", state = "inactive", startIcon, endIcon, description, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx("tds-chip", className)}
      data-kind={kind}
      data-state={state}
      aria-pressed={state === "active"}
      {...rest}
    >
      {startIcon}
      <span className="tds-chip__body">
        <span className="tds-chip__label">{children}</span>
        {kind === "description" && description ? (
          <span className="tds-chip__description">{description}</span>
        ) : null}
      </span>
      {endIcon}
    </button>
  );
});
