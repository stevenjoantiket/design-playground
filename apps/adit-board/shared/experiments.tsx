import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { BottomSheet, Button, ButtonGroup, Radio, Text, TextField } from "@tiket-ds/ui";

import { LibraryIcon } from "../design-system/icons.js";
import { BuildStep, HandoffProgress, openInClaude, type HandoffKind, type MenuTask } from "./BuildStep.js";

/** One thing the experiment rests on, and whether it is established yet. */
export interface Fact {
  claim: string;
  /** "confirmed" is known from the design or the build; "needs-data" still has to be shown with data. */
  status: "confirmed" | "needs-data";
  /** What establishes it: what we know, or which data would settle it. */
  evidence: string;
}

/** The experiment's case, shown on the Experiments page: why it exists, what changes, what backs it. */
export interface ExperimentDetail {
  /** The observation or problem it answers. */
  why: string;
  /** What the screen does today, and what it does in this version, in a line each. */
  before: string;
  after: string;
  /** Shown over the desktop preview when desktop differs from the mobile story, e.g. unchanged. */
  desktop?: string;
  facts: Fact[];
}

/**
 * The parts of the experiment design doc (EDD, the Confluence template) that neither the form nor the
 * build gives. All optional: the Experiments page shows TBD for what is missing, as the template does.
 */
export interface ExperimentPlan {
  /** The EDD's "Experiment plan and results" paragraph. Falls back to `detail.why`. */
  summary?: string;
  /** Reviewer & approver (Experimentation Council). */
  reviewer?: string;
  /** Where the experiment runs and is read, e.g. its Mixpanel experiment. */
  experimentLink?: string;
  /** The experiment key; its variants are `control` and `treatment`. */
  key?: string;
  /** E.g. "4 weeks", or the dates once known. */
  period?: string;
  objective?: string;
  /** E.g. "A/B Test (user-based splitting, using Mixpanel)". */
  type?: string;
  /** The problem being solved. Falls back to `detail.why`. */
  problem?: string;
  /** The hypothesis's "because": why the change should move the metric. */
  because?: string;
  /** Success metrics. Falls back to one row for `metric` with no definition yet. */
  metrics?: { name: string; definition: string; events: string }[];
  /** The metric the decision matrix weighs against the primary one. */
  secondaryMetric?: string;
  targeting?: { where?: string[]; who?: string; traffic?: string };
  /** Share of users per variation, e.g. "50%". */
  split?: { control: string; treatment: string };
  timeline?: { phase: string; when?: string; items?: string[] }[];
  /** `sampleSizeLink` and `baselineLink`: where each number comes from (the calculator, the Mixpanel report). */
  preAnalysis?: {
    mde?: string;
    sampleSize?: string;
    sampleSizeLink?: string;
    baseline?: string;
    baselineLink?: string;
    alpha?: string;
    power?: string;
    sheet?: string;
  };
  /** What to do if the result is not significant. */
  ifNotSignificant?: string;
  notes?: string[];
  results?: {
    start?: string;
    end?: string;
    conclusion?: "INCONCLUSIVE" | "HYPOTHESIS PROVED" | "HYPOTHESIS DISPROVED";
    stakeholderSummary?: string;
    highlights?: string[];
    /** Filled by the BI or DS team. */
    suggestion?: string;
    followUp?: string;
  };
}

/** What the person running the experiment committed to before the version existed. */
export interface Experiment {
  name: string;
  hypothesis: string;
  /** In the author's own words; the agent builds the version from this. */
  request: string;
  metric: string;
  /** An optional brief the author attached as a Markdown file, kept as its text. */
  brief?: { name: string; text: string };
  /** An optional Jira or Confluence link the agent reads for context before building. */
  link?: string;
  /** Only for built versions (the project's `BUILT_VERSIONS`); versions made in the form have none. */
  detail?: ExperimentDetail;
  /** The Figma section the version is drawn in, once the Figma design step is done. */
  figmaDesign?: string;
  /** Person in charge: who owns the experiment and its decision (the Jira assignee when there is a ticket). */
  pic?: string;
  /** Who designs it. */
  designer?: string;
  /** The squad it belongs to. */
  squad?: string;
  /** The ticket's state, copied from Jira on `asOf`; it is not live. */
  ticket?: { status: string; priority?: string; asOf: string };
  /** On a code alternative: the label of the version it is an alternative of. It is kept out of the
   * version list and reached from that version's ⋯ menu. */
  alternativeOf?: string;
  /** Other Figma sections drawn for this version, besides `figmaDesign`. */
  figmaAlternatives?: string[];
  /** The rest of its experiment design doc, as far as it is known. */
  plan?: ExperimentPlan;
}

/**
 * What the shared pieces need from a version. Each project's version adds its own scenario
 * (payment's `ux`, insurance's `scenario`) and keeps the same scenario under `from`.
 */
export type VersionRef = { id: string; label: string; experiment?: Experiment; from?: { label: string } };

/** The attached brief is saved with the versions in the browser's storage, so it stays small. */
const MAX_BRIEF_BYTES = 100_000;

/** A Jira or Confluence page on an Atlassian Cloud site, e.g. https://borobudur.atlassian.net/browse/PPRO-484. */
const ATLASSIAN_URL = /^https:\/\/[a-z0-9-]+\.atlassian\.net\/\S+$/i;

/** The library's TextField look around a `<textarea>`, for answers longer than one line. */
function AreaField({
  label,
  helperText,
  value,
  onChange,
}: {
  label: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="tds-field">
      <div className="tds-field__box">
        <div className="tds-field__content">
          <label className="tds-field__label" htmlFor={id}>
            {label}
          </label>
          <textarea
            id={id}
            className="tds-field__input pay-xp__area"
            rows={3}
            placeholder=" "
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
      {helperText ? <span className="tds-field__helper">{helperText}</span> : null}
    </div>
  );
}

/**
 * The questions a good experiment brief has to answer. "OK" stays off until each one has an
 * answer, so a version can't be created from "let's just try it".
 */
export function ExperimentSheet({
  versions,
  metrics,
  onCancel,
  onCreate,
}: {
  versions: VersionRef[];
  /** The numbers this project's experiments can be judged on. */
  metrics: readonly string[];
  onCancel: () => void;
  onCreate: (experiment: Experiment, anchorId: string) => void;
}) {
  const [name, setName] = useState("");
  // Control by default: an experiment is judged against the original unless you say otherwise.
  const [anchorId, setAnchorId] = useState("control");
  const [hypothesis, setHypothesis] = useState("");
  const [request, setRequest] = useState("");
  const [metric, setMetric] = useState("");
  const [brief, setBrief] = useState<Experiment["brief"]>();
  const [link, setLink] = useState("");
  const [pic, setPic] = useState("");
  const [designer, setDesigner] = useState("");
  const [briefError, setBriefError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function attach(file: File | undefined) {
    if (!file) return;
    if (!/\.(md|markdown)$/i.test(file.name)) return setBriefError("Pick a Markdown file (.md).");
    if (file.size > MAX_BRIEF_BYTES) return setBriefError("That file is over 100 KB. Trim it, or paste the key points into the questions above.");
    setBriefError("");
    setBrief({ name: file.name, text: await file.text() });
  }

  const missing = [
    !name.trim() && "a name",
    hypothesis.trim().length < 20 && "a hypothesis with its reason (20+ characters)",
    !request.trim() && "the change you want",
    !metric && "a primary metric",
    link.trim() && !ATLASSIAN_URL.test(link.trim()) && "an Atlassian link starting with https://…atlassian.net/",
  ].filter(Boolean);

  return (
    <BottomSheet
      open
      onClose={onCancel}
      title="New experiment"
      subtext="Answer these first. OK creates a new version on top of the one you pick, plus a brief you can paste into your agent."
      className="pay-xp-sheet"
      footer={
        <>
          {missing.length > 0 ? (
            <Text variant="smallRegular" color="lowEmphasis">
              Still needed: {missing.join(", ")}.
            </Text>
          ) : null}
          <ButtonGroup layout="sideBySide">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              disabled={missing.length > 0}
              onClick={() =>
                onCreate(
                  {
                    name: name.trim(),
                    hypothesis: hypothesis.trim(),
                    request: request.trim(),
                    metric,
                    ...(brief ? { brief } : {}),
                    ...(link.trim() ? { link: link.trim() } : {}),
                    ...(pic.trim() ? { pic: pic.trim() } : {}),
                    ...(designer.trim() ? { designer: designer.trim() } : {}),
                  },
                  anchorId,
                )
              }
            >
              OK
            </Button>
          </ButtonGroup>
        </>
      }
    >
      <div className="pay-xp">
        <fieldset className="pay-xp__q">
          <Text as="legend" variant="body3Bold">
            1. What is this experiment called?
          </Text>
          <TextField label="Experiment name" value={name} onChange={(e) => setName(e.target.value)} />
        </fieldset>

        <fieldset className="pay-xp__q">
          <Text as="legend" variant="body3Bold">
            2. What does this build on top of?
          </Text>
          <Text variant="smallRegular" color="lowEmphasis">
            The new version starts as a copy of it, with everything it shows.
          </Text>
          {versions.map((v) => (
            <Radio key={v.id} name="xp-anchor" checked={anchorId === v.id} onChange={() => setAnchorId(v.id)}>
              {v.experiment ? `${v.label} · ${v.experiment.name}` : v.label}
            </Radio>
          ))}
        </fieldset>

        <fieldset className="pay-xp__q">
          <Text as="legend" variant="body3Bold">
            3. What do you believe will happen, and why?
          </Text>
          <AreaField
            label="Hypothesis"
            helperText="If we change …, then … will …, because …"
            value={hypothesis}
            onChange={setHypothesis}
          />
        </fieldset>

        <fieldset className="pay-xp__q">
          <Text as="legend" variant="body3Bold">
            4. What should be different in this version?
          </Text>
          <AreaField
            label="Requested change"
            helperText="In plain words. Your agent builds the version from this."
            value={request}
            onChange={setRequest}
          />
        </fieldset>

        <fieldset className="pay-xp__q">
          <Text as="legend" variant="body3Bold">
            5. Which single number decides it?
          </Text>
          {metrics.map((m) => (
            <Radio key={m} name="xp-metric" checked={metric === m} onChange={() => setMetric(m)}>
              {m}
            </Radio>
          ))}
        </fieldset>

        <fieldset className="pay-xp__q">
          <Text as="legend" variant="body3Bold">
            6. Do you have a written brief? (optional)
          </Text>
          <Text variant="smallRegular" color="lowEmphasis">
            Attach it as a Markdown file. It is shown with the experiment and added to the brief your agent gets.
          </Text>
          <input
            ref={fileInput}
            type="file"
            accept=".md,.markdown,text/markdown"
            hidden
            onChange={(e) => {
              void attach(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {brief ? (
            <div className="pay-xp__file">
              <Text variant="body3Bold" lineClamp={1}>
                {brief.name}
              </Text>
              <button type="button" className="pay-link" onClick={() => setBrief(undefined)}>
                <Text variant="smallBold" color="active">
                  Remove
                </Text>
              </button>
            </div>
          ) : (
            <Button variant="secondary" size="small" onClick={() => fileInput.current?.click()}>
              Attach .md brief
            </Button>
          )}
          {briefError ? (
            <Text variant="smallRegular" color="alert" role="alert">
              {briefError}
            </Text>
          ) : null}
        </fieldset>

        <fieldset className="pay-xp__q">
          <Text as="legend" variant="body3Bold">
            7. Is there a Jira ticket or Confluence page? (optional)
          </Text>
          <TextField
            label="Atlassian link"
            helperText="Your agent reads it for context before building."
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </fieldset>

        <fieldset className="pay-xp__q">
          <Text as="legend" variant="body3Bold">
            8. Who is involved? (optional)
          </Text>
          <TextField label="PIC" helperText="Owns the experiment and its decision." value={pic} onChange={(e) => setPic(e.target.value)} />
          <TextField label="Designer" value={designer} onChange={(e) => setDesigner(e.target.value)} />
        </fieldset>
      </div>
    </BottomSheet>
  );
}

/** The Atlassian link and the attached Markdown brief, as the closing sections of an agent brief; nothing when there are none. */
export function attachedBrief(experiment: Experiment): string[] {
  const link = experiment.link
    ? [
        "",
        "## Atlassian link",
        experiment.link,
        "Read it with the Atlassian MCP tools (the Jira issue with its comments, or the Confluence page) before building. Where it disagrees with the answers above, ask.",
      ]
    : [];
  if (!experiment.brief) return link;
  return [
    ...link,
    "",
    `## Attached brief (${experiment.brief.name})`,
    "Written by the experiment's author. Read it before building; where it disagrees with the answers above, ask.",
    "",
    experiment.brief.text.trim(),
  ];
}

/** What one project's brief says that every brief's skeleton doesn't. */
export interface BriefParts {
  /** What is being changed, e.g. "Payment screen". */
  screen: string;
  /** The "from" version's scenario, one "- Key: value" line each. */
  scenario: string[];
  /** "Where and how to build it" lines before the shared ones: code, designs. */
  where: string[];
  /** Which widths, languages or cases to cover. */
  cover: string;
  /** The widths to check in the browser, e.g. "412 and 1440". */
  check: string;
}

/**
 * The brief as plain markdown, written for a coding agent working in this repo: what to build,
 * the metric it is for, the screen state it starts from, and where and how to build it. Pasted
 * into an agent, it is the whole task. Every project's brief has this shape; `parts` fills in
 * what is its own.
 */
export function buildBrief(version: VersionRef, parts: BriefParts): string {
  const e = version.experiment;
  if (!e) return "";
  const from = version.from?.label ?? "Control";
  return [
    `# Experiment brief: ${e.name}`,
    "",
    `Build version "${version.label}" of the ${parts.screen} for this experiment. It starts as a copy of "${from}". Do not change what Control or any other version shows.`,
    from === "Control"
      ? "It builds on the original screen only: it must not include the changes of any other version."
      : `It builds on top of "${from}": keep everything "${from}" shows, and add your change to it.`,
    "",
    "## Requested change",
    e.request,
    "",
    "## Hypothesis",
    e.hypothesis,
    "",
    "## Primary metric",
    e.metric,
    "",
    "## Starting point",
    `Scenario in "${from}":`,
    ...parts.scenario,
    "",
    "## Where and how to build it",
    ...parts.where,
    `- Show the change only on version "${version.label}" and versions built on top of it: gate it in \`App.tsx\` with \`builtOn(versions, activeId, "${version.label}")\` from \`../shared/experiments.tsx\`. Control and the other versions must render exactly as before.`,
    `- Register the finished version in \`BUILT_VERSIONS\` in the project's \`versions.ts\` (label "${version.label}", with this brief's answers), so it is always listed in the Versions card.`,
    "- Give it an `experiment.detail` (why, before, after, and the facts it rests on, each confirmed or needing data), so its case shows on the Experiments page.",
    "- If the linked page is an experiment design doc (EDD), copy what it states into `experiment.plan` (summary, reviewer, key, period, objective, metrics, targeting, split, timeline, pre-analysis, notes). Leave out what it doesn't state; the page shows TBD for it.",
    parts.cover,
    "- Use design-system components and tokens only, icons from `tds library/tds icon`. Follow `AGENTS.md`.",
    "",
    "## Done when",
    `- Selecting "${version.label}" in the Versions card shows the change; selecting Control shows the original.`,
    `- "View experiment detail" under the brief opens its case on the Experiments page.`,
    `- Checked in the browser at ${parts.check}; \`pnpm verify\` passes.`,
    "- Reply with a short summary of what changed and any assumption you made.",
    ...attachedBrief(e),
  ].join("\n");
}

/** A project's pages and the Figma file each lives in (its `figma-files.json`). */
export interface FigmaPages {
  pages: readonly { value: string; label: string }[];
  links: Record<string, string>;
}

/** The file key and the node a Figma link points at, e.g. `mycltzySAVdNBTnoaUa3oa` and `1751:203159`. */
function figmaTarget(url: string): { key?: string; node?: string } {
  const key = url.match(/figma\.com\/(?:design|file)\/([0-9a-zA-Z]+)/)?.[1];
  const node = new URL(url).searchParams.get("node-id")?.replace("-", ":") ?? undefined;
  return { key, node };
}

/**
 * The brief for drawing a built version in Figma: what changed, taken from its experiment detail,
 * and the Figma file each page already lives in, so the design lands next to the original instead
 * of in a new file.
 */
export function buildFigmaBrief(version: VersionRef, project: string, figma: FigmaPages): string {
  const e = version.experiment;
  if (!e?.detail) return "";
  const from = version.from?.label ?? "Control";
  const linked = figma.pages.filter((p) => figma.links[p.value]);
  const missing = figma.pages.filter((p) => !figma.links[p.value]);
  return [
    `# Figma brief: ${e.name} (version ${version.label})`,
    "",
    `Design version "${version.label}" of the ${project} prototype in Figma. It is already built in code; the Figma design must match it. Keep the original frames as they are: version "${version.label}" goes next to them.`,
    "",
    "## What changes",
    `- Before (${from}): ${e.detail.before}`,
    `- After (version ${version.label}): ${e.detail.after}`,
    ...(e.detail.desktop ? [`- Desktop: ${e.detail.desktop}`] : []),
    "",
    "## Why",
    e.detail.why,
    "",
    "## Where in Figma",
    "Use the file each page is already linked to (`apps/adit-board/projects/" + project + "/data/figma-files.json`). Do not create a new file.",
    ...linked.map((p) => {
      const { key, node } = figmaTarget(figma.links[p.value]!);
      return `- ${p.label}: ${figma.links[p.value]} (file key \`${key ?? "?"}\`${node ? `, node \`${node}\`` : ""})`;
    }),
    ...(missing.length
      ? [
          `- No Figma file yet for: ${missing.map((p) => p.label).join(", ")}. If the change shows on one of these, ask for its link and record it in \`apps/adit-board/projects/${project}/data/figma-files.json\` before drawing it.`,
        ]
      : []),
    `- In that file, start from the "${from}" design at the linked node: duplicate the frames the change touches, place the copies beside the originals in a section named "Version ${version.label} · ${e.name}", and make the change there.`,
    "",
    "## How",
    "- Load the `figma-use` skill before any `use_figma` call.",
    "- Build from the Passport Tiket Design System components, variables and styles (`search_design_system`), and the icons from its library. Do not draw your own shapes for things the library has.",
    `- The code is the reference: version "${version.label}" renders at http://localhost:5273/projects/${project}/?embed=1&version=${version.id} (dev server), and its copy, EN and ID, is in \`apps/adit-board/projects/${project}/\`.`,
    "- Cover the languages, designs and cases the version covers in code, on every frame the change touches.",
    "",
    "## Done when",
    "- The new section sits beside the originals in the linked file, and a `get_screenshot` of it matches the code.",
    `- Record the new section's link as \`figmaDesign\` on version "${version.label}"'s experiment in \`apps/adit-board/projects/${project}/versions.ts\`, so it shows under the Figma design step. \`figma-files.json\` keeps pointing at the original pages.`,
    "- Reply with the link to the new section.",
    ...attachedBrief(e),
  ].join("\n");
}

/** The next free label for an alternative of `base`: B2, B3, … */
export function nextAlternativeLabel(base: string, versions: VersionRef[]): string {
  let n = 2;
  while (versions.some((v) => v.label === `${base}${n}`)) n++;
  return `${base}${n}`;
}

/** Asks Claude Code for another take on a built version, as a new built version kept beside it. */
function altCodeBrief(version: VersionRef, label: string, project: string, brief: string, difference: string): string {
  const e = version.experiment!;
  return [
    `# Build a code alternative of version "${version.label}"`,
    "",
    `Add a new built version "${label}" to \`BUILT_VERSIONS\` in \`apps/adit-board/projects/${project}/versions.ts\`: id and label "${label}", the same \`from\` and scenario as "${version.label}", and a copy of its experiment with \`name: "${e.name} (alt ${label.slice(version.label.length)})"\` and \`alternativeOf: "${version.label}"\`.`,
    `It answers the same request with a different design. Keep "${version.label}" as it is.`,
    "",
    "## What must be different, in the author's words",
    "",
    difference,
    "",
    `Gate the new code on version "${label}" the way "${version.label}" is gated, give it its own \`detail\` (why, before, after, facts), then run \`pnpm verify\`.`,
    "",
    `## The brief "${version.label}" was built from`,
    "",
    brief,
  ].join("\n");
}

/** Asks Claude Code for another Figma section for a version, kept beside the first one. */
function altFigmaBrief(version: VersionRef, figmaBrief: string, difference: string): string {
  const e = version.experiment!;
  const n = (e.figmaAlternatives?.length ?? 0) + 1;
  return [
    `# Draw Figma alternative ${n} for version "${version.label}" · ${e.name}`,
    "",
    "Draw another section for this version in the same Figma file, beside the existing one, named " +
      `"Version ${version.label} · ${e.name} · Alternative ${n}".`,
    "",
    "## What must be different, in the author's words",
    "",
    difference,
    "",
    e.figmaDesign ? `The existing design is at ${e.figmaDesign}; do not edit it.` : "",
    `When done, append the new section's link to \`figmaAlternatives\` on version "${version.label}"'s experiment in the project's \`versions.ts\`. Leave \`figmaDesign\` as it is (ignore the step below that sets it).`,
    "",
    "## The brief for the first design",
    "",
    figmaBrief,
  ].join("\n");
}

/** Asks Claude Code to delete one code variant: an alternative goes entirely, an original keeps its brief. */
function removeCodeBrief(version: VersionRef, project: string): string {
  const e = version.experiment;
  const versions = `\`apps/adit-board/projects/${project}/versions.ts\``;
  if (e?.alternativeOf)
    return [
      `# Delete code alternative "${version.label}" · ${e.name}`,
      "",
      `- Delete version "${version.label}" from \`BUILT_VERSIONS\` in ${versions}.`,
      `- Delete the code, styles and assets that exist only for it: look for \`builtOn(…, "${version.label}")\` and what it gates.`,
      `- Leave version "${e.alternativeOf}" and its other alternatives exactly as they are.`,
      "- Run `pnpm verify` and list what was removed.",
    ].join("\n");
  return [
    `# Delete the code of version "${version.label}" · ${e?.name ?? ""}, keep its brief`,
    "",
    "The author wants to build this version again from scratch. Delete its code, not the experiment:",
    `- Delete the code, styles and assets that exist only for version "${version.label}": look for \`builtOn(…, "${version.label}")\` and what it gates. The screen for "${version.label}" should look like what it is built on.`,
    `- In ${versions}, keep version "${version.label}" in \`BUILT_VERSIONS\` with its label, \`from\`, scenario and experiment (name, hypothesis, request, metric, link, brief, PIC, designer, squad, ticket, Figma links). Remove only the experiment's \`detail\`, so its Code step shows "Build with magic" again.`,
    `- Leave its code alternatives (\`alternativeOf: "${version.label}"\`) as they are. Versions built on top of it must keep working.`,
    "- Run `pnpm verify` and list what was removed.",
  ].join("\n");
}

/** Asks Claude Code to delete a built version as a whole: its code, its alternatives and its entry. */
function deleteVersionBrief(version: VersionRef, project: string): string {
  const label = version.label;
  return [
    `# Delete version "${label}" · ${version.experiment?.name ?? ""}`,
    "",
    "The author wants this version gone, brief included. Nothing of it should be left to build again:",
    `- First check \`BUILT_VERSIONS\` in \`apps/adit-board/projects/${project}/versions.ts\` for versions built on top of it (\`from.label\` is "${label}", other than its own alternatives). If there are any, stop and ask before deleting anything.`,
    `- Delete version "${label}" and its code alternatives (\`alternativeOf: "${label}"\`) from \`BUILT_VERSIONS\`.`,
    `- Delete the code, styles and assets that exist only for them: look for \`builtOn(…, "${label}")\` (and each alternative's label) and what it gates. Control and the other versions must render exactly as before.`,
    `- Delete its saved briefs and progress logs: \`briefs/${project}-${label}*.md\` and \`briefs/${project}-${label}*.progress.jsonl\`, and the same for each alternative. Leave this brief's own files until you are done.`,
    "- Leave Figma alone: list any `figmaDesign` or `figmaAlternatives` links it had, so the author can delete those sections by hand.",
    "- Run `pnpm verify` and list what was removed.",
  ].join("\n");
}

/** Asks what the new alternative should change before Claude Code builds it. */
function AlternativePrompt({
  kind,
  version,
  onCancel,
  onBuild,
}: {
  kind: "code" | "figma";
  version: VersionRef;
  onCancel: () => void;
  onBuild: (difference: string) => void;
}) {
  const [difference, setDifference] = useState("");
  const ready = difference.trim().length >= 10;
  const current = kind === "code" ? `version ${version.label}` : "the current Figma design";
  return (
    <BottomSheet
      open
      onClose={onCancel}
      title={kind === "code" ? "New code alternative" : "New Figma alternative"}
      subtext={`Tell Claude what should be different from ${current}. The rest of the brief stays the same.`}
      className="pay-xp-sheet"
      footer={
        <ButtonGroup layout="sideBySide">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!ready} onClick={() => onBuild(difference.trim())}>
            Build with magic
          </Button>
        </ButtonGroup>
      }
    >
      <AreaField
        label={`What should be different from ${current}?`}
        helperText="E.g. the layout, a component, the visual emphasis or the copy. At least a sentence."
        value={difference}
        onChange={setDifference}
      />
    </BottomSheet>
  );
}

type RemoveTarget = "code" | "version" | "experiment";

/** Confirms deleting one code variant, or a whole experiment made in the form. */
function RemoveConfirm({
  version,
  target,
  onCancel,
  onConfirm,
}: {
  version: VersionRef;
  /** "code": this variant's code; "version": a built version as a whole (both through Claude Code); "experiment": a form-made version, from this browser. */
  target: RemoveTarget;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const e = version.experiment;
  const alt = Boolean(e?.alternativeOf);
  const title =
    target === "experiment"
      ? `Delete experiment ${version.label}?`
      : target === "version"
        ? `Delete version ${version.label}?`
        : alt ? `Delete alternative ${version.label}?` : `Delete the code of version ${version.label}?`;
  const subtext =
    target === "experiment"
      ? `“${e?.name}” and its answers are deleted from this browser. This can't be undone.`
      : target === "version"
        ? `Version ${version.label} “${e?.name}” is deleted as a whole: its code, its code alternatives, its brief and its answers. Its Figma designs stay. Claude Code opens in Terminal; you approve each step there.`
        : alt
        ? `Alternative ${version.label} and its code are deleted. Version ${e?.alternativeOf} and its brief stay as they are. Claude Code opens in Terminal; you approve each step there.`
        : `Only the code of version ${version.label} is deleted: its components, styles and assets. “${e?.name}” stays, with its brief, hypothesis, metric, links and people, so you can build it again from scratch with Build with magic. Claude Code opens in Terminal; you approve each step there.`;
  return (
    <BottomSheet
      open
      onClose={onCancel}
      title={title}
      subtext={subtext}
      className="pay-xp-sheet"
      footer={
        <ButtonGroup layout="sideBySide">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="alert" onClick={onConfirm}>
            {target === "experiment" ? "Delete experiment" : target === "version" ? "Delete version" : "Delete code"}
          </Button>
        </ButtonGroup>
      }
    />
  );
}

/**
 * The summary card's ⋯ menu: copy the brief, switch between and build code or Figma alternatives,
 * and remove the version. Building opens Claude Code in Terminal (dev server only).
 */
function VersionMenu({
  version,
  alternatives,
  brief,
  figmaBrief,
  project,
  allVersions,
  onSelect,
  onRemove,
  onNote,
  onTask,
  inCode,
}: {
  /** A task handed to Claude Code, whose progress the card then shows. */
  onTask: (task: MenuTask) => void;
  /** The version is in the project's BUILT_VERSIONS, with or without code built yet. */
  inCode: boolean;
  version: VersionRef;
  /** The original and its code alternatives, original first. */
  alternatives: VersionRef[];
  brief: string;
  figmaBrief: string | null;
  project?: string;
  allVersions: VersionRef[];
  onSelect?: (id: string) => void;
  onRemove?: (id: string) => void;
  onNote: (note: string) => void;
}) {
  const [open, setOpen] = useState(false);
  /** The code version whose delete was pressed, waiting for confirmation. */
  const [confirming, setConfirming] = useState<{ version: VersionRef; target: RemoveTarget } | null>(null);
  /** Which alternative is being asked about, before it is built. */
  const [asking, setAsking] = useState<"code" | "figma" | null>(null);
  const root = useRef<HTMLDivElement>(null);
  // Placed against the window: the side panel scrolls, and would clip a menu that runs past it.
  const [place, setPlace] = useState<CSSProperties>({});
  const e = version.experiment!;
  const built = Boolean(e.detail);
  const original = alternatives[0] ?? version;
  const coded = alternatives.filter((alt) => alt.experiment?.detail);
  const dev = import.meta.env.DEV && Boolean(project);
  const figmaLinks = [
    ...(original.experiment?.figmaDesign ? [{ label: "Original design", href: original.experiment.figmaDesign }] : []),
    ...(original.experiment?.figmaAlternatives ?? []).map((href, i) => ({ label: `Alternative ${i + 1}`, href })),
  ];

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => !root.current?.contains(event.target as Node) && setOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onScroll = (event: Event) => !root.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const toggle = (button: HTMLElement) => {
    if (open) return setOpen(false);
    const r = button.getBoundingClientRect();
    const right = window.innerWidth - r.right;
    // Opens downward unless less than 380px is left below; then it opens upward.
    setPlace(window.innerHeight - r.bottom < 380 ? { bottom: window.innerHeight - r.top + 4, right } : { top: r.bottom + 4, right });
    setOpen(true);
  };

  const handoff = async (key: string, text: string, kind: HandoffKind, what: string) => {
    setOpen(false);
    onNote("");
    onTask({ key, what: `${what[0]!.toUpperCase()}${what.slice(1)}.`, started: Date.now() });
    const result = await openInClaude(key, text, kind);
    if (!result.opened) onNote(result.error ?? "Couldn't open Terminal.");
  };

  const copy = async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(brief);
      onNote("Brief copied.");
    } catch {
      onNote("Couldn't copy the brief.");
    }
  };

  return (
    <div className="pay-xp__menu-root" ref={root}>
      <button
        type="button"
        className="pay-xp__copy"
        aria-label="Version options"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Version options"
        onClick={(event) => toggle(event.currentTarget)}
      >
        <LibraryIcon name="moreVertical" size={20} color="lowEmphasis" />
      </button>
      {open ? (
        <div className="pay-xp__menu" role="menu" aria-label={`Version ${version.label} options`} style={place}>
          <button type="button" role="menuitem" onClick={() => void copy()} autoFocus>
            <LibraryIcon name="copy" size={16} color="lowEmphasis" />
            <Text variant="body3">Copy brief for agent</Text>
          </button>

          {/* The code versions of this experiment that have code, the original included, each with its
              own delete. A version not built yet has none, so the group is left out. */}
          {coded.length ? (
          <div role="group" aria-label="Code versions" className="pay-xp__menu-group">
            <Text variant="smallBold" color="lowEmphasis">
              Code versions
            </Text>
            {coded.map((alt) => (
              <div key={alt.id} className="pay-xp__menu-row">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={alt.id === version.id}
                  onClick={() => {
                    setOpen(false);
                    onSelect?.(alt.id);
                  }}
                >
                  <LibraryIcon name="check" size={16} color={alt.id === version.id ? "active" : "disabled"} />
                  <Text variant="body3" color={alt.id === version.id ? "active" : "highEmphasis"}>
                    {alt === original ? `${alt.label} · original` : `${alt.label} · alternative`}
                  </Text>
                </button>
                {dev && alt.experiment?.detail ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="pay-xp__menu-delete"
                    aria-label={`Delete the code of version ${alt.label}`}
                    title={`Delete the code of version ${alt.label}`}
                    onClick={() => {
                      setOpen(false);
                      setConfirming({ version: alt, target: "code" });
                    }}
                  >
                    <LibraryIcon name="delete" size={16} color="alert" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          ) : null}
          {dev ? (
            <button
              type="button"
              role="menuitem"
              disabled={!built}
              title={built ? undefined : "Build the code first"}
              onClick={() => {
                setOpen(false);
                setAsking("code");
              }}
            >
              <LibraryIcon name="plus" size={16} color={built ? "lowEmphasis" : "disabled"} />
              <Text variant="body3" color={built ? "highEmphasis" : "disabled"}>
                Build another code alternative
              </Text>
            </button>
          ) : null}

          {figmaLinks.length ? (
            <div role="group" aria-label="Figma alternatives" className="pay-xp__menu-group">
              <Text variant="smallBold" color="lowEmphasis">
                Figma designs
              </Text>
              {figmaLinks.map((link) => (
                <a key={link.href} role="menuitem" href={link.href} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
                  <LibraryIcon name="externalLink" size={16} color="active" />
                  <Text variant="body3" color="active">
                    {link.label}
                  </Text>
                </a>
              ))}
            </div>
          ) : null}
          {dev && figmaBrief ? (
            <button
              type="button"
              role="menuitem"
              disabled={!built}
              title={built ? undefined : "Build the code first"}
              onClick={() => {
                setOpen(false);
                setAsking("figma");
              }}
            >
              <LibraryIcon name="plus" size={16} color={built ? "lowEmphasis" : "disabled"} />
              <Text variant="body3" color={built ? "highEmphasis" : "disabled"}>
                Build Figma alternative
              </Text>
            </button>
          ) : null}

          {/* A built version goes as a whole through Claude Code: the original, with its alternatives. */}
          {dev && inCode ? (
            <>
              <hr />
              <button
                type="button"
                role="menuitem"
                className="pay-xp__menu-danger"
                onClick={() => {
                  setOpen(false);
                  setConfirming({ version: original, target: "version" });
                }}
              >
                <LibraryIcon name="delete" size={16} color="alert" />
                <Text variant="body3" color="alert">
                  Delete version {original.label}
                </Text>
              </button>
            </>
          ) : null}

          {/* A version made in the form lives only in this browser and has no code; it goes as a whole. */}
          {onRemove && !inCode ? (
            <>
              <hr />
              <button
                type="button"
                role="menuitem"
                className="pay-xp__menu-danger"
                onClick={() => {
                  setOpen(false);
                  setConfirming({ version, target: "experiment" });
                }}
              >
                <LibraryIcon name="delete" size={16} color="alert" />
                <Text variant="body3" color="alert">
                  Delete experiment {version.label}
                </Text>
              </button>
            </>
          ) : null}
        </div>
      ) : null}
      {asking ? (
        <AlternativePrompt
          kind={asking}
          version={original}
          onCancel={() => setAsking(null)}
          onBuild={(difference) => {
            setAsking(null);
            if (asking === "code") {
              const label = nextAlternativeLabel(original.label, allVersions);
              void handoff(`${project}/${label}`, altCodeBrief(original, label, project!, brief, difference), "code", `building code alternative ${label}`);
            } else if (figmaBrief) {
              void handoff(
                `${project}/${original.id}-figma-alt${(original.experiment?.figmaAlternatives?.length ?? 0) + 1}`,
                altFigmaBrief(original, figmaBrief, difference),
                "figma",
                `drawing a Figma alternative for ${original.label}`,
              );
            }
          }}
        />
      ) : null}
      {confirming ? (
        <RemoveConfirm
          version={confirming.version}
          target={confirming.target}
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            const { version: v, target } = confirming;
            setConfirming(null);
            if (target === "experiment") onRemove?.(v.id);
            else if (target === "version") {
              // What this browser saved for them (a changed scenario) would otherwise come back as form-made versions.
              alternatives.forEach((alt) => onRemove?.(alt.id));
              void handoff(`${project}/${v.id}-delete`, deleteVersionBrief(v, project ?? ""), "remove", `deleting version ${v.label}`);
            } else void handoff(`${project}/${v.id}-remove`, removeCodeBrief(v, project ?? ""), "remove", `deleting the code of version ${v.label}`);
          }}
        />
      ) : null}
    </div>
  );
}

/** What to call a ticket link: its issue key (`PPRO-484`) when it has one. */
function ticketLabel(url: string): string {
  try {
    const u = new URL(url);
    const key = u.searchParams.get("selectedIssue") ?? u.pathname.match(/\/browse\/([A-Z][A-Z0-9]+-\d+)/)?.[1];
    return key ?? (u.pathname.includes("/wiki/") ? "Confluence page" : "Open ticket");
  } catch {
    return "Open ticket";
  }
}

/** The brief, shown under the version list whenever an experiment version is on screen. */
export function ExperimentSummary({
  version,
  brief,
  onOpenDetail,
  project,
  figma,
  allVersions = [],
  onSelect,
  onRemove,
  codeIds = [],
}: {
  /** The ids in the project's BUILT_VERSIONS: those live in the code, not in this browser. */
  codeIds?: string[];
  version: VersionRef;
  /** The markdown the ⋯ menu copies and hands to Claude Code (see `buildBrief`). */
  brief: string;
  onOpenDetail?: (id: string) => void;
  /** The project folder, for the Build steps (dev server only). */
  project?: string;
  /** The project's pages and their Figma files, for the Figma step. */
  figma?: FigmaPages;
  /** Every version, to find this one's code alternatives and the next free alternative label. */
  allVersions?: VersionRef[];
  /** Switches to another version: a code alternative picked in the ⋯ menu. */
  onSelect?: (id: string) => void;
  /** Deletes a version made in the form (built ones are removed through Claude Code). */
  onRemove?: (id: string) => void;
}) {
  const [note, setNote] = useState("");
  // The menu's running task for this version, kept in this tab so Claude's edits (which reload the page) don't lose it.
  const taskKey = `pay-xp-task:${project}/${version.id}`;
  const [task, setTaskState] = useState<MenuTask | null>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(taskKey) ?? "null");
    } catch {
      return null;
    }
  });
  const setTask = (next: MenuTask | null) => {
    setTaskState(next);
    try {
      if (next) sessionStorage.setItem(taskKey, JSON.stringify(next));
      else sessionStorage.removeItem(taskKey);
    } catch {
      // Storage can be blocked; the progress then lasts until the next reload.
    }
  };
  const experiment = version.experiment;
  if (!experiment) return null;
  const built = Boolean(experiment.detail);
  const originalLabel = experiment.alternativeOf ?? version.label;
  const original = allVersions.find((v) => v.label === originalLabel) ?? version;
  const alternatives = [original, ...allVersions.filter((v) => v.experiment?.alternativeOf === originalLabel)];

  return (
    <div className="pay-xp__summary">
      <VersionMenu
        version={version}
        alternatives={alternatives}
        brief={brief}
        figmaBrief={project && figma ? buildFigmaBrief(original, project, figma) : null}
        project={project}
        allVersions={allVersions}
        onSelect={onSelect}
        onRemove={onRemove}
        onNote={setNote}
        onTask={setTask}
        inCode={codeIds.includes(version.id)}
      />
      <div className="pay-xp__lead">
        <Text variant="smallRegular" color="lowEmphasis">
          Version {version.label} · from {version.from?.label ?? "Control"}
        </Text>
        <Text as="p" variant="body3Bold">
          {experiment.name}
        </Text>
        {onOpenDetail ? (
          <button type="button" className="pay-link pay-xp__more" onClick={() => onOpenDetail(version.id)}>
            <Text variant="smallBold" color="active">
              View experiment detail
            </Text>
            <LibraryIcon name="chevronRight" size={16} color="active" />
          </button>
        ) : null}
      </div>
      {task ? <HandoffProgress key={task.started} task={task} onDismiss={() => setTask(null)} /> : null}
      {note ? (
        <Text as="p" variant="smallRegular" color="lowEmphasis" role="status" className="pay-xp__note">
          {note}
        </Text>
      ) : null}

      <dl className="pay-xp__facts">
        <dt>
          <Text variant="smallRegular" color="lowEmphasis">
            Metric
          </Text>
        </dt>
        <dd>
          <Text variant="smallRegular">{experiment.metric}</Text>
        </dd>
        {experiment.link ? (
          <>
            <dt>
              <Text variant="smallRegular" color="lowEmphasis">
                Ticket
              </Text>
            </dt>
            <dd>
              <a className="pay-link pay-xp__more" href={experiment.link} target="_blank" rel="noreferrer" title={experiment.link}>
                <Text variant="smallBold" color="active">
                  {ticketLabel(experiment.link)}
                </Text>
                <LibraryIcon name="externalLink" size={12} color="active" />
              </a>
            </dd>
          </>
        ) : null}
        {experiment.brief ? (
          <>
            <dt>
              <Text variant="smallRegular" color="lowEmphasis">
                Brief
              </Text>
            </dt>
            <dd>
              <Text variant="smallRegular">{experiment.brief.name}</Text>
              <pre className="pay-xp__md" tabIndex={0}>
                {experiment.brief.text.trim()}
              </pre>
            </dd>
          </>
        ) : null}
      </dl>

      {project && import.meta.env.DEV ? (
        <section className="pay-xp__build" aria-label="Build">
          <Text as="h3" variant="smallBold" color="lowEmphasis">
            Build
          </Text>
          <ol className="pay-xp__steps">
            {/* Keyed per version, so a command saved for one version never shows on another. */}
            <BuildStep
              key={`${version.id}-code`}
              n={1}
              title="Code"
              status={built ? "done" : "ready"}
              note={built ? "Built and registered." : "Builds this version in the prototype."}
              fileKey={`${project}/${version.id}`}
              brief={brief}
              kind="code"
            />
            {figma ? (
              <BuildStep
                key={`${version.id}-figma`}
                n={2}
                title="Figma design"
                status={experiment.figmaDesign ? "done" : built ? "ready" : "locked"}
                note={
                  experiment.figmaDesign ? (
                    <span className="pay-xp__done">
                      <Text variant="smallRegular" color="positive">
                        Done
                      </Text>
                      <a className="pay-link pay-xp__more" href={experiment.figmaDesign} target="_blank" rel="noreferrer">
                        <Text variant="smallBold" color="active">
                          Open in Figma
                        </Text>
                        <LibraryIcon name="externalLink" size={12} color="active" />
                      </a>
                    </span>
                  ) : built ? (
                    "Draws it in the page's linked Figma file."
                  ) : (
                    "After the code: it's drawn from it."
                  )
                }
                fileKey={`${project}/${version.id}-figma`}
                brief={buildFigmaBrief(version, project, figma)}
                kind="figma"
              />
            ) : null}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

/**
 * Whether `id` is `base` or was built on top of it, directly or through other versions. A change
 * gated on `base` this way reaches every version anchored on it, and none of the others.
 */
export function builtOn(versions: VersionRef[], id: string, base: string): boolean {
  for (let v = versions.find((x) => x.id === id); v; v = versions.find((x) => x.label === v?.from?.label)) {
    if (v.id === base) return true;
  }
  return false;
}
