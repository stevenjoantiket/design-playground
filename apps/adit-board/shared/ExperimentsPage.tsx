import { useState, type ReactNode } from "react";
import { Button, Chip, Label, SegmentedControl, Text, TiketProvider } from "@tiket-ds/ui";

import { LibraryIcon } from "../design-system/icons.js";
import { ExperimentSheet, type Experiment, type VersionRef } from "./experiments.js";
import "./experiments-page.css";

/**
 * A live copy of the prototype, scaled down: always the code as built, never a stale screenshot.
 * The project's page shows just its screen for `?embed=1&version=<id>` (see `useVersions`).
 */
function Phone({ src, title, desktop }: { src: string; title: string; desktop: boolean }) {
  return (
    <div className={desktop ? "xp-screen" : "xp-phone"}>
      <iframe title={title} loading="lazy" src={src} />
    </div>
  );
}

/** "PPRO-484" from a Jira link, whether it is a browse URL or a board's `selectedIssue`. */
const ticketKey = (url: string) => url.match(/[A-Z][A-Z0-9]+-\d+/)?.[0];

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** What the EDD template leaves to be filled: shown as it is, so the gap is visible. */
function Unset({ text = "TBD" }: { text?: string }) {
  return <span className="xp-meta__unset">{text}</span>;
}

/** A text, or TBD when there is none yet. */
const orTbd = (text: string | undefined) => (text ? text : <Unset />);

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="xp-ext" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

/** One of the EDD's top-level parts, as a card. `id` is what "On this page" scrolls to. */
function Part({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  return (
    <section className="xp-card" id={id} aria-labelledby={`${id}-h`}>
      <div className="xp-part__head">
        <Text as="h2" id={`${id}-h`} variant="body1Bold">
          {title}
        </Text>
        {note ? (
          <Text as="p" variant="smallRegular" color="lowEmphasis">
            {note}
          </Text>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** A heading inside a part, e.g. Context under Experiment planning. */
function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="xp-sub">
      <Text as="h3" variant="body2Bold">
        {title}
      </Text>
      {children}
    </div>
  );
}

function Para({ children }: { children: ReactNode }) {
  return (
    <Text as="p" variant="body3">
      {children}
    </Text>
  );
}

/** A question and its answer, as the EDD's Overview and Targeting ask them. */
function QA({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="xp-qa">
      <Text as="p" variant="body3Bold">
        {q}
      </Text>
      <div className="xp-qa__a">{children}</div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="xp-table-wrap">
      <table className="xp-table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PARTS = [
  { id: "xp-summary", label: "Stakeholder summary" },
  { id: "xp-planning", label: "Experiment planning" },
  { id: "xp-results", label: "Results" },
  { id: "xp-conclusions", label: "Conclusions" },
];

/**
 * A project's Experiments page: each experiment's case, laid out as the experiment design doc (EDD)
 * template on Confluence lays it out. `id` is the one shown.
 */
export function ExperimentsPage<V extends VersionRef>({
  project,
  built,
  desktopWidth,
  id,
  onSelect,
  metrics,
  onAdd,
}: {
  /** The project's folder, which is also its URL: `payment`, `insurance`. */
  project: string;
  /** The project's versions. Every one with an experiment gets a chip; those built in code (with an
   * `experiment.detail`) also get their live variations and facts. */
  built: V[];
  /** The width the desktop preview asks for (`&width=`), or none when the project has no desktop layout. */
  desktopWidth?: string;
  id: string | undefined;
  onSelect: (id: string) => void;
  /** The numbers this project's experiments can be judged on, for the new-experiment form. */
  metrics: readonly string[];
  /** Adds a version made in the form, and answers with its id. */
  onAdd: (experiment: Experiment, anchorId: string) => string;
}) {
  const [view, setView] = useState<"mobile" | "desktop">("mobile");
  const [adding, setAdding] = useState(false);
  const desktop = Boolean(desktopWidth) && view === "desktop";
  const src = (version: string) =>
    `${import.meta.env.BASE_URL}projects/${project}/?embed=1&version=${version}${desktop ? `&width=${desktopWidth}` : ""}`;
  const EXPERIMENTS = built.filter((v) => v.experiment);
  const version = EXPERIMENTS.find((v) => v.id === id) ?? EXPERIMENTS[0];
  const experiment = version?.experiment;
  const detail = experiment?.detail;
  const plan = experiment?.plan ?? {};
  const results = plan.results ?? {};
  const pre = plan.preAnalysis ?? {};

  const base = version?.from?.label ?? "Control";
  const beforeId = base === "Control" ? "control" : base;
  const confirmed = detail?.facts.filter((f) => f.status === "confirmed").length ?? 0;
  const metric = experiment?.metric ?? "";
  const secondary = plan.secondaryMetric ?? "Secondary metric";
  // The page's own hash picks the project page (`useHashPage`), so "On this page" scrolls instead of linking.
  const jump = (target: string) => document.getElementById(target)?.scrollIntoView({ block: "start" });

  return (
    <TiketProvider theme="light" platform="desktop" className="xp">
      {/* One chip per experiment; the side menu's pages lead back to the prototype. */}
      <nav className="xp-bar" aria-label="Experiment">
        {EXPERIMENTS.map((v) => (
          <Chip
            key={v.id}
            state={v.id === version?.id ? "active" : "inactive"}
            aria-pressed={v.id === version?.id}
            onClick={() => onSelect(v.id)}
          >
            {`${v.label} · ${v.experiment?.name}`}
          </Chip>
        ))}
        <Button
          variant="secondary"
          size="small"
          startIcon={<LibraryIcon name="plus" size={16} color="inherit" />}
          onClick={() => setAdding(true)}
        >
          Add new experiment
        </Button>
      </nav>
      {adding ? (
        <ExperimentSheet
          versions={built}
          metrics={metrics}
          onCancel={() => setAdding(false)}
          onCreate={(experiment, anchorId) => {
            onSelect(onAdd(experiment, anchorId));
            setAdding(false);
          }}
        />
      ) : null}

      {!version || !experiment ? (
        <main className="xp-main">
          <section className="xp-card">
            <Text variant="body2Bold">No experiments yet.</Text>
          </section>
        </main>
      ) : (
        <main className="xp-main">
          {/* The EDD's header table, with what the prototype adds (designer, squad, Jira, Figma) below it. */}
          <section className="xp-card xp-head">
            <div className="xp-head__top">
              <div className="xp-head__title">
                <Text variant="small" color="lowEmphasis">
                  Version {version.label} · built on {base}
                </Text>
                <Text as="h1" variant="heading3">
                  {experiment.name}
                </Text>
              </div>
              <div className="xp-head__links">
                {experiment.link ? (
                  <a className="xp-linkbtn" href={experiment.link} target="_blank" rel="noreferrer">
                    <Text variant="body3Bold" color="active">
                      {ticketKey(experiment.link) ?? (experiment.link.includes("/wiki/") ? "EDD in Confluence" : "Atlassian")}
                      {ticketKey(experiment.link) ? " in Jira" : ""}
                    </Text>
                    <LibraryIcon name="chevronRight" size={16} color="active" />
                  </a>
                ) : null}
                {experiment.figmaDesign ? (
                  <a className="xp-linkbtn" href={experiment.figmaDesign} target="_blank" rel="noreferrer">
                    <Text variant="body3Bold" color="active">
                      Design in Figma
                    </Text>
                    <LibraryIcon name="chevronRight" size={16} color="active" />
                  </a>
                ) : null}
              </div>
            </div>

            <dl className="xp-meta xp-meta--wide">
              <Meta label="Experiment plan and results">
                <span className="xp-meta__stack">
                  <span>{plan.summary ?? detail?.why ?? experiment.hypothesis}</span>
                  <span>
                    <strong>Results:</strong> {results.stakeholderSummary ? results.stakeholderSummary : <Unset text="To be added" />}
                  </span>
                </span>
              </Meta>
              <Meta label="Experiment owner">{orTbd(experiment.pic)}</Meta>
              <Meta label="Reviewer & approver">{orTbd(plan.reviewer)}</Meta>
              <Meta label="Experiment link">
                {plan.experimentLink ? <Ext href={plan.experimentLink}>Open experiment</Ext> : <Unset text="TBD (Mixpanel)" />}
              </Meta>
              <Meta label="Name & key">
                <span className="xp-meta__stack">
                  <span>{experiment.name}</span>
                  <span>
                    Key: {plan.key ? <code>{plan.key}</code> : <Unset />} · Control: <code>control</code> · Treatment:{" "}
                    <code>treatment</code>
                  </span>
                </span>
              </Meta>
              <Meta label="Experiment period">{orTbd(plan.period)}</Meta>
              <Meta label="Designer">{orTbd(experiment.designer)}</Meta>
              {experiment.squad ? <Meta label="Squad">{experiment.squad}</Meta> : null}
              <Meta label="Jira">
                {experiment.link && ticketKey(experiment.link) ? (
                  <span className="xp-meta__stack">
                    <Ext href={experiment.link}>{ticketKey(experiment.link)}</Ext>
                    {experiment.ticket ? (
                      <>
                        <span className="xp-meta__labels">
                          <Label kind="secondary" tone="blue" size="small">
                            {experiment.ticket.status}
                          </Label>
                          {experiment.ticket.priority ? (
                            <Label kind="secondary" tone="orange" size="small">
                              {experiment.ticket.priority} priority
                            </Label>
                          ) : null}
                        </span>
                        <Text variant="smallRegular" color="lowEmphasis">
                          As of {experiment.ticket.asOf}
                        </Text>
                      </>
                    ) : null}
                  </span>
                ) : (
                  <Unset text="No ticket linked" />
                )}
              </Meta>
              <Meta label="Figma design">
                {experiment.figmaDesign ? <Ext href={experiment.figmaDesign}>Open section</Ext> : <Unset text="Not drawn yet" />}
              </Meta>
              <Meta label="On this page">
                <span className="xp-toc">
                  {PARTS.map((p) => (
                    <button key={p.id} type="button" onClick={() => jump(p.id)}>
                      {p.label}
                    </button>
                  ))}
                </span>
              </Meta>
            </dl>
          </section>

          <Part id="xp-summary" title="Stakeholder summary">
            <Para>{results.stakeholderSummary ?? <Unset text="Results will be added once the experiment has been completed." />}</Para>
          </Part>

          <Part id="xp-planning" title="Experiment planning">
            <Sub title="Context">
              <Para>{orTbd(detail?.why)}</Para>
            </Sub>

            <Sub title="Experiment objective">
              <Para>{plan.objective ?? experiment.request}</Para>
            </Sub>

            <Sub title="Overview">
              <QA q="What type of experiment is this?">
                <Para>{orTbd(plan.type)}</Para>
              </QA>
              <QA q="What problem is being solved?">
                <Para>{orTbd(plan.problem ?? detail?.why)}</Para>
              </QA>
            </Sub>

            <Sub title="Hypothesis">
              <dl className="xp-hypo">
                <dt>We hypothesize that</dt>
                <dd>{experiment.hypothesis}</dd>
                <dt>Will increase</dt>
                <dd>
                  <strong>{metric}</strong>
                </dd>
                <dt>Because</dt>
                <dd>{orTbd(plan.because)}</dd>
              </dl>
            </Sub>

            <Sub title="Success metrics">
              <Table
                head={["Metric", "Definition", "Event property being tracked"]}
                rows={(plan.metrics ?? [{ name: metric, definition: "", events: "" }]).map((m) => [
                  <strong key="n">{m.name}</strong>,
                  orTbd(m.definition),
                  orTbd(m.events),
                ])}
              />
            </Sub>

            <Sub title="Decision matrix">
              <Table
                head={[metric, secondary, "Decision"]}
                rows={[
                  ["Significant increase", "Significant increase", <Label key="d" kind="secondary" tone="green" size="small">Rollout</Label>],
                  [
                    "Significant increase / Inconclusive",
                    "Inconclusive / Significant decrease",
                    <span key="d" className="xp-meta__stack">
                      <Label kind="secondary" tone="blue" size="small">
                        Rollout, if
                      </Label>
                      <span>
                        the % increase in {metric.toLowerCase()} divided by the % decrease in {secondary.toLowerCase()} is above 1:1.
                      </span>
                    </span>,
                  ],
                  ["Others", "Others", <Label key="d" kind="secondary" tone="red" size="small">Rollback and iterate</Label>],
                ]}
              />
            </Sub>

            <Sub title="Targeting">
              <QA q="Where will this experiment run?">
                {plan.targeting?.where?.length ? (
                  <ul className="xp-list">
                    {plan.targeting.where.map((w) => (
                      <li key={w}>
                        <Text variant="body3">{w}</Text>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Para>
                    <Unset />
                  </Para>
                )}
              </QA>
              <QA q="Who will see it?">
                <Para>{orTbd(plan.targeting?.who)}</Para>
              </QA>
              <QA q="What is the traffic allocation?">
                <Para>{orTbd(plan.targeting?.traffic)}</Para>
              </QA>
            </Sub>

            <div className="xp-sub">
              <div className="xp-card__head">
                <Text as="h3" variant="body2Bold">
                  Variations
                </Text>
                {desktopWidth && detail ? (
                  <SegmentedControl
                    aria-label="Preview"
                    size="small"
                    className="xp-view"
                    options={[
                      { value: "mobile", label: "Mobile" },
                      { value: "desktop", label: "Desktop" },
                    ]}
                    value={view}
                    onChange={setView}
                  />
                ) : null}
              </div>
              {desktop && detail?.desktop ? (
                <Text as="p" variant="body3" color="lowEmphasis">
                  {detail.desktop}
                </Text>
              ) : null}
              <div className="xp-compare" data-desktop={desktop || undefined}>
                <figure>
                  <Label kind="primary" tone="neutral" size="small">
                    A: Control · {base}
                  </Label>
                  {detail ? <Phone src={src(beforeId)} title={`Control: ${base}`} desktop={desktop} /> : null}
                  {desktop && detail?.desktop ? null : (
                    <figcaption>
                      <Text variant="body3">{detail?.before ?? `The screen as it is in ${base}.`}</Text>
                      <Text variant="smallBold" color="lowEmphasis">
                        {plan.split ? `${plan.split.control} of users` : "Share of users: TBD"}
                      </Text>
                    </figcaption>
                  )}
                </figure>
                <figure>
                  <Label kind="primary" tone="blue" size="small">
                    B: Treatment · Version {version.label}
                  </Label>
                  {detail ? <Phone src={src(version.id)} title={`Treatment: Version ${version.label}`} desktop={desktop} /> : null}
                  {desktop && detail?.desktop ? null : (
                    <figcaption>
                      <Text variant="body3">{detail?.after ?? experiment.request}</Text>
                      <Text variant="smallBold" color="lowEmphasis">
                        {plan.split ? `${plan.split.treatment} of users` : "Share of users: TBD"}
                      </Text>
                    </figcaption>
                  )}
                </figure>
              </div>
              {detail ? null : (
                <div className="xp-unbuilt">
                  <Text as="p" variant="body3" color="lowEmphasis">
                    There is no code for version {version.label} yet, so there is no live preview. Build it from the version card on
                    the prototype with Build with magic.
                  </Text>
                </div>
              )}
            </div>

            <Sub title="Timeline">
              {plan.timeline?.length ? (
                <ol className="xp-timeline">
                  {plan.timeline.map((t) => (
                    <li key={t.phase}>
                      <Text variant="body3Bold">
                        {t.phase}
                        {t.when ? ` (${t.when})` : ""}
                      </Text>
                      {t.items?.length ? (
                        <ul className="xp-list">
                          {t.items.map((item) => (
                            <li key={item}>
                              <Text variant="body3">{item}</Text>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <ol className="xp-timeline">
                  {["Preparation phase", "Execution phase", "Analysis phase"].map((phase) => (
                    <li key={phase}>
                      <Text variant="body3Bold">{phase}</Text> <Unset />
                    </li>
                  ))}
                </ol>
              )}
            </Sub>

            <Sub title="Pre-analysis">
              <dl className="xp-meta">
                <Meta label="MDE">{orTbd(pre.mde)}</Meta>
                <Meta label="Minimum sample size (per variant)">{pre.sampleSize && pre.sampleSizeLink ? <Ext href={pre.sampleSizeLink}>{pre.sampleSize}</Ext> : orTbd(pre.sampleSize)}</Meta>
                <Meta label="Baseline conversion">{pre.baseline && pre.baselineLink ? <Ext href={pre.baselineLink}>{pre.baseline}</Ext> : orTbd(pre.baseline)}</Meta>
                <Meta label="Alpha (α)">{pre.alpha ?? "5% [significance (1-α) = 95%]"}</Meta>
                <Meta label="Power (1-β)">{pre.power ?? "80% [β = 20%]"}</Meta>
                {pre.sheet ? (
                  <Meta label="Calculations">
                    <Ext href={pre.sheet}>Open sheet</Ext>
                  </Meta>
                ) : null}
              </dl>
              <Text as="p" variant="smallRegular" color="lowEmphasis">
                Talk to the BI or DS team at least 1 week before the experiment starts.
              </Text>
            </Sub>

            {detail ? (
              <Sub title="What it rests on">
                <Text as="p" variant="body3" color="lowEmphasis">
                  {confirmed} of {detail.facts.length} confirmed. The rest still need data before the result can be trusted.
                </Text>
                <ul className="xp-fact-list">
                  {detail.facts.map((fact) => (
                    <li key={fact.claim} className="xp-fact">
                      <div className="xp-fact__claim">
                        <Text variant="body3Bold">{fact.claim}</Text>
                        <Label kind="secondary" tone={fact.status === "confirmed" ? "green" : "orange"} size="small">
                          {fact.status === "confirmed" ? "Confirmed" : "Needs data"}
                        </Label>
                      </div>
                      <Text as="p" variant="body3" color="lowEmphasis">
                        {fact.evidence}
                      </Text>
                    </li>
                  ))}
                </ul>
              </Sub>
            ) : null}

            <Sub title="If the result is not significant">
              <Para>{orTbd(plan.ifNotSignificant)}</Para>
            </Sub>

            <Sub title="Notes">
              {plan.notes?.length ? (
                <ul className="xp-list">
                  {plan.notes.map((n) => (
                    <li key={n}>
                      <Text variant="body3">{n}</Text>
                    </li>
                  ))}
                </ul>
              ) : (
                <Para>
                  <Unset text="None yet" />
                </Para>
              )}
            </Sub>
          </Part>

          <Part id="xp-results" title="Results">
            <dl className="xp-meta">
              <Meta label="Experiment start">{orTbd(results.start)}</Meta>
              <Meta label="Experiment end">{orTbd(results.end)}</Meta>
              <Meta label="Conclusion">
                {results.conclusion ? (
                  <Label kind="secondary" tone={results.conclusion === "HYPOTHESIS PROVED" ? "green" : results.conclusion === "INCONCLUSIVE" ? "orange" : "red"} size="small">
                    {results.conclusion}
                  </Label>
                ) : (
                  <Unset />
                )}
              </Meta>
            </dl>
          </Part>

          <Part id="xp-conclusions" title="Conclusions" note="Filled by the experiment owner team, and the BI or DS team where marked.">
            <Sub title="Highlights">
              {results.highlights?.length ? (
                <ul className="xp-list">
                  {results.highlights.map((h) => (
                    <li key={h}>
                      <Text variant="body3">{h}</Text>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="xp-list">
                  <li>
                    <Text variant="body3">
                      Primary goal ({metric}): <Unset />
                    </Text>
                  </li>
                  <li>
                    <Text variant="body3">
                      Other goals: <Unset />
                    </Text>
                  </li>
                </ul>
              )}
            </Sub>
            <Sub title="BI or DS suggestion">
              <Para>{orTbd(results.suggestion)}</Para>
            </Sub>
            <Sub title="Follow-up">
              <Para>{orTbd(results.followUp)}</Para>
            </Sub>
          </Part>

          {experiment.brief ? (
            <section className="xp-card">
              <Text as="h2" variant="body1Bold">
                Attached brief
              </Text>
              <Text as="p" variant="body3" color="lowEmphasis">
                {experiment.brief.name}
              </Text>
              <pre className="xp-brief">{experiment.brief.text.trim()}</pre>
            </section>
          ) : null}
        </main>
      )}
    </TiketProvider>
  );
}
