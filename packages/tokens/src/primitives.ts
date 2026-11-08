/**
 * Primitive color ramps, read from the COLOR > Primitive Tokens frame of Figma file
 * RwaA7bpig0BrC9kpFOvjzD. Primitives are raw values with no meaning attached — never
 * reference them directly from a component, go through `semantic.ts`.
 */

export const neutral = {
  n0: "#FFFFFF",
  n50: "#F8F9FD",
  n100: "#EEF0F7",
  n200: "#D8DCE8",
  n300: "#C0C3CF",
  n400: "#AEB2BE",
  n500: "#8C909E",
  n600: "#71747D",
  n700: "#4D4F56",
  n800: "#303135",
  n900: "#18191B",
} as const;

/**
 * The dark-mode neutral ramp. Deliberately inverted relative to `neutral`: n0 stays
 * "the page background" and n900 stays "the strongest foreground", so semantic tokens
 * can reference the same step name in both themes.
 */
export const neutralDark = {
  n0: "#0D0E12",
  n50: "#16171D",
  n100: "#1E2029",
  n200: "#2B2F3B",
  n300: "#363B49",
  n400: "#414858",
  n500: "#525B6F",
  n600: "#848FA4",
  n700: "#C4C9D4",
  n800: "#E2E4E9",
  n900: "#F5F5F5",
} as const;

export const blue = {
  b100: "#E7F2FF",
  b200: "#A3CFFF",
  b300: "#5BAAFF",
  b400: "#007CFF",
  b500: "#0064D2",
  b600: "#004FA7",
  b700: "#003D81",
  b800: "#002A58",
  b900: "#001833",
} as const;

export const green = {
  g100: "#E2FBED",
  g200: "#A8E5C4",
  g300: "#66CC94",
  g400: "#3CCC7D",
  g500: "#0BAE54",
  g600: "#088942",
  g700: "#076A33",
  g800: "#054A24",
  g900: "#022612",
} as const;

export const red = {
  r100: "#FFDFDF",
  r200: "#FC9999",
  r300: "#FC7474",
  r400: "#F15C59",
  r500: "#E52424",
  r600: "#B81D1D",
  r700: "#8C1616",
  r800: "#610F0F",
  r900: "#380909",
} as const;

export const yellow = {
  y100: "#FEF8D0",
  y200: "#FEF2A2",
  y300: "#FEEC73",
  y400: "#FEE645",
  y500: "#FEDD00",
  y600: "#E5C700",
  y700: "#AD9700",
  y800: "#6C5E00",
  y900: "#3D3500",
} as const;

/** Named Magenta on the canvas labels; the Figma layers are misnamed `color/Cyan/*`. */
export const magenta = {
  m100: "#FCEEF7",
  m200: "#F6CBE8",
  m300: "#ED96D0",
  m400: "#E76FBF",
  m500: "#DE3FA9",
  m600: "#C0218B",
  m700: "#8C1865",
  m800: "#460C32",
  m900: "#330724",
} as const;

export const orange = {
  o100: "#FFE9D6",
  o200: "#FFC799",
  o300: "#FFA55C",
  o400: "#FF841F",
  o500: "#FF7200",
  o600: "#E06500",
  o700: "#B85300",
  o800: "#8F4000",
  o900: "#662E00",
} as const;

export const purple = {
  p100: "#EDE6FF",
  p200: "#D6C8FB",
  p300: "#B29AF7",
  p400: "#8A6BF0",
  p500: "#6B46E3",
  p600: "#5F3FD9",
  p700: "#4F31B8",
  p800: "#3A258F",
  p900: "#24165C",
} as const;

/** Spelled `Turqouise` in the Figma layer names. */
export const turquoise = {
  t100: "#E0F1F5",
  t200: "#9FDFED",
  t300: "#7CD4E4",
  t400: "#30B6C5",
  t500: "#10A4AF",
  t600: "#148692",
  t700: "#174F59",
  t800: "#14353C",
  t900: "#092227",
} as const;

export const alpha = {
  a80: "rgba(255, 255, 255, 0.8)",
  a60: "rgba(255, 255, 255, 0.6)",
  aw40: "rgba(255, 255, 255, 0.4)",
  ab40: "rgba(24, 25, 27, 0.4)",
} as const;

export const primitives = {
  neutral,
  neutralDark,
  blue,
  green,
  red,
  yellow,
  magenta,
  orange,
  purple,
  turquoise,
  alpha,
} as const;

export type Primitives = typeof primitives;
