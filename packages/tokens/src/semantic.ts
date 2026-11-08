/**
 * Semantic color tokens, read from the COLOR > Semantics frame.
 *
 * These are what components consume. Background tokens carry an explicit dark value
 * because the Figma table documents one; text, icon and stroke tokens resolve through
 * the neutral ramp, which already inverts between themes.
 */

import {
  alpha,
  blue,
  green,
  magenta,
  neutral,
  neutralDark,
  orange,
  purple,
  red,
  turquoise,
  yellow,
} from "./primitives.js";

export type ThemeName = "light" | "dark";

/** Either neutral ramp. The two share step names so semantics can be written once. */
type NeutralRamp = Record<keyof typeof neutral, string>;

export interface BackgroundTokens {
  baseSurface: string;
  sunkenSurface: string;
  backdropSurface: string;
  disabledSurface: string;
  highBlue: string;
  lowBlue: string;
  highGreen: string;
  lowGreen: string;
  highRed: string;
  lowRed: string;
  highYellow: string;
  lowYellow: string;
  highMagenta: string;
  lowMagenta: string;
  highOrange: string;
  lowOrange: string;
  highPurple: string;
  lowPurple: string;
  highTurquoise: string;
  lowTurquoise: string;
  staticWhite: string;
  staticBlack: string;
  overlay: string;
}

export interface ForegroundTokens {
  highEmphasis: string;
  lowEmphasis: string;
  disabled: string;
  invert: string;
  subtleInvert: string;
  lightInvert: string;
  active: string;
  alert: string;
  analytic: string;
  crossSell: string;
  positive: string;
  price: string;
  usp: string;
  staticWhite: string;
  staticBlack: string;
}

export interface StrokeTokens {
  bold: string;
  regular: string;
  light: string;
  disabled: string;
  invert: string;
  active: string;
  alert: string;
  analytic: string;
  crossSell: string;
  positive: string;
  price: string;
  usp: string;
}

export interface SemanticColors {
  background: BackgroundTokens;
  text: ForegroundTokens;
  icon: ForegroundTokens;
  stroke: StrokeTokens;
}

const lightBackground: BackgroundTokens = {
  baseSurface: neutral.n0,
  sunkenSurface: neutral.n50,
  backdropSurface: neutral.n100,
  disabledSurface: neutral.n200,
  highBlue: blue.b400,
  lowBlue: blue.b100,
  highGreen: green.g600,
  lowGreen: green.g100,
  highRed: red.r500,
  lowRed: red.r100,
  highYellow: yellow.y500,
  lowYellow: yellow.y100,
  highMagenta: magenta.m500,
  lowMagenta: magenta.m100,
  highOrange: orange.o500,
  lowOrange: orange.o100,
  highPurple: purple.p500,
  lowPurple: purple.p100,
  highTurquoise: turquoise.t500,
  lowTurquoise: turquoise.t100,
  staticWhite: neutral.n0,
  staticBlack: neutral.n900,
  overlay: alpha.ab40,
};

/** Dark values are documented literally in the Figma table, not derived. */
const darkBackground: BackgroundTokens = {
  baseSurface: "#121212",
  sunkenSurface: "#242628",
  backdropSurface: "#242628",
  disabledSurface: "#242628",
  highBlue: "#001833",
  lowBlue: "#001833",
  highGreen: "#0A1F0D",
  lowGreen: "#0A1F0D",
  highRed: "#350808",
  lowRed: "#350808",
  highYellow: "#2A2600",
  lowYellow: "#2A2600",
  highMagenta: "#330022",
  lowMagenta: "#330022",
  highOrange: "#331C00",
  lowOrange: "#331C00",
  highPurple: "#1F0D2A",
  lowPurple: "#1F0D2A",
  highTurquoise: "#002B2B",
  lowTurquoise: "#002B2B",
  staticWhite: neutral.n0,
  staticBlack: neutral.n900,
  overlay: alpha.ab40,
};

/*
 * `invert`, `subtleInvert` and `lightInvert` deliberately do NOT flip with the theme.
 * Their documented job is "text/icon on a dark or gradient background" — a surface that
 * is dark in both themes. Resolving them through the neutral ramp would turn them
 * near-black in dark mode and make every primary button unreadable.
 */
const foreground = (n: NeutralRamp): { text: ForegroundTokens; icon: ForegroundTokens } => ({
  text: {
    highEmphasis: n.n800,
    lowEmphasis: n.n600,
    disabled: n.n400,
    invert: neutral.n0,
    subtleInvert: alpha.a80,
    lightInvert: alpha.a60,
    active: blue.b400,
    alert: red.r400,
    analytic: orange.o500,
    crossSell: purple.p500,
    positive: green.g600,
    price: red.r500,
    usp: turquoise.t500,
    staticWhite: neutral.n0,
    staticBlack: neutral.n900,
  },
  // Icons sit one step lighter than text at the same emphasis: an icon stroke reads
  // heavier than a glyph of the same value.
  icon: {
    highEmphasis: n.n700,
    lowEmphasis: n.n400,
    disabled: n.n200,
    invert: neutral.n0,
    subtleInvert: alpha.a80,
    lightInvert: alpha.a60,
    active: blue.b400,
    alert: red.r400,
    analytic: orange.o500,
    crossSell: purple.p500,
    positive: green.g600,
    price: red.r500,
    usp: turquoise.t500,
    staticWhite: neutral.n0,
    staticBlack: neutral.n900,
  },
});

const strokes = (n: NeutralRamp): StrokeTokens => ({
  bold: n.n900,
  regular: n.n600,
  light: n.n400,
  disabled: n.n200,
  // Same reasoning as the foreground invert tokens: this is the stroke used on a
  // colored background, which stays colored in dark mode.
  invert: neutral.n0,
  active: blue.b400,
  alert: red.r400,
  analytic: orange.o500,
  crossSell: purple.p500,
  positive: green.g600,
  price: red.r500,
  usp: turquoise.t500,
});

const lightForeground = foreground(neutral);
const darkForeground = foreground(neutralDark);

export const semanticLight: SemanticColors = {
  background: lightBackground,
  text: lightForeground.text,
  icon: lightForeground.icon,
  stroke: strokes(neutral),
};

export const semanticDark: SemanticColors = {
  background: darkBackground,
  text: darkForeground.text,
  icon: darkForeground.icon,
  stroke: strokes(neutralDark),
};

export const semantic: Record<ThemeName, SemanticColors> = {
  light: semanticLight,
  dark: semanticDark,
};
