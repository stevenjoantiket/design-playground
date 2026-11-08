import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cx } from "../utils/cx.js";

export interface SnackbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma renders the action as a bold 16px text link in the invert color. */
  action?: ReactNode;
  /**
   * `polite` for confirmations, `assertive` for failures the user must notice.
   * A snackbar that announces nothing is a snackbar half the users never see.
   */
  tone?: "polite" | "assertive";
}

export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(function Snackbar(
  { action, tone = "polite", className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role={tone === "assertive" ? "alert" : "status"}
      aria-live={tone}
      className={cx("tds-snackbar", className)}
      {...rest}
    >
      <div className="tds-snackbar__body">{children}</div>
      {action ? <div className="tds-snackbar__action">{action}</div> : null}
    </div>
  );
});
