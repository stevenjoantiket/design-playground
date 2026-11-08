import type { GlyphName } from "../design-system/icons.js";
import { Icon } from "./portal.js";
import type { ChartType } from "./chartTypes.js";

/**
 * ponytail: the TDS icon library (Icon - Passport 4.0) has no stacked-chart or pie icon, so these
 * four are drawn here, on the library's 24px canvas in the style of tds_ic_bar_chart (solid
 * rounded bars on a baseline). Replace each with the TDS file once the library has it.
 */
const DRAWN = {
  // tds_ic_bar_chart's three bars, each split into two parts by a gap.
  stackedColumn: `<rect x="2" y="20" width="20" height="2" rx="1"/>
    <rect x="2" y="13.4" width="5.9" height="5.6" rx="1.1"/><rect x="2" y="9" width="5.9" height="3" rx="1.1"/>
    <rect x="9.06" y="11" width="5.88" height="8" rx="1.1"/><rect x="9.06" y="5" width="5.88" height="4.6" rx="1.1"/>
    <rect x="16.1" y="9.4" width="5.9" height="9.6" rx="1.1"/><rect x="16.1" y="2" width="5.9" height="6" rx="1.1"/>`,
  // A filled band on the baseline with a second line riding above it.
  stackedLine: `<rect x="2" y="20" width="20" height="2" rx="1"/>
    <path d="M2 19V15.2L8 11.6L13 14L22 8.6V19H2Z"/>
    <path d="M3 10.4L8 6.6L13 9.2L21 3.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  // A ring of two slices, the smaller one pulled out.
  pie: `<path d="M11 13V3.05A9 9 0 1 0 20.95 13H11Z"/><path d="M13.2 10.8V1.2A9.6 9.6 0 0 1 22.8 10.8H13.2Z"/>`,
};

/** Each chart type's icon: from the TDS library where it has one; Bar and Stacked bar are their column icons turned on their side. */
const ICONS: Record<ChartType, { glyph?: GlyphName; drawn?: keyof typeof DRAWN; sideways?: boolean }> = {
  line: { glyph: "trending" },
  "stacked-line": { drawn: "stackedLine" },
  column: { glyph: "barChart" },
  "stacked-column": { drawn: "stackedColumn" },
  bar: { glyph: "barChart", sideways: true },
  "stacked-bar": { drawn: "stackedColumn", sideways: true },
  pie: { drawn: "pie" },
  table: { glyph: "table" },
};

/** Drawn in the current text colour. */
export function ChartTypeIcon({ type }: { type: ChartType }) {
  const icon = ICONS[type];
  return (
    // Turned a quarter clockwise, the baseline runs down the left and the bars run right.
    <span className="mp-type-icon" data-sideways={icon.sideways || undefined}>
      {icon.glyph ? (
        <Icon name={icon.glyph} size={20} />
      ) : (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" dangerouslySetInnerHTML={{ __html: DRAWN[icon.drawn!] }} />
      )}
    </span>
  );
}
