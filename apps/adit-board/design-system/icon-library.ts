/*
 * The real `tds_ic_*` drop, read straight out of `tds library/tds icon`.
 *
 * `?url` rather than `?raw`: there are over a thousand files and one of them (the
 * mascot) is 800 KB on its own, so URLs keep the bundle small and let the browser fetch
 * only the tiles that scroll into view. The cost is that each file keeps the fill it was
 * exported with — neutral grey or brand blue — which is why the grid puts them on a
 * static-white tile instead of tinting them per theme.
 *
 * These are the source assets, not a component: nothing here goes through `Icon`.
 */

const files = import.meta.glob<string>(
  [
    "../../../tds library/tds icon/*.svg",
    // A `%` in a file name is a percent-escape as far as the dev server is concerned, so
    // `tds_ic_tiket_100%_refund.svg` becomes a malformed URL, and one malformed URL in an
    // eager glob takes the whole page down rather than one tile. That file has been
    // renamed to `..._100_percent_refund.svg`; this keeps a re-exported drop from
    // reintroducing the blank screen, at the cost of quietly omitting the icon.
    "!../../../tds library/tds icon/*%*.svg",
  ],
  {
    query: "?url",
    import: "default",
    eager: true,
  },
);

export interface LibraryIcon {
  /** File name without the extension, e.g. `tds_ic_wifi` — what you search Figma for. */
  name: string;
  url: string;
}

export const ICONS: LibraryIcon[] = Object.entries(files)
  .map(([path, url]) => ({
    name: path.slice(path.lastIndexOf("/") + 1).replace(/\.svg$/, ""),
    url,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Underscores are what the files use; spaces and hyphens are what people type. */
function normalize(value: string): string {
  return value.toLowerCase().replace(/[\s-]+/g, "_");
}

/**
 * Substring match on the file name, so `wifi`, `tds_ic_wifi` and `ic wifi` all find
 * `tds_ic_wifi`. Both sides get normalized because a handful of files were exported with
 * spaces in the name — `tds_ic_tour guide.svg` — and nobody searching for it will guess
 * which separator it used.
 */
export function matchesQuery(icon: LibraryIcon, query: string): boolean {
  const needle = normalize(query.trim());
  return needle === "" || normalize(icon.name).includes(needle);
}
