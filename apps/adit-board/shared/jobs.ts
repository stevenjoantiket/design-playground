/**
 * The generation jobs Krakatoa's board hands to Claude Code, and the skill each should use. The
 * Jobs & skills page lists them; `briefs.ts` names a job's skill in the prompt it opens Terminal with.
 * A skill is a folder in `.claude/skills/<name>/SKILL.md` at the repo root (Claude Code finds it there).
 */
export type Job = {
  id: string;
  name: string;
  /** Where in the app it starts. */
  trigger: string;
  /** What it produces. */
  output: string;
  /** The skill folder name, or null when the job is mechanical and the brief is enough. */
  skill: string | null;
  /** What the skill should teach. */
  skillTeaches: string;
};

export const JOBS: Job[] = [
  {
    id: "code",
    name: "Build the code",
    trigger: "Version card → Build → Code → Build with magic",
    output: "A new version gated on its label, registered in versions.ts, with its experiment case (why, before/after, facts)",
    skill: "adit-board-build-code",
    skillTeaches: "This repo's rules: @tiket-ds/ui components and tokens only, icons from tds library, builtOn gating, embed mode, pnpm verify",
  },
  {
    id: "code-alt",
    name: "Code alternative",
    trigger: "Version card ⋯ → Build another code alternative",
    output: "A new version (B2, B3…) with alternativeOf, answering what must be different",
    skill: "adit-board-build-code",
    skillTeaches: "Same as Build the code, plus how to make an alternative genuinely different rather than a copy tweak",
  },
  {
    id: "case",
    name: "Experiment case",
    trigger: "Part of Build the code and Code alternative",
    output: "The experiment's detail: why we run it, before and after, the facts that back it",
    skill: "adit-board-experiment-case",
    skillTeaches: "How to phrase hypothesis and metric, what counts as confirmed versus needs data, using Mixpanel numbers as evidence",
  },
  {
    id: "figma",
    name: "Draw in Figma",
    trigger: "Version card → Build → Figma design → Build with magic",
    output: "A new section beside the originals in the linked Figma file; its link saved as figmaDesign",
    skill: "adit-board-figma-design",
    skillTeaches: "Which design-system library and components to use, where to place sections, naming, checking with a screenshot",
  },
  {
    id: "figma-alt",
    name: "Figma alternative",
    trigger: "Version card ⋯ → Build Figma alternative",
    output: "Another Figma section; its link added to figmaAlternatives",
    skill: "adit-board-figma-design",
    skillTeaches: "Same as Draw in Figma, plus exploring a different visual approach",
  },
  {
    id: "mixpanel",
    name: "Mixpanel sync",
    trigger: "Mixpanel page → Sync with magic",
    output: "Fresh numbers in the project's mixpanel-cases.json",
    skill: "adit-board-mixpanel-sync",
    skillTeaches: "Which events and properties to query per project, and how to read them",
  },
  {
    id: "jira",
    name: "Jira sync",
    trigger: "Project page → Sync",
    output: "Fresh PPRO tasks (Design involvement) in portal/project/jira-tasks.json",
    skill: null,
    skillTeaches: "Nothing: the brief has the JQL and the file format",
  },
  {
    id: "remove",
    name: "Delete code or version",
    trigger: "Version card ⋯ → bin, or Delete version",
    output: "The bin: the version's code removed, its brief kept so it can be built again. Delete version: the version, its alternatives and its briefs removed",
    skill: null,
    skillTeaches: "Mechanical: the brief is enough",
  },
];

/** The skill a brief task (`TASKS` in briefs.ts) uses. Alternatives share their task with the first build. */
export const TASK_SKILL: Record<string, string | null> = {
  code: "adit-board-build-code",
  figma: "adit-board-figma-design",
  mixpanel: "adit-board-mixpanel-sync",
  remove: null,
  chart: null,
  jira: null,
};
