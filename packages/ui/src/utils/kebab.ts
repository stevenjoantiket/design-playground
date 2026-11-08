/**
 * `staticWhite` → `static-white`. Token names are camelCase in TypeScript and kebab-case
 * in CSS, so every component that puts a token name in a `data-` attribute has to convert
 * on the way out. Shared because the two that forgot to — and the CSS selectors written to
 * match the wrong spelling — cost an afternoon.
 */
export const kebab = (value: string): string =>
  value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
