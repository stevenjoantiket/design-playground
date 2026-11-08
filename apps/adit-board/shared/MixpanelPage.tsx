import { useState, type ReactNode } from "react";

import { BuildStep, HandoffProgress, openInClaude } from "./BuildStep.js";
import { ChartTypeIcon } from "./ChartTypeIcon.js";
import { CHART_TYPES, type ChartType } from "./chartTypes.js";
import { useHashPage } from "./hashPage.js";
import { isMixpanelLink, isUnsavedQuery } from "./mixpanelLink.js";
import { rangeLabel, syncedLabel } from "./mixpanelLabels.js";
import "./mixpanel-page.css";
import { Dialog, Field, Icon, Segmented } from "./portal.js";

/** A project's Mixpanel snapshot (`projects/<project>/data/mixpanel-cases.json`), pulled once and synced on demand. */
export interface MixpanelSnapshot {
  source: string;
  from: string;
  to: string;
  /** When the numbers were last pulled, ISO. */
  syncedAt: string;
  payers: number;
  payersNote: string;
  cases: Record<string, { users: number; summary: string; how: string; report: string }>;
  monthly: {
    note: string;
    reports: Record<string, string>;
    rows: { month: string; payers: number; returning: number; promo: number; points: number }[];
  };
}

const full = new Intl.NumberFormat("en");
const monthLabel = (iso: string) => new Date(`${iso}-01`).toLocaleString("en", { month: "short" });
const share = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

type Row = MixpanelSnapshot["monthly"]["rows"][number];
const monthYear = (r: Row) => `${monthLabel(r.month)} ${r.month.slice(0, 4)}`;

/** A bar with rounded top corners only, so its square foot sits on the baseline. */
const topRounded = (x: number, y: number, w: number, h: number) => {
  const r = Math.min(4, h, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
};

/** At most five gridlines on round numbers: 100K, 200K… */
function ticksFor(max: number) {
  const pow = 10 ** Math.floor(Math.log10(max));
  let step = max / pow <= 2 ? pow / 2 : pow;
  if (max / step > 5) step *= 2;
  return Array.from({ length: Math.ceil(max / step) }, (_, i) => (i + 1) * step);
}
const compact = new Intl.NumberFormat("en", { notation: "compact" });

/** Labels at the end of a chart, in the order given, pushed apart so none overlaps the one above it. */
function spread(ys: number[]) {
  const out = [...ys];
  const order = ys.map((_, i) => i).sort((a, b) => ys[a]! - ys[b]!);
  order.forEach((i, k) => {
    if (k > 0) out[i] = Math.max(out[i]!, out[order[k - 1]!]! + 16);
  });
  return out;
}

const PAD = { left: 44, right: 84, top: 8, bottom: 28 };

/**
 * The hover card for the month under the pointer, beside it so the mark stays in view: right of
 * the first half's months, left of the second half's. `x` is the month's x in the chart's units.
 */
function Tip({ x, width, flip, children }: { x: number; width: number; flip: boolean; children: ReactNode }) {
  const left = ((x + PAD.left) / (width + PAD.left + PAD.right)) * 100;
  return (
    <div className="mp-tip" style={{ left: `${left}%`, transform: flip ? "translateX(calc(-100% - 16px))" : "translateX(16px)" }} role="status">
      {children}
    </div>
  );
}

/** Payers per month, returning at the foot of each bar; hover a month for its numbers. */
function PayersChart({ rows }: { rows: Row[] }) {
  const [hover, setHover] = useState<number>();
  const W = 720;
  const H = 220;
  const ticks = ticksFor(Math.max(1, ...rows.map((r) => r.payers)));
  const top = ticks.at(-1)!;
  const slot = W / rows.length;
  const bar = slot - 12;
  const y = (v: number) => H - (v / top) * H;
  const last = rows.at(-1)!;
  const [retY = 0, otherY = 0] = spread([y(last.returning / 2), y((last.payers + last.returning) / 2)]);
  const r = hover === undefined ? undefined : rows[hover];
  return (
    <div className="mp-plot" onMouseLeave={() => setHover(undefined)}>
      <svg
        className="mp-chart"
        viewBox={`${-PAD.left} ${-PAD.top} ${W + PAD.left + PAD.right} ${H + PAD.top + PAD.bottom}`}
        role="img"
        aria-label="Payers per month, returning and others"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="mp-chart__grid" x1={0} x2={W} y1={y(t)} y2={y(t)} />
            <text className="mp-chart__label" x={-10} y={y(t) + 4} textAnchor="end">
              {compact.format(t)}
            </text>
          </g>
        ))}
        {rows.map((row, i) => {
          const x = i * slot + 6;
          const hr = H - y(row.returning);
          // A 2px surface gap between the two parts of a bar.
          const ho = Math.max(0, H - y(row.payers) - hr - 2);
          return (
            <g key={row.month} data-dim={hover !== undefined && hover !== i ? "" : undefined}>
              <rect className="mp-chart__returning" x={x} y={H - hr} width={bar} height={hr} />
              <path className="mp-chart__other" d={topRounded(x, H - hr - 2 - ho, bar, ho)} />
              <text className="mp-chart__label" x={x + bar / 2} y={H + 20} textAnchor="middle">
                {monthLabel(row.month)}
              </text>
            </g>
          );
        })}
        <line className="mp-chart__base" x1={0} x2={W} y1={H} y2={H} />
        <text className="mp-chart__end" x={W + 8} y={retY + 4}>
          Returning
        </text>
        <text className="mp-chart__end" x={W + 8} y={otherY + 4}>
          Others
        </text>
        {/* Hit targets: the whole column, not just the bar. */}
        {rows.map((row, i) => (
          <rect key={row.month} className="mp-chart__hit" x={i * slot} y={0} width={slot} height={H} onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {r && hover !== undefined ? (
        <Tip x={hover * slot + slot / 2} width={W} flip={hover >= rows.length / 2}>
          <span className="p-sm p-strong">{monthYear(r)}</span>
          <span className="p-sm">{full.format(r.payers)} payers</span>
          <span className="p-sm">
            <span className="mp-key mp-key--returning" /> Returning {full.format(r.returning)} ({share(r.returning, r.payers)}%)
          </span>
          <span className="p-sm">
            <span className="mp-key mp-key--other" /> Others {full.format(r.payers - r.returning)}
          </span>
        </Tip>
      ) : null}
    </div>
  );
}

/** Promo and points users as a share of payers, month by month; hover a month for its numbers. */
function SavingsChart({ rows }: { rows: Row[] }) {
  const [hover, setHover] = useState<number>();
  const W = 720;
  const H = 180;
  const step = W / (rows.length - 1);
  const pct = (r: Row, key: "promo" | "points") => (r.payers ? Math.min(100, (r[key] / r.payers) * 100) : 0);
  const y = (p: number) => H - (p / 100) * H;
  const line = (key: "promo" | "points") => rows.map((r, i) => `${i * step},${y(pct(r, key))}`).join(" ");
  const last = rows.at(-1)!;
  const [promoY = 0, pointsY = 0] = spread([y(pct(last, "promo")), y(pct(last, "points"))]);
  const r = hover === undefined ? undefined : rows[hover];
  return (
    <div className="mp-plot" onMouseLeave={() => setHover(undefined)}>
      <svg
        className="mp-chart"
        viewBox={`${-PAD.left} ${-PAD.top} ${W + PAD.left + PAD.right} ${H + PAD.top + PAD.bottom}`}
        role="img"
        aria-label="Promo and points users as a share of payers, per month"
      >
        {[25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line className="mp-chart__grid" x1={0} x2={W} y1={y(t)} y2={y(t)} />
            <text className="mp-chart__label" x={-10} y={y(t) + 4} textAnchor="end">
              {t}%
            </text>
          </g>
        ))}
        <line className="mp-chart__base" x1={0} x2={W} y1={H} y2={H} />
        {rows.map((row, i) => (
          <text key={row.month} className="mp-chart__label" x={i * step} y={H + 20} textAnchor="middle">
            {monthLabel(row.month)}
          </text>
        ))}
        {hover !== undefined ? <line className="mp-chart__cross" x1={hover * step} x2={hover * step} y1={0} y2={H} /> : null}
        <polyline className="mp-chart__promo" points={line("promo")} />
        <polyline className="mp-chart__points" points={line("points")} />
        {rows.map((row, i) => (
          <g key={row.month}>
            <circle className="mp-chart__promo-dot" cx={i * step} cy={y(pct(row, "promo"))} r={4} />
            <circle className="mp-chart__points-dot" cx={i * step} cy={y(pct(row, "points"))} r={4} />
          </g>
        ))}
        <text className="mp-chart__end" x={W + 10} y={promoY + 4}>
          Promo {share(last.promo, last.payers)}%
        </text>
        <text className="mp-chart__end" x={W + 10} y={pointsY + 4}>
          Points {share(last.points, last.payers)}%
        </text>
        {rows.map((row, i) => (
          <rect key={row.month} className="mp-chart__hit" x={i * step - step / 2} y={0} width={step} height={H} onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {r && hover !== undefined ? (
        <Tip x={hover * step} width={W} flip={hover >= rows.length / 2}>
          <span className="p-sm p-strong">{monthYear(r)}</span>
          <span className="p-sm">
            <span className="mp-key mp-key--promo" /> Promo {share(r.promo, r.payers)}% ({full.format(r.promo)})
          </span>
          <span className="p-sm">
            <span className="mp-key mp-key--points" /> Points {share(r.points, r.payers)}% ({full.format(r.points)})
          </span>
          <span className="p-sm p-muted">
            of {full.format(r.payers)} payers
          </span>
        </Tip>
      ) : null}
    </div>
  );
}

/** A project on the Mixpanel page: its snapshot (`projects/<project>/data/mixpanel-cases.json`), or none yet. */
export interface MixpanelSource {
  project: string;
  title: string;
  data?: MixpanelSnapshot;
  /** The case ids in `data.cases`, with the names the prototype gives them. */
  labels?: { id: string; label: string }[];
  syncBrief?: string;
}

/**
 * The Mixpanel page, linked from the side menu above Research: every project's numbers, a section
 * each. A project with a snapshot shows its common cases' shares and their months; "Sync" opens
 * Claude Code in Terminal with its `syncBrief`, which queries Mixpanel and rewrites the snapshot,
 * and the page updates when the file changes.
 */
export function MixpanelPage({ sources }: { sources: MixpanelSource[] }) {
  // A tab per project, kept in the hash (`mixpanel/#insurance`); the first by default.
  const [ids] = useState(() => sources.map((s) => s.project));
  const [project] = useHashPage(ids);
  const shown = sources.filter((s) => s.project === project);
  return (
    <div className="portal">
      <main className="p-main">
        <section className="p-card">
          <div className="p-card__head">
            <h1 className="p-h1">
              Mixpanel
            </h1>
            <Segmented
              label="Project"
              className="mp-tabs"
              options={sources.map((s) => ({ value: s.project, label: s.title }))}
              value={project}
              onChange={(next) => (location.hash = next)}
            />
          </div>
        </section>
        {shown.map((source) => (
          <div key={source.project} className="mp-project">
            {source.data && source.labels && source.syncBrief ? (
              <MixpanelSection {...source} data={source.data} labels={source.labels} syncBrief={source.syncBrief} />
            ) : (
              <section className="p-card" aria-labelledby={`mp-${source.project}`}>
                <h2 className="p-h1" id={`mp-${source.project}`}>
                  {source.title}
                </h2>
                <p className="p-muted">
                  No snapshot for {source.title.toLowerCase()} yet. Add charts from Mixpanel links below.
                </p>
              </section>
            )}
            {chartsOf(source.project).map(({ id, chart }) => (
              <AddedChart key={id} project={source.project} title={source.title} id={id} chart={chart} />
            ))}
            <AddChart project={source.project} title={source.title} />
          </div>
        ))}
      </main>
    </div>
  );
}

/** One project's numbers: an overview (dates, headline shares, Sync), then the two monthly charts and their table. */
function MixpanelSection({
  project,
  title,
  data,
  labels,
  syncBrief,
}: MixpanelSource & { data: MixpanelSnapshot; labels: { id: string; label: string }[]; syncBrief: string }) {
  const rows = data.monthly.rows;
  return (
    <section className="mp-project" aria-labelledby={`mp-${project}`}>
      <section className="p-card">
        <div className="p-card__head">
          <div className="p-stack">
            <h2 className="p-h1" id={`mp-${project}`}>
              {title}
            </h2>
            <span className="p-muted">
              {data.source} · {rangeLabel(data.from, data.to)}
            </span>
          </div>
          <span className="p-sm p-muted">
            Last synced {syncedLabel(data.syncedAt)}
          </span>
        </div>

        {/* The headline numbers: all payers, then each common case's share of them, linked to its report. */}
        <ul className="mp-stats">
          <li className="mp-stat">
            <span className="p-sm p-muted">
              Payers
            </span>
            <span className="p-num">{full.format(data.payers)}</span>
            <span className="p-sm p-muted">
              {data.payersNote}
            </span>
          </li>
          {labels.map(({ id, label }) => {
            const item = data.cases[id];
            if (!item) return null;
            const pct = share(item.users, data.payers);
            return (
              <li key={id}>
                <a className="mp-stat" href={item.report} target="_blank" rel="noreferrer" title={item.how}>
                  <span className="p-sm p-muted">
                    {label}
                  </span>
                  <span className="p-num">{pct}%</span>
                  <span className="mp-bar" aria-hidden="true">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                  <span className="p-sm p-muted">
                    {/* The summary, unless it only repeats the share. */}
                    {item.summary === `${pct}% of payers` ? `${full.format(item.users)} payers` : item.summary}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <ol className="mp-sync">
          <BuildStep
            n={1}
            title="Sync from Mixpanel"
            status="ready"
            note="Opens Claude Code in Terminal. It runs the same queries for the latest 12 months and rewrites the snapshot; this page updates by itself."
            fileKey={`${project}/mixpanel`}
            brief={syncBrief}
            kind="mixpanel"
            action="Sync with magic"
          />
        </ol>
      </section>

      <section className="p-card">
        <div className="p-card__head">
          <div className="p-stack">
            <h3 className="p-h2">
              Payers per month
            </h3>
            <p className="mp-legend">
              <span className="mp-key mp-key--returning" /> <span className="p-sm">Returning</span>
              <span className="mp-key mp-key--other" /> <span className="p-sm">Others (new users, guests)</span>
            </p>
          </div>
          <a className="p-btn p-btn--outline" href={data.monthly.reports.payers} target="_blank" rel="noreferrer">
            Open in Mixpanel
          </a>
        </div>
        {rows.length > 1 ? <PayersChart rows={rows} /> : null}
      </section>

      <section className="p-card">
        <div className="p-card__head">
          <div className="p-stack">
            <h3 className="p-h2">
              Promo and points, share of payers
            </h3>
            <p className="mp-legend">
              <span className="mp-key mp-key--promo" /> <span className="p-sm">Continued with promo</span>
              <span className="mp-key mp-key--points" /> <span className="p-sm">Continued with tiket points</span>
            </p>
          </div>
          <a className="p-btn p-btn--outline" href={data.monthly.reports.savings} target="_blank" rel="noreferrer">
            Open in Mixpanel
          </a>
        </div>
        {rows.length > 1 ? <SavingsChart rows={rows} /> : null}
        <p className="p-sm p-muted">
          {data.monthly.note}
        </p>
        {/* The charts' numbers, for reading or copying. */}
        <details className="mp-table">
          <summary>
            <span className="p-strong p-link">
              Show the months as a table
            </span>
          </summary>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Payers</th>
                <th>Returning</th>
                <th>Promo</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month}>
                  <th>{monthYear(r)}</th>
                  <td>{full.format(r.payers)}</td>
                  <td>
                    {full.format(r.returning)} ({share(r.returning, r.payers)}%)
                  </td>
                  <td>
                    {full.format(r.promo)} ({share(r.promo, r.payers)}%)
                  </td>
                  <td>
                    {full.format(r.points)} ({share(r.points, r.payers)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>
    </section>
  );
}

/**
 * A chart added from a Mixpanel link, `projects/<project>/data/mixpanel-charts/<id>.json`. The dev server saves
 * the link (`mixpanelCharts.ts`); Claude Code reads the report and fills in the rest.
 */
export interface MixpanelChart {
  report: string;
  /** When the link was pasted, ms. */
  addedAt: number;
  /** Saved, and waiting for Claude Code to fill it in. */
  pending?: boolean;
  /** Why the report couldn't be read. */
  error?: string;
  title?: string;
  /** Claude's guess at the shape, from the numbers: Mixpanel's tools don't give a report's chart type. */
  kind?: "line" | "bar";
  /** The chart type picked on the page, as in Mixpanel's chart menu; it wins over `kind`. */
  chart?: ChartType;
  unit?: "count" | "percent";
  range?: string;
  syncedAt?: string;
  note?: string;
  x?: string[];
  series?: { name: string; values: number[] }[];
}

const CHART_FILES = import.meta.glob("../projects/*/data/mixpanel-charts/*.json", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
/** Each chart file that parses; a bad one (malformed, or caught mid-write) is left out rather than failing the page. */
const CHARTS: Record<string, MixpanelChart> = Object.fromEntries(
  Object.entries(CHART_FILES).flatMap(([path, text]) => {
    try {
      const chart = JSON.parse(text) as MixpanelChart;
      return chart && typeof chart.report === "string" ? [[path, chart]] : [];
    } catch {
      return [];
    }
  }),
);

/** A project's added charts, oldest first (an id is the base-36 time it was added). */
const chartsOf = (project: string) =>
  Object.entries(CHARTS)
    .filter(([path]) => path.startsWith(`../projects/${project}/data/mixpanel-charts/`))
    .map(([path, chart]) => ({ id: path.split("/").at(-1)!.replace(/\.json$/, ""), chart }))
    .sort((a, b) => (a.chart.addedAt || 0) - (b.chart.addedAt || 0));

/** What Claude Code is asked to do with a pasted link: read the report and fill in the chart's file. */
const chartBrief = (project: string, title: string, id: string, url: string) => `# Add a Mixpanel chart to the ${title} Mixpanel page

Report link: ${url}

Fill in \`apps/adit-board/projects/${project}/data/mixpanel-charts/${id}.json\`. It holds the link, \`addedAt\` and \`"pending": true\` now.

Use the Mixpanel MCP tools. Call Get-Business-Context first. The project id follows \`/project/\` in the link;
the report's id is in \`#view/<id>\`, \`#report/<id>\`, \`report-<id>\` or a board's \`editor-card-id\`.
Call Get-Report with that id and \`skip_results: false\`: its \`results\` are the numbers, for the report's
own date range and settings. Don't rebuild the query.

Write the file as JSON with exactly these keys:
- "report": the link, unchanged; "addedAt": unchanged
- "title": the report's name
- "kind": "line" for numbers over time, "bar" for totals by a breakdown or a funnel's steps
- "unit": "percent" when the values are percentages or conversion rates (0–100), else "count"
- "range": the date range, like "Oct 2025 – Oct 2026"
- "syncedAt": now, ISO with the +07:00 offset
- "note": one sentence on what is counted (event, measure, filters)
- "x": the labels along the bottom, short ("Oct", "3 Mar", "Search"), oldest first
- "series": at most 4 of {"name", "values"}, one value per label in "x"; fold the rest into one "Other"

Leave out "pending". If the report can't be read, write only "report", "addedAt" and "error" (one
sentence on why). Do not change any other file.
`;

/** Series colours, in this order, never cycled: checked for colour-blind separation on every pair. */
const SERIES_COUNT = 4;

type Series = { name: string; values: number[] };
type Plot = { title: string; labels: string[]; series: Series[]; unit: MixpanelChart["unit"] };

const typeOf = (chart: MixpanelChart): ChartType => chart.chart ?? (chart.kind === "bar" ? "column" : "line");
const formatFor = (unit: MixpanelChart["unit"]) => (v: number) => (unit === "percent" ? `${Math.round(v * 10) / 10}%` : full.format(Math.round(v)));

/**
 * One number per series, for Pie: counts are summed across the labels, shares averaged.
 * A sum of monthly unique users counts someone active in two months twice, as the caption says.
 */
const aggregate = (values: number[], unit: MixpanelChart["unit"]) => {
  const sum = values.reduce((t, v) => t + v, 0);
  return unit === "percent" ? sum / Math.max(1, values.length) : sum;
};
const aggregateNote = ({ labels, unit }: Plot) =>
  unit === "percent"
    ? `Averaged across ${labels[0]} – ${labels.at(-1)}.`
    : `Summed across ${labels[0]} – ${labels.at(-1)}, so anyone counted in two of them counts twice; Mixpanel's own total of unique users can be lower.`;

/** Why a stacked chart's axis runs past every single series: it measures their total. */
const STACKED_NOTE =
  "Stacked: each series is drawn on top of the ones below it, so the axis reaches their total. Pick Line or Column to read each on its own; don't stack numbers that overlap, like a funnel's steps.";

/** Line, Stacked line, Column and Stacked column: labels along the bottom; hover a label for its values. */
function AxisChart({ title, labels, series, unit, type }: Plot & { type: "line" | "stacked-line" | "column" | "stacked-column" }) {
  const [hover, setHover] = useState<number>();
  const n = labels.length;
  const W = 720;
  const H = 200;
  const fmt = formatFor(unit);
  const stacked = type.startsWith("stacked");
  // Each series' top: its own values, or, stacked, the running total up to it.
  const tops = series.map((_, k) => labels.map((__, i) => series.slice(stacked ? 0 : k, k + 1).reduce((t, s) => t + (s.values[i] ?? 0), 0)));
  const ticks = ticksFor(Math.max(1, ...tops.flat()));
  const top = ticks.at(-1)!;
  const y = (v: number) => H - (Math.max(0, v) / top) * H;
  const line = type.endsWith("line") && n > 1;
  const slot = line ? W / (n - 1) : W / n;
  const cx = (i: number) => (line ? i * slot : i * slot + slot / 2);
  // Every label when they fit; otherwise every k-th, so they never collide.
  const every = Math.ceil(n / 12);
  const ends = line ? spread(tops.map((t) => y(t.at(-1) ?? 0))) : [];
  const columns = stacked ? 1 : series.length;
  const bar = Math.min(48, Math.max(2, (slot - 12) / columns - 2));
  // A label's columns, centred in its slot.
  const inset = (slot - columns * (bar + 2) + 2) / 2;
  const floor = (k: number, i: number) => (stacked && k > 0 ? tops[k - 1]![i]! : 0);
  return (
    <div className="mp-plot" onMouseLeave={() => setHover(undefined)}>
      <svg
        className="mp-chart"
        viewBox={`${-PAD.left} ${-PAD.top} ${W + PAD.left + PAD.right} ${H + PAD.top + PAD.bottom}`}
        role="img"
        aria-label={`${title}: ${series.map((s) => s.name).join(", ")}`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="mp-chart__grid" x1={0} x2={W} y1={y(t)} y2={y(t)} />
            <text className="mp-chart__label" x={-10} y={y(t) + 4} textAnchor="end">
              {unit === "percent" ? `${t}%` : compact.format(t)}
            </text>
          </g>
        ))}
        <line className="mp-chart__base" x1={0} x2={W} y1={H} y2={H} />
        {labels.map((label, i) =>
          i % every === 0 ? (
            <text key={i} className="mp-chart__label" x={cx(i)} y={H + 20} textAnchor="middle">
              {label}
            </text>
          ) : null,
        )}
        {line ? (
          <>
            {hover !== undefined ? <line className="mp-chart__cross" x1={cx(hover)} x2={cx(hover)} y1={0} y2={H} /> : null}
            {series.map((s, k) => {
              const points = tops[k]!.map((v, i) => `${cx(i)},${y(v)}`);
              // Stacked, each series fills the band between the one under it and its own line.
              const band = stacked ? [...points, ...labels.map((_, i) => `${cx(i)},${y(floor(k, i))}`).reverse()].join(" ") : "";
              return (
                <g key={k} className={`mp-s${k}`}>
                  {stacked ? <polygon className="mp-chart__area" points={band} /> : null}
                  <polyline className="mp-chart__line" points={points.join(" ")} />
                  {n <= 31 ? tops[k]!.map((v, i) => <circle key={i} className="mp-chart__dot" cx={cx(i)} cy={y(v)} r={4} />) : null}
                  <text className="mp-chart__end" x={W + 10} y={ends[k]! + 4}>
                    {s.name.length > 10 ? `${s.name.slice(0, 9)}…` : s.name}
                  </text>
                </g>
              );
            })}
          </>
        ) : (
          labels.map((_, i) => (
            <g key={i} data-dim={hover !== undefined && hover !== i ? "" : undefined}>
              {series.map((_, k) => {
                const x = i * slot + inset + (stacked ? 0 : k * (bar + 2));
                // Stacked, a 2px surface gap separates each part from the one under it; only the top part is rounded.
                const base = y(floor(k, i)) - (stacked && k > 0 ? 2 : 0);
                const h = Math.max(0, base - y(tops[k]![i]!));
                return stacked && k < series.length - 1 ? (
                  <rect key={k} className={`mp-s${k} mp-chart__bar`} x={x} y={base - h} width={bar} height={h} />
                ) : (
                  <path key={k} className={`mp-s${k} mp-chart__bar`} d={topRounded(x, base - h, bar, h)} />
                );
              })}
            </g>
          ))
        )}
        {labels.map((_, i) => (
          <rect
            key={i}
            className="mp-chart__hit"
            x={line ? cx(i) - slot / 2 : i * slot}
            y={0}
            width={slot}
            height={H}
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {hover !== undefined ? (
        <Tip x={cx(hover)} width={W} flip={hover >= n / 2}>
          <span className="p-sm p-strong">{labels[hover]}</span>
          {series.map((s, k) => (
            <span className="p-sm" key={k}>
              <span className={`mp-key mp-s${k}`} /> {s.name} {fmt(s.values[hover] ?? 0)}
            </span>
          ))}
          {stacked && series.length > 1 ? (
            <span className="p-sm p-muted">
              Total {fmt(tops.at(-1)![hover]!)}
            </span>
          ) : null}
        </Tip>
      ) : null}
    </div>
  );
}

/** Bar and Stacked bar: a row per label, its bars running right, each with its value at the end. */
function BarRows({ title, labels, series, unit, stacked }: Plot & { stacked: boolean }) {
  const fmt = formatFor(unit);
  const totals = labels.map((_, i) => series.reduce((t, s) => t + (s.values[i] ?? 0), 0));
  const max = Math.max(1, ...(stacked ? totals : series.flatMap((s) => s.values)));
  const width = (v: number) => `${(Math.max(0, v) / max) * 100}%`;
  return (
    <ul className="mp-rows" aria-label={title}>
      {labels.map((label, i) => (
        <li key={i}>
          {/* Beside all of its bars. */}
          <span className="mp-rows__label" style={{ gridRow: `span ${stacked ? 1 : series.length}` }}>
            <span className="p-sm">{label}</span>
          </span>
          {stacked ? (
            <span className="mp-rows__row">
              <span className="mp-rows__track">
                {series.map((s, k) => (
                  <span key={k} className={`mp-s${k} mp-rows__bar`} style={{ width: width(s.values[i] ?? 0) }} title={`${s.name}: ${fmt(s.values[i] ?? 0)}`} />
                ))}
              </span>
              <span className="p-sm p-strong">{fmt(totals[i]!)}</span>
            </span>
          ) : (
            series.map((s, k) => (
              <span key={k} className="mp-rows__row">
                <span className="mp-rows__track">
                  <span className={`mp-s${k} mp-rows__bar`} style={{ width: width(s.values[i] ?? 0) }} title={s.name} />
                </span>
                <span className="p-sm p-strong">{fmt(s.values[i] ?? 0)}</span>
              </span>
            ))
          )}
        </li>
      ))}
    </ul>
  );
}

/** Pie: each series' share of the whole, as a ring with a 2px surface gap between slices, and its numbers beside it. */
function PieChart(plot: Plot) {
  const fmt = formatFor(plot.unit);
  const totals = plot.series.map((s) => aggregate(s.values, plot.unit));
  const all = Math.max(1e-9, totals.reduce((t, v) => t + v, 0));
  const R = 60;
  const C = 2 * Math.PI * R;
  // Where each slice starts along the ring.
  const starts = totals.map((_, k) => totals.slice(0, k).reduce((t, v) => t + (v / all) * C, 0));
  return (
    <div className="mp-pie">
      <svg viewBox="-80 -80 160 160" role="img" aria-label={`${plot.title}: share of each`}>
        {totals.map((t, k) => {
          const len = (t / all) * C;
          return (
            <circle
              key={k}
              className={`mp-s${k} mp-pie__slice`}
              r={R}
              strokeDasharray={`${Math.max(0, len - (totals.length > 1 ? 2 : 0))} ${C}`}
              strokeDashoffset={-starts[k]!}
              transform="rotate(-90)"
            />
          );
        })}
      </svg>
      <ul className="mp-pie__legend">
        {plot.series.map((s, k) => (
          <li key={k}>
            <span className={`mp-key mp-s${k}`} />
            <span>{s.name}</span>
            <span className="p-strong">{Math.round((totals[k]! / all) * 100)}%</span>
            <span className="p-sm p-muted">
              {fmt(totals[k]!)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The numbers as a table: the Table type, and every other type's "Show as a table". */
function ChartTable({ labels, series, unit }: Plot) {
  const fmt = formatFor(unit);
  return (
    <table className="mp-numbers">
      <thead>
        <tr>
          <th />
          {series.map((s, k) => (
            <th key={k}>{s.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {labels.map((label, i) => (
          <tr key={i}>
            <th>{label}</th>
            {series.map((s, k) => (
              <td key={k}>{fmt(s.values[i] ?? 0)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** An added chart drawn as its type. */
function SeriesChart({ plot, type }: { plot: Plot; type: ChartType }) {
  switch (type) {
    case "line":
    case "stacked-line":
    case "column":
    case "stacked-column":
      return <AxisChart {...plot} type={type} />;
    case "bar":
    case "stacked-bar":
      return <BarRows {...plot} stacked={type === "stacked-bar"} />;
    case "pie":
      return <PieChart {...plot} />;
    case "table":
      return <ChartTable {...plot} />;
  }
}

/** One added chart's card: waiting for Claude, the reason it failed, or the chart; a bin to delete it. */
function AddedChart({ project, title, id, chart }: { project: string; title: string; id: string; chart: MixpanelChart }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<ChartType>();
  // Drawable only with labels and series that each have values: anything less shows the missing-numbers note.
  const ready =
    !chart.pending && !chart.error && Array.isArray(chart.x) && chart.x.length && Array.isArray(chart.series) && chart.series.length && chart.series.every((s) => Array.isArray(s?.values));
  const name = chart.title ?? "this chart";
  const series = chart.series?.slice(0, SERIES_COUNT) ?? [];

  const remove = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/mixpanel-charts/${project}?id=${id}`, { method: "DELETE" });
      // The card goes when its file does.
      if (!res.ok) setError((await res.json()).error ?? "Couldn't delete it.");
      else setConfirming(false);
    } catch {
      setError("Couldn't reach the dev server.");
    }
    setBusy(false);
  };

  const type = picked ?? typeOf(chart);
  const stacked = type.startsWith("stacked") && series.length > 1;
  const plot: Plot = { title: name, labels: chart.x ?? [], series, unit: chart.unit };
  // Legends only where the chart doesn't name its series itself.
  const legend = series.length > 1 && (type.includes("line") || type.includes("column") || type.includes("bar"));

  /** Saves the picked type in the chart's file, for everyone; it shows at once. */
  const pick = async (next: ChartType) => {
    setPicked(next);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/mixpanel-charts/${project}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, chart: next }),
      });
      if (!res.ok) setError((await res.json()).error ?? "Couldn't save the chart type.");
    } catch {
      setError("Couldn't reach the dev server.");
    }
  };

  const retry = async () => {
    const handoff = await openInClaude(`${project}/chart-${id}`, chartBrief(project, title, id, chart.report), "chart");
    setError(handoff.error ?? "");
  };

  return (
    <section className="p-card">
      <div className="p-card__head">
        <div className="p-stack">
          <h3 className="p-h2">
            {chart.pending ? "Adding a chart from Mixpanel…" : (chart.title ?? "Chart from Mixpanel")}
          </h3>
          {ready && legend ? (
            <p className="mp-legend">
              {series.map((s, k) => (
                <span key={k} className="mp-legend__item">
                  <span className={`mp-key mp-s${k}`} /> <span className="p-sm">{s.name}</span>
                </span>
              ))}
            </p>
          ) : null}
          {ready && (chart.range || chart.syncedAt) ? (
            <span className="p-sm p-muted">
              {[chart.range, chart.syncedAt && `Synced ${syncedLabel(chart.syncedAt)}`].filter(Boolean).join(" · ")}
            </span>
          ) : null}
        </div>
        <div className="mp-actions">
          {ready && import.meta.env.DEV ? (
            // Mixpanel's chart menu as a row of icons; the one shown is pressed.
            <div className="mp-types" role="group" aria-label="Chart type">
              {(Object.keys(CHART_TYPES) as ChartType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="mp-types__btn"
                  aria-pressed={t === type}
                  aria-label={CHART_TYPES[t]}
                  title={CHART_TYPES[t]}
                  onClick={() => void pick(t)}
                >
                  <ChartTypeIcon type={t} />
                </button>
              ))}
            </div>
          ) : null}
          <a className="p-btn p-btn--outline" href={chart.report} target="_blank" rel="noreferrer">
            Open in Mixpanel
          </a>
          {import.meta.env.DEV ? (
            <button type="button" className="p-icon-btn p-icon-btn--danger" aria-label={`Delete ${name}`} title="Delete" onClick={() => setConfirming(true)}>
              <Icon name="delete" size={18} />
            </button>
          ) : null}
        </div>
      </div>

      {chart.pending ? (
        <>
          <HandoffProgress task={{ key: `${project}/chart-${id}`, what: chart.report, started: chart.addedAt }} onDismiss={() => {}} />
          {import.meta.env.DEV ? (
            <button type="button" className="p-btn p-btn--outline mp-retry" onClick={() => void retry()}>
              Open Claude Code again
            </button>
          ) : null}
        </>
      ) : chart.error ? (
        <p className="p-danger">
          Couldn't read the report: {chart.error}
        </p>
      ) : ready ? (
        <>
          <SeriesChart plot={plot} type={type} />
          {chart.note || type === "pie" || stacked ? (
            <p className="p-sm p-muted">
              {[chart.note, type === "pie" ? aggregateNote(plot) : "", stacked ? STACKED_NOTE : ""].filter(Boolean).join(" ")}
            </p>
          ) : null}
          {type === "table" ? null : (
            <details className="mp-table">
              <summary>
                <span className="p-strong p-link">
                  Show as a table
                </span>
              </summary>
              <ChartTable {...plot} />
            </details>
          )}
        </>
      ) : (
        <p className="p-danger">
          The chart's file is missing its numbers. Delete it and add the link again.
        </p>
      )}
      {error ? (
        <p className="p-sm p-danger" role="alert">
          {error}
        </p>
      ) : null}

      {confirming ? (
        <Dialog
          onClose={() => setConfirming(false)}
          title="Delete this chart?"
          subtext={`${name} goes from the page, and ${project}/data/mixpanel-charts/${id}.json is deleted. The report stays in Mixpanel.`}
          footer={
            <>
              <button type="button" className="p-btn p-btn--outline" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button type="button" className="p-btn p-btn--danger" aria-busy={busy} disabled={busy} onClick={() => void remove()}>
                Delete
              </button>
            </>
          }
        />
      ) : null}
    </section>
  );
}

/** The last card of a project: paste a Mixpanel link and Claude Code turns the report into a chart here (dev server only). */
function AddChart({ project, title }: { project: string; title: string }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!import.meta.env.DEV) return null;

  const add = async () => {
    const link = url.trim();
    if (!isMixpanelLink(link)) return setError("Paste a link to a Mixpanel report (https://mixpanel.com/…).");
    // Caught here, not after a Terminal run: Mixpanel keeps no readable copy of an unsaved query.
    if (isUnsavedQuery(link))
      return setError("This link is an unsaved query, which Mixpanel's tools can't read. In Mixpanel, click Save on the report, then paste its link.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/mixpanel-charts/${project}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link }),
      });
      const body = await res.json();
      if (!res.ok) setError(body.error ?? "Couldn't save the link.");
      else {
        setUrl("");
        const handoff = await openInClaude(`${project}/chart-${body.id}`, chartBrief(project, title, body.id, link), "chart");
        if (handoff.error) setError(handoff.error);
      }
    } catch {
      setError("Couldn't reach the dev server.");
    }
    setBusy(false);
  };

  return (
    <form
      className="p-card mp-add"
      onSubmit={(e) => {
        e.preventDefault();
        void add();
      }}
    >
      <div className="p-stack">
        <h3 className="p-h2">
          Add a chart from Mixpanel
        </h3>
        <span className="p-sm p-muted">
          Paste a saved report's link. Claude Code opens in Terminal, reads the report and draws it here.
        </span>
      </div>
      <div className="mp-add__row">
        <Field
          label="Mixpanel report link"
          type="url"
          placeholder="https://mixpanel.com/project/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={error || undefined}
        />
        <button type="submit" className="p-btn mp-add__btn" aria-busy={busy} disabled={busy || !url.trim()}>
          Add with magic
        </button>
      </div>
    </form>
  );
}
