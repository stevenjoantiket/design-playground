/*
 * The loading face, transcribed from `tds library/tds loading/smile_loading.svg`.
 *
 * Its own file rather than `index.tsx` because it does not come from the icon drop — Figma
 * draws it as the `Loading` component, and the drop's `tds_ic_smile` is a different glyph
 * (a face in a circle). The same two rules hold: `d` verbatim, the exported fill swapped
 * for `currentColor` so the button's text token colours it.
 *
 * Figma's frames are one still each, so the animation is not in the export. It blinks:
 * see `tds-loading-blink` in `button.css`, which is the least a still can be turned into
 * without inventing a motion the design does not describe.
 */

import type { SVGProps } from "react";

/** `smile_loading.svg`. Two eyes and a mouth, on a 32.73 × 20.47 artboard. */
export function SmileLoadingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32.7297 20.4658"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M0.966599 10.0254C2.05739 9.1789 3.62792 9.37698 4.47441 10.4678C6.97411 13.6888 10.8198 15.4658 16.4998 15.4658C22.186 15.4658 25.9004 13.6882 28.2117 10.5254C29.0264 9.41062 30.5901 9.1668 31.7049 9.98145C32.8196 10.7961 33.0624 12.3598 32.2478 13.4746C28.7463 18.2662 23.3073 20.4658 16.4998 20.4658C9.68608 20.4658 4.19841 18.2656 0.525193 13.5322C-0.321095 12.4416 -0.123717 10.872 0.966599 10.0254ZM8.4998 0C10.7089 9.01955e-06 12.4998 1.79087 12.4998 4C12.4998 6.20913 10.7089 7.99999 8.4998 8C6.29066 8 4.4998 6.20914 4.4998 4C4.4998 1.79086 6.29066 0 8.4998 0ZM24.4998 0C26.7089 9.27725e-06 28.4998 1.79087 28.4998 4C28.4998 6.20913 26.7089 7.99999 24.4998 8C22.2907 8 20.4998 6.20914 20.4998 4C20.4998 1.79086 22.2907 0 24.4998 0Z" />
    </svg>
  );
}
