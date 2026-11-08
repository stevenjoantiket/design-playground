/**
 * Mixpanel's chart types for a report, in the order of its chart menu. Mixpanel's tools don't say
 * which one a saved report uses, so an added chart's type is picked on the page and saved in its file.
 */
export const CHART_TYPES = {
  line: "Line",
  "stacked-line": "Stacked line",
  column: "Column",
  "stacked-column": "Stacked column",
  bar: "Bar",
  "stacked-bar": "Stacked bar",
  pie: "Pie",
  table: "Table",
} as const;

export type ChartType = keyof typeof CHART_TYPES;

export const isChartType = (value: unknown): value is ChartType => typeof value === "string" && Object.hasOwn(CHART_TYPES, value);
