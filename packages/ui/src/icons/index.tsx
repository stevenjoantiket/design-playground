/*
 * Glyphs the components themselves draw, transcribed from `tds library/tds icon`.
 *
 * This package is compiled by `tsc` alone — there is no bundler to turn an `.svg` import
 * into a module — so the path data is copied in by hand rather than imported. Two rules
 * make that honest:
 *
 * 1. The `d` attribute is copied verbatim from the file named above each glyph. Never
 *    redraw one by eye; a chevron that is two degrees off is invisible in review and
 *    wrong forever after.
 * 2. The exported `fill="#4D4F56"` becomes `currentColor`, so the `--tds-icon-*` token on
 *    the wrapping element decides the colour and dark theme works for free.
 *
 * Only glyphs a component needs live here. Everything else stays in the drop, where the
 * kitchen sink's Icons tab reads it — a product needing an arbitrary icon takes the file,
 * it does not wait for a copy of it to be added to this file.
 */

import type { SVGProps } from "react";

/** `tds_ic_chevron_down.svg`. CSS rotates it for the up, left and right directions. */
export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M7.70845 8.80917C7.31793 8.41864 6.68476 8.41864 6.29424 8.80917C5.90371 9.19969 5.90371 9.83285 6.29424 10.2234L11.2538 15.1829C11.6414 15.5706 12.269 15.5738 12.6606 15.1902L17.7238 10.2307C18.1183 9.84419 18.1249 9.21105 17.7384 8.81651C17.3519 8.42197 16.7188 8.41543 16.3243 8.80189L11.9681 13.0689L7.70845 8.80917Z" />
    </svg>
  );
}

/** `tds_ic_chevron_left.svg`. Pagination's previous arrow. */
export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M15.1995 7.69182C15.5901 7.30129 15.5901 6.66813 15.1995 6.2776C14.809 5.88708 14.1759 5.88708 13.7853 6.2776L8.82581 11.2371C8.43813 11.6248 8.43489 12.2523 8.81853 12.644L13.7781 17.7071C14.1645 18.1017 14.7977 18.1082 15.1922 17.7218C15.5867 17.3353 15.5933 16.7022 15.2068 16.3076L10.9399 11.9515L15.1995 7.69182Z" />
    </svg>
  );
}

/**
 * `tds_ic_chevron_right.svg`. Its own file rather than a rotated chevron-left: the two
 * are drawn separately in the drop and the rule is to use what is there.
 */
export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M8.8258 16.3003C8.43527 16.6908 8.43527 17.324 8.8258 17.7145C9.21632 18.105 9.84949 18.105 10.24 17.7145L15.1995 12.755C15.5872 12.3673 15.5905 11.7398 15.2068 11.3481L10.2473 6.28495C9.86082 5.89041 9.22769 5.88386 8.83315 6.27033C8.43861 6.65679 8.43206 7.28993 8.81853 7.68447L13.0855 12.0406L8.8258 16.3003Z" />
    </svg>
  );
}

/** `tds_ic_arrow_right.svg`. The handle on a slide button. */
export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5858 11.0088H3C2.44772 11.0088 2 11.4526 2 12C2 12.5474 2.44772 12.9912 3 12.9912H18.5858L13.2218 18.3079C12.8313 18.695 12.8313 19.3226 13.2218 19.7097C13.6123 20.0968 14.2455 20.0968 14.636 19.7097L21.7071 12.7009C21.8881 12.5215 22 12.2737 22 12C22 11.7263 21.8881 11.4785 21.7071 11.2991L14.636 4.29031C14.2455 3.90323 13.6123 3.90323 13.2218 4.29031C12.8313 4.6774 12.8313 5.30499 13.2218 5.69208L18.5858 11.0088Z"
      />
    </svg>
  );
}

/** `tds_ic_check_big.svg`. The tick in a completed progress step. */
export function CheckBigIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.05005 11.2C7.8774 11.0272 7.67103 10.8918 7.44379 10.8022C7.21655 10.7126 6.9733 10.6707 6.72918 10.6792C6.48506 10.6877 6.24529 10.7463 6.0248 10.8514C5.80432 10.9565 5.60782 11.1059 5.44756 11.2903C5.28729 11.4746 5.16668 11.69 5.09324 11.9229C5.01979 12.1559 4.99508 12.4015 5.02064 12.6444C5.0462 12.8873 5.12148 13.1224 5.24181 13.335C5.36213 13.5475 5.52492 13.7331 5.72005 13.88L10.2 17.79C10.3872 17.9507 10.6056 18.071 10.8414 18.1434C11.0773 18.2157 11.3255 18.2385 11.5706 18.2103C11.8157 18.1821 12.0523 18.1036 12.2656 17.9797C12.4789 17.8557 12.6642 17.689 12.81 17.49L19.87 9.30002C20.1232 8.91843 20.2196 8.45394 20.1391 8.00312C20.0586 7.55231 19.8075 7.14986 19.4379 6.87944C19.0683 6.60902 18.6088 6.49144 18.1547 6.55115C17.7007 6.61085 17.2871 6.84325 17 7.20002L11.08 13.83L8.05005 11.2Z"
      />
    </svg>
  );
}

/** `tds_ic_plus.svg`. The increment half of the quantity editor. */
export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.9943 3.88444C12.9365 3.3865 12.5138 3 12.001 3C11.4487 3 11.001 3.44825 11.001 4.0012V10.9819H3.00796L3.88338 10.9886C3.38604 11.0465 3 11.4696 3 11.9831C3 12.536 3.44772 12.9843 4 12.9843H11.001V19.9988L11.0077 20.1156C11.0655 20.6135 11.4882 21 12.001 21C12.5533 21 13.001 20.5517 13.001 19.9988V12.9843H20L20.1166 12.9775C20.614 12.9197 21 12.4965 21 11.9831C21 11.4301 20.5523 10.9819 20 10.9819H13.001V4.0012L12.9943 3.88444Z"
      />
    </svg>
  );
}

/** `tds_ic_minus.svg`. */
export function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M4 11H20C20.5523 11 21 11.4477 21 12C21 12.5128 20.614 12.9355 20.1166 12.9933L20 13H4C3.44772 13 3 12.5523 3 12C3 11.4872 3.38604 11.0645 3.88338 11.0067L4 11Z" />
    </svg>
  );
}

/** `tds_ic_oval_cross.svg` — dismisses the nudge over a calendar bottom bar's date. */
export function OvalCrossIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM14.3329 15.7291C14.7241 16.1204 15.3588 16.1208 15.7505 15.7299C16.112 15.369 16.1401 14.801 15.8346 14.4079L15.7512 14.3135L13.4612 12.0228L15.7512 9.73215L15.8346 9.63776C16.1401 9.2447 16.112 8.67661 15.7505 8.31578C15.3588 7.92487 14.7241 7.92522 14.3329 8.31656L12.0444 10.6057L9.75595 8.31656C9.36472 7.92522 8.73007 7.92487 8.33841 8.31578C7.97688 8.67661 7.94877 9.2447 8.25429 9.63776L8.33763 9.73215L10.6277 12.0228L8.33763 14.3135L8.25429 14.4079C7.94877 14.801 7.97688 15.369 8.33841 15.7299C8.73007 16.1208 9.36472 16.1204 9.75595 15.7291L12.0444 13.44L14.3329 15.7291Z"
      />
    </svg>
  );
}

/**
 * `tds_ic_up_down.svg` — the swap glyph on a reversible search form.
 *
 * Not rotated. The Figma instance wraps the vector in a 90° rotation because that is how
 * the icon was assembled from a horizontal arrow pair; the exported file is already the
 * vertical ⇅ the button renders, so rotating it again would lay it on its side.
 */
export function UpDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.611 14.2066C13.2186 13.9011 12.6505 13.928 12.2891 14.2881C11.8975 14.6781 11.8967 15.3112 12.2872 15.7023L15.2836 18.7023L15.3778 18.7856C15.7703 19.0912 16.3384 19.0641 16.6999 18.704L19.711 15.704L19.7944 15.6099C20.1003 15.218 20.0732 14.6507 19.7126 14.2898L19.6184 14.2065C19.2259 13.901 18.6579 13.9281 18.2965 14.2882L16.9999 15.5793L17.0054 6.00154L16.9987 5.88475C16.9413 5.38669 16.5188 4.99987 16.006 4.99957C15.4537 4.99926 15.0057 5.44734 15.0054 6.00039L14.9999 15.586L13.7053 14.2899L13.611 14.2066ZM8.99456 17.9988L9.00005 8.41345L10.2947 9.70924L10.3889 9.79255C10.7814 10.0981 11.3494 10.0711 11.7109 9.71108C12.1025 9.32107 12.1033 8.6879 11.7127 8.29687L8.71636 5.29687L8.62212 5.21355C8.22964 4.90799 7.66151 4.93503 7.30007 5.29513L4.28894 8.29513L4.20553 8.38924C3.89963 8.78118 3.92674 9.34844 4.28731 9.70934L4.38155 9.79264C4.77403 10.0981 5.34209 10.071 5.70349 9.71098L7.00005 8.41956L6.99456 17.9976L7.00122 18.1144C7.0587 18.6125 7.48115 18.9993 7.99399 18.9996C8.54627 18.9999 8.99424 18.5518 8.99456 17.9988Z"
      />
    </svg>
  );
}
