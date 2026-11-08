import type { ReactNode } from "react";

import {
  AndroidRecentsIcon,
  BatteryIcon,
  MobileSignalIcon,
  WifiIcon,
} from "../icons/status-bar.js";
import { cx } from "../utils/cx.js";

/** Figma: `Platform = IOS | Android`. */
export type StatusBarPlatform = "ios" | "android";

export interface StatusBarProps {
  platform?: StatusBarPlatform;
  /**
   * Figma: `Theme = Dark` and `Dark No Dynamic Island`. Not the library's dark theme — it
   * is the glyphs going white because there is a photograph behind them, which is what the
   * two Transparant navigation sets need.
   */
  invert?: boolean;
  /** Figma: `Show Dynamic Island`. iOS only, and off on both Transparant sets. */
  dynamicIsland?: boolean;
  /** iOS only. Figma draws Apple's 9:41; a prototype with a clock passes its own. */
  time?: ReactNode;
  className?: string;
}

/**
 * Figma: `Status Bar` (408:17562).
 *
 * Device chrome, not app UI: nothing in the library renders it for you and no screen should
 * ship it. It is here because the navigation frames draw it above the bar, and a phone
 * mock-up that leaves it out reads as the wrong height — `TopBar` takes it as a slot for
 * exactly that reason.
 *
 * The iOS row is Apple's: time on the left, the island in the middle, signal / wifi /
 * battery on the right. The Android row is the three navigation shapes, right-aligned and
 * with no clock, which is how Figma's `Platform = Android` variants draw it.
 */
export function StatusBar({
  platform = "ios",
  invert = false,
  dynamicIsland = true,
  time = "9:41",
  className,
}: StatusBarProps) {
  return (
    <div
      className={cx("tds-status-bar", className)}
      data-platform={platform}
      data-invert={invert ? "true" : undefined}
      aria-hidden="true"
    >
      {platform === "ios" ? (
        <>
          <span className="tds-status-bar__time">{time}</span>
          {dynamicIsland ? <span className="tds-status-bar__island" /> : null}
          <span className="tds-status-bar__stats">
            <MobileSignalIcon className="tds-status-bar__signal" />
            <WifiIcon className="tds-status-bar__wifi" />
            <BatteryIcon className="tds-status-bar__battery" />
          </span>
        </>
      ) : (
        <span className="tds-status-bar__android">
          <span className="tds-status-bar__square" />
          <span className="tds-status-bar__circle" />
          <AndroidRecentsIcon className="tds-status-bar__triangle" />
        </span>
      )}
    </div>
  );
}
