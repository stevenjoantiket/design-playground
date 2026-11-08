/**
 * The type ramp, read from the FONT section table.
 *
 * The eight Odyssey TTFs report three different family names to Figma
 * ("Tiket Odyssey Text", "… SemiBold", "… ExtraBold"). In code they collapse into one
 * family plus a weight — see packages/fonts.
 */

export const fontFamily = "Tiket Odyssey Text";

export const fontFamilyStack = `"${fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

export const fontWeight = {
  regular: 400,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export type FontWeight = keyof typeof fontWeight;

export interface TypeStyle {
  /** px */
  fontSize: number;
  /** px */
  lineHeight: number;
  fontWeight: number;
  letterSpacing: number;
}

const style = (fontSize: number, lineHeight: number, weight: FontWeight): TypeStyle => ({
  fontSize,
  lineHeight,
  fontWeight: fontWeight[weight],
  letterSpacing: 0,
});

/**
 * Tokens whose Figma "Weight" column reads "Bold/Regular" ship as a pair. Heading
 * tokens are Bold only; `small` and `slashprice` are SemiBold only.
 */
export const typography = {
  heading1: style(56, 60, "bold"),
  heading2: style(38, 42, "bold"),
  // The table documents 28/30; the rendered sample in Figma is 24px. The table row is
  // internally consistent (107% of 28 = 30), so the table wins.
  heading3: style(28, 30, "bold"),

  body1: style(18, 24, "regular"),
  body1Bold: style(18, 24, "bold"),
  body2: style(16, 22, "regular"),
  body2Bold: style(16, 22, "bold"),
  body3: style(14, 20, "regular"),
  body3Bold: style(14, 20, "bold"),

  small: style(12, 16, "semibold"),
  /*
   * The Regular and Bold siblings of `small` — same 12/16 box, weight 400 and 700. The
   * component frames use both: Regular for the label line above a search form value
   * (`Forms - 05 Search Form - 02 Reversible - 01 General`, 55547:766) and a progress step
   * title, Bold for a pagination cell and a progress step number. Figma names that style
   * "Body 3 - …/Mobile" there, because those frames number the body ramp one step lower
   * than the FONT table this ramp was read from. See DESIGN-SYSTEM.md.
   */
  smallRegular: style(12, 16, "regular"),
  smallBold: style(12, 16, "bold"),
  // The table cell reads "16 (133%)", but 133% of 14 is 18.6. The node itself is 114%,
  // which is exactly 16/14, so 16px is the intended value.
  slashprice: style(14, 16, "semibold"),

  extraSmall: style(10, 14, "regular"),
  extraSmallBold: style(10, 14, "bold"),
  /*
   * The SemiBold sibling of `extraSmall`. Figma calls it "Small (⚠️ spesific use case)" and
   * uses it for exactly one thing in the frames read so far: the "Today" / "Current month"
   * caption above a calendar cell (`.Calendar - Dates`, 55549:4698).
   */
  extraSmallSemibold: style(10, 14, "semibold"),
  extraSmallPrint: style(8, 12, "regular"),
  extraSmallPrintBold: style(8, 12, "bold"),
} as const;

export type TypographyToken = keyof typeof typography;
