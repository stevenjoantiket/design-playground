import { cx } from "../utils/cx.js";

export interface InsetProps {
  /** Figma: Background = White | Transparent. */
  transparent?: boolean;
  className?: string;
}

/**
 * Figma: `Inset` (1:1611), OS = IOS, Gesture = Swipe.
 *
 * The iOS home indicator. Device chrome rather than app UI, so nothing renders it by
 * default — it belongs in a phone-framed prototype and nowhere else. It is a component
 * here only because three of the bottom-anchored sets draw it and they should all draw the
 * same one.
 */
export function Inset({ transparent = false, className }: InsetProps) {
  return (
    <div
      className={cx("tds-inset", className)}
      data-transparent={transparent ? "true" : undefined}
      aria-hidden="true"
    >
      <span className="tds-inset__handle" />
    </div>
  );
}
