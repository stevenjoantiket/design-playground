import type { ReactNode } from "react";

import { cx } from "../utils/cx.js";

/**
 * Figma: `View - Info` (55549:1204) and `View - Section` (55549:1203). The first is
 * described as "Error Page / Error Pop Up"; the second is the same idea sized for a slot
 * inside a page.
 */
export type ViewVariant = "info" | "section";

export interface ViewProps {
  variant?: ViewVariant;
  /** 3:2 for `info`, a 40px square for `section`. Both sit on a backdrop-surface frame. */
  media?: ReactNode;
  title?: ReactNode;
  subtext?: ReactNode;
  /**
   * `info` takes a full-width `ButtonGroup`, which brings its own padding and surface;
   * `section` takes a single small `Button`.
   */
  actions?: ReactNode;
  className?: string;
}

/**
 * The empty, error and "nothing here yet" view. One component for both Figma sets: they
 * differ in the size of everything, not in what they are made of.
 */
export function View({ variant = "info", media, title, subtext, actions, className }: ViewProps) {
  return (
    <div className={cx("tds-view", className)} data-variant={variant}>
      {media ? (
        <div className="tds-view__media">
          <div className="tds-view__frame">{media}</div>
        </div>
      ) : null}
      {title || subtext ? (
        <div className="tds-view__text">
          {title ? <p className="tds-view__title">{title}</p> : null}
          {subtext ? <p className="tds-view__subtext">{subtext}</p> : null}
        </div>
      ) : null}
      {actions ? <div className="tds-view__actions">{actions}</div> : null}
    </div>
  );
}
