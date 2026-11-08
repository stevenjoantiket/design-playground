import type { ReactNode } from "react";

import { cx } from "../utils/cx.js";

/** Figma: `Navigation - 01 Top - 01 Regular` and `- 02 Extended`. */
export type TopBarVariant = "regular" | "extended";

export interface TopBarProps {
  variant?: TopBarVariant;
  /**
   * Figma: State = Scrolling. The bar takes an elevation once there is content underneath
   * it, and a transparent bar becomes opaque.
   */
  scrolling?: boolean;
  /**
   * Figma: the two `Transparant` sets, which sit over a hero image until you scroll. Until
   * it scrolls, the bar has no surface of its own and each icon and the search box carry a
   * white pill instead, so they stay legible over whatever the photograph is doing.
   */
  transparent?: boolean;
  /**
   * A `StatusBar`. Device chrome, so nothing renders it for you — but the Figma frames draw
   * it above the bar and a phone mock-up without it is 44px short.
   */
  statusBar?: ReactNode;
  /** The 24px leading slot: `tds_ic_back`, or the logo on `01 Logo + Images + Icons`. */
  leading?: ReactNode;
  /** The thumbnail on `05 Back + Image + Title + Subtitle + Icons`. */
  media?: ReactNode;
  /** One line, clipped with an ellipsis — Figma's title is "limited to 1 line". */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** A `SearchBox`. Takes the place of the title on the row it sits in. */
  search?: ReactNode;
  /** Icons 20px apart, a text link, or a small `Button`. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Figma: the fourteen `Navigation - 01 Top` sets (55549:2202 and siblings).
 *
 * They are one bar with different slots filled — back, logo, thumbnail, title, subtitle,
 * search box, icons, link, button — so this is the bar and the slots rather than fourteen
 * components. The status bar those frames include is device chrome: it is a slot rather
 * than something the bar draws, so a screen gets nothing and a mock-up passes `StatusBar`.
 *
 * `extended` is the collapsing-title arrangement: the title sits on its own row below the
 * icons, and slides up next to the back button once you scroll. Figma draws both halves as
 * separate states of the same set, which is the same thing said twice.
 */
export function TopBar({
  variant = "regular",
  scrolling = false,
  transparent = false,
  statusBar,
  leading,
  media,
  title,
  subtitle,
  search,
  actions,
  children,
  className,
}: TopBarProps) {
  const inlineTitle = variant === "regular" || scrolling;
  const text =
    title || subtitle ? (
      <span className="tds-top-bar__text">
        {title ? <span className="tds-top-bar__title">{title}</span> : null}
        {subtitle ? <span className="tds-top-bar__subtitle">{subtitle}</span> : null}
      </span>
    ) : null;

  return (
    <header
      className={cx("tds-top-bar", className)}
      data-variant={variant}
      data-scrolling={scrolling ? "true" : undefined}
      data-transparent={transparent ? "true" : undefined}
      data-status-bar={statusBar ? "true" : undefined}
    >
      {statusBar}
      <div className="tds-top-bar__row">
        {leading ? <span className="tds-top-bar__leading">{leading}</span> : null}
        {media ? <span className="tds-top-bar__media">{media}</span> : null}
        {inlineTitle ? text : null}
        {/* The search box shares the row on the Regular sets and takes the second row on
            the Extended ones, where the title is what stays behind. */}
        {search && variant === "regular" ? (
          <span className="tds-top-bar__search">{search}</span>
        ) : null}
        {actions ? <span className="tds-top-bar__actions">{actions}</span> : null}
      </div>
      {variant === "extended" && (!inlineTitle || search) ? (
        <div className="tds-top-bar__extension">
          {inlineTitle ? null : text}
          {search ? <span className="tds-top-bar__search">{search}</span> : null}
        </div>
      ) : null}
      {children}
    </header>
  );
}
