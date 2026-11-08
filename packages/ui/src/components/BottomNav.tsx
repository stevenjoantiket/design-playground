import type { ReactNode } from "react";

import { cx } from "../utils/cx.js";
import { Inset } from "./Inset.js";

export interface BottomNavItem {
  icon: ReactNode;
  label: ReactNode;
  onSelect?: () => void;
}

export interface BottomNavProps {
  /** Figma draws five and lets the last three be hidden, so two to five. */
  items: readonly BottomNavItem[];
  /** 0-based index of the destination you are on. */
  current: number;
  /** The iOS home indicator, transparent-backed, as the frame draws it. */
  homeIndicator?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Figma: `Navigation - 02 Bottom - Menu` (55549:2185).
 *
 * The app's tab bar. Figma's `Show Menu 3/4/5` toggles are the length of the list, and the
 * blue first item is the one you are on, so both come from the data.
 *
 * A `<nav>` of buttons rather than links: which destination is current is marked with
 * `aria-current`, and the icons carry no label of their own — the text under them is it.
 */
export function BottomNav({
  items,
  current,
  homeIndicator = false,
  className,
  "aria-label": ariaLabel = "Main",
}: BottomNavProps) {
  return (
    <nav className={cx("tds-bottom-nav", className)} aria-label={ariaLabel}>
      <ul className="tds-bottom-nav__list">
        {items.map((item, index) => (
          <li className="tds-bottom-nav__item" key={index}>
            <button
              type="button"
              className="tds-bottom-nav__link"
              data-current={index === current ? "true" : undefined}
              aria-current={index === current ? "page" : undefined}
              onClick={item.onSelect}
            >
              <span className="tds-bottom-nav__icon">{item.icon}</span>
              <span className="tds-bottom-nav__label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {homeIndicator ? <Inset transparent /> : null}
    </nav>
  );
}
