/**
 * Spacing, radius, elevation, gradients and motion.
 *
 * Spacing and radius have no dedicated documentation frame in the Figma file — they
 * were derived from component geometry. Every value below was observed on a real
 * component; nothing here is invented.
 */

export const spacing = {
  0: 0,
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
} as const;

export type SpacingToken = keyof typeof spacing;

export const radius = {
  none: 0,
  /** Labels. */
  xs: 4,
  /** Medium and small buttons, segmented control. */
  sm: 6,
  /** Large buttons, cards, text fields, tooltips, snackbars, accordions. */
  md: 8,
  /** Badges. */
  lg: 12,
  /** Description chips. */
  xl: 16,
  /** Pills: general chips, search box, radio, toggle. */
  full: 999,
} as const;

export type RadiusToken = keyof typeof radius;

/** Shadow color is N800 at varying alpha in all three levels. */
export const elevation = {
  /** Background / base. No shadow. */
  e00: "none",
  /** Card, snackbar, notification badge. */
  e01: "0 2px 8px rgba(48, 49, 53, 0.16)",
  /** Dropdown, raised button, raised card, popover, FAB, modal, dialog. */
  e02: "0 4px 12px rgba(48, 49, 53, 0.2)",
} as const;

export type ElevationToken = keyof typeof elevation;

export interface Gradient {
  from: string;
  to: string;
  /** Ready-to-use CSS value. Figma stores an identity transform, i.e. left to right. */
  css: string;
}

const gradient = (from: string, to: string): Gradient => ({
  from,
  to,
  css: `linear-gradient(90deg, ${from} 0%, ${to} 100%)`,
});

export const gradients = {
  blue: gradient("#007BFF", "#00C1EB"),
  darkBlue: gradient("#003D81", "#30B6C5"),
  green: gradient("#01CF6C", "#02CD9C"),
  lightBlue: gradient("#E7F2FF", "#D9EAFE"),
  orange: gradient("#E52424", "#FF7200"),
  purple: gradient("#FA00B4", "#7600D2"),
  red: gradient("#FF4062", "#FF00B8"),
  tosca: gradient("#00CC9B", "#017CFF"),
  violet: gradient("#18DC9B", "#6E54EF"),
  tierSilver: gradient("#47506F", "#CBD6EC"),
  tierGold: gradient("#614500", "#EBBF4F"),
  tierPlatinum: gradient("#0F0F0F", "#838990"),
  tierDiamond: gradient("#000208", "#1258C9"),
} as const;

export type GradientToken = keyof typeof gradients;

/**
 * Motion is not documented in the Figma file. These are the library's own defaults,
 * kept here so components never hardcode a duration. Bands follow the house rule:
 * state toggles 100-250ms, reveals 250-450ms, celebratory 450-800ms.
 */
export const motion = {
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 400,
    /** A hero settling into place — the only move allowed past the 800ms band. */
    hero: 1000,
  },
  easing: {
    /** Anything entering or responding to input. */
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    /**
     * A flatter ease-out, for something that was being dragged and has been let
     * go. `out` spends most of its travel in the first third, which on a long
     * distance reads as being flicked away from the finger and then crawling;
     * this covers the distance evenly and lands as a hand would.
     */
    decelerate: "cubic-bezier(0.33, 1, 0.68, 1)",
    /** Anything leaving. */
    in: "cubic-bezier(0.7, 0, 0.84, 0)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    /** Tactile overshoot for toggles and pops. */
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    /**
     * CSS `ease-in-out` written out, which is what a Figma prototype means by
     * "Ease in and out". Symmetric, so it reads as one long deliberate move
     * rather than an arrival — for the hero, not for controls.
     */
    symmetric: "cubic-bezier(0.42, 0, 0.58, 1)",
  },
} as const;

/**
 * The mobile hero: a photograph behind a search form, and the two moves it makes.
 *
 * Both come from the NFT landing page prototypes, where the interaction is
 * specified in Figma as Trigger → Animation → Easing → Duration. They are here
 * rather than in a product so the next vertical's hero behaves like the last
 * one; the design system page documents them with a live specimen.
 */
export const heroMotion = {
  /**
   * On arrival, and again whenever the hero's art changes (a tab switch): the
   * new art lands large and eases down to rest, so the page reads as zooming
   * out onto the destination instead of hard-cutting to it.
   */
  settle: {
    /** Figma "Trigger: After delay". Long enough for the art to be painted. */
    delay: 100,
    duration: 1000,
    easing: "cubic-bezier(0.42, 0, 0.58, 1)",
    scaleFrom: 1.25,
    scaleTo: 1,
  },
  /**
   * Pulling down at the top grows the hero into the space instead of revealing
   * a gap above it, and everything over the photograph travels with it.
   */
  stretch: {
    /** Cap on the pull, in px. */
    maxPull: 96,
    /** Fraction of finger travel the pull takes, tapering to 0 at the cap. */
    resistance: 0.6,
    /**
     * Scale the art reaches at the cap, in step with the finger.
     *
     * 1.12 is where the art grows by the distance the page travels, on the 800px
     * hero these screens draw: the picture keeps up with the pull. Higher and the
     * photograph gains on the gesture, which reads as leaning into it; lower and
     * the page slides over a picture that is barely moving. It is a scale rather
     * than a ratio of the hero's height so that the number means the same amount
     * of zoom in a component of any size.
     */
    scaleAtMaxPull: 1.12,
    /**
     * The release, and only the release: the pull itself has no transition
     * because it tracks the finger.
     *
     * Longer and flatter than a normal reveal. The screen is travelling up to
     * 96px back, and a snappy curve over that distance is what makes a rubber
     * band read as a spring — it leaves the finger faster than the hand did and
     * then dawdles. `decelerate` over 360ms is the same journey without the
     * flick.
     */
    duration: 360,
    easing: motion.easing.decelerate,
  },
} as const;

/**
 * Platform density. Colors and type never change between platforms — only how much
 * room a control takes and how large its minimum hit target is.
 *
 * `mobile` is exactly what the Figma file draws (all component frames are 320px wide).
 * `desktop` and `dashboard` are extrapolations, not Figma values: pointer input allows
 * a smaller minimum target, and dashboards want denser default controls.
 */
export const platformDensity = {
  mobile: { minTarget: 44, defaultControlSize: "large" },
  desktop: { minTarget: 32, defaultControlSize: "medium" },
  dashboard: { minTarget: 28, defaultControlSize: "small" },
} as const;

export type PlatformName = keyof typeof platformDensity;

export const focusRing = {
  width: 2,
  offset: 2,
} as const;
