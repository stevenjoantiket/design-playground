# Goals

## What this repo is

One component library, built from the Passport Tiket Design System Figma file, that
the tiket **mobile** web project consumes today and that **desktop** and **dashboard**
projects will consume later without a fork.

The library is `@tiket-ds/ui`. It is not a mobile library. Platform is a runtime
prop, not a package boundary — see "One package, three platforms" below.

## Non-goals

- **Not** a rewrite of the product apps. The library ships components; the apps own
  their layouts, routing and data.
- **Not** a general-purpose UI kit. If it isn't in the Figma file, it doesn't belong
  here. A component with no Figma source has no source of truth and will drift.
- **Not** a place for app-specific composition. A `FlightSearchCard` lives in the
  flight app; the `TextField`, `Chip` and `Button` it is made of live here.
- **Not** an icon library. Icons come from a separate Figma library that was not in
  this export. `Icon` is a sizing/color wrapper around SVG the caller provides.

## The rule that makes the rest work

**Figma is the source of truth, and tokens are the only way values reach a
component.** A component file may not contain a hex color, an rgba(), or a font
family. If you need a value that has no token, the fix is to add the token (and
record where in Figma it came from), not to inline the value.

This is enforced, not aspirational: `pnpm verify` runs `scripts/check-tokens.mjs`,
which fails the build on any hardcoded color or font family in `packages/ui/src/styles`.

## One package, three platforms

Mobile, desktop and dashboard differ in *density and input model*, not in identity.
The blue is the same blue. The button is the same button with a bigger tap target.

So there is one `packages/ui`, and `TiketProvider` takes a `platform` prop that
switches a density layer of CSS custom properties (`--tds-min-target`,
`--tds-control-height-*`, and friends). Components read those properties; they never
branch on platform in JavaScript.

```tsx
<TiketProvider theme="light" platform="mobile">
```

Adding desktop and dashboard is therefore a token exercise, not a new package:

1. Extract the desktop/dashboard density values from the corresponding Figma file.
2. Add the platform block in `packages/tokens/src/layout.ts`.
3. Render it in `packages/tokens/src/css.ts`.
4. Flip the kitchen sink's platform switch and look at every component.

If a future platform genuinely needs a *different component* — not a denser one —
that is a signal to add a variant to the existing component, and only if that fails,
a new export. A `packages/ui-desktop` is the last resort, not the first move.

## Definition of done for a component

A component is `done` — and may be flipped to `done` in
`docs/COMPONENT-INVENTORY.md` — only when all of these hold:

1. Every variant in the Figma component set is reachable through props.
2. Every visual value comes from a token.
3. It renders in `apps/adit-board/design-system` in **both** themes and **all** platforms.
4. Interactive states are keyboard reachable and show the focus ring; disabled
   controls are actually disabled, not just styled grey.
5. It has a `.figma.tsx` Code Connect mapping, so the next person who asks Figma for
   this design gets this component back instead of generating a new one.
6. `pnpm verify` passes.

## Accessibility floor

Non-negotiable, because these are the failures that are cheapest to prevent and most
expensive to retrofit:

- Minimum 44px touch target on mobile (`--tds-min-target`), even when the painted
  control is smaller. Pad, don't grow.
- Visible focus ring on every interactive element. Never `outline: none` without a
  replacement.
- Text contrast at least 4.5:1 in both themes. The `invert` tokens deliberately do
  not flip with the theme, because a "white on brand blue" button must stay white on
  brand blue in dark mode.
- Every icon-only control has an accessible name.
- State changes users can't see (snackbars) are announced via live regions.

## Where things stand

`docs/COMPONENT-INVENTORY.md` is the live status table — every component set in the
Figma file, its node ID, its variant properties, and whether it is built. Fifteen
components are `done`; the `todo` rows list what's left with the node IDs needed to
pick each one up.

`docs/DESIGN-SYSTEM.md` is the extracted spec: color ramps, semantic mappings,
typography scale, spacing, radius, elevation, and the discrepancies found between
what Figma labels a value and what it actually renders.
