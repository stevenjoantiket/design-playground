# Working in this repo

Read `GOALS.md` first. It defines what belongs here and what doesn't.

## Layout

```
packages/tokens      Figma values -> TypeScript objects -> tokens.css custom properties
packages/fonts       Odyssey TTFs -> woff2 + @font-face
packages/ui          The components. Depends on tokens and fonts.
apps/adit-board      The one app. `/` is Krakatoa's board (`portal/home/`). Inside it:
  projects/          One folder per product project, which is also its URL (`/projects/payment/`):
                     payment and insurance are prototypes (see "Adding a project"); pricing,
                     promo and paylater are blank so far. Inside one (payment shown):
                       App.tsx main.tsx index.html payment.css   the project page: frame + panel
                       pages.ts versions.ts                      its pages and experiment versions
                       pages/<page>/   one folder per page: a built page's screens and assets
                                       (pages/landing/) or an uploaded page (pages/success/)
                       panel/          its side-panel cards (UxPanel.tsx)
                       data/           what the board saves for it: figma-files.json,
                                       mixpanel-cases.json, page-code.json, research/,
                                       mixpanel-charts/
  portal/            The pages that span projects: home, mixpanel, research (Research bank), skills
  server/            Dev-server plugins: uploads, briefs, Mixpanel charts, skills, plan usage
  shared/            The experiment kit and the portal's own style, used by every page
  design-system/     The kitchen sink (Style / Components / Icons, both themes, all platforms)
tds library/         The raw drop: `tds icon/` SVGs (committed), `tds font/` TTFs (not)
docs/                Extracted design spec and the component status table
scripts/             Guardrails run by `pnpm verify`
```

Dependencies point one way: `ui` -> `tokens`/`fonts`. Nothing depends on the app. Its
pages are plain Vite multi-page entries (`index.html`, `design-system/index.html`,
`portal/*/index.html`, `projects/*/index.html`), listed in its `vite.config.ts` for the build; one
dev server serves them all.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | The app on :5273 — Krakatoa's board at `/`, design system at `/design-system/` |
| `pnpm build` | Builds all packages |
| `pnpm build:site` | The whole deployable site into `dist/` — what Vercel runs |
| `pnpm verify` | build + typecheck + lint + token guardrail — run before you finish |
| `pnpm tokens:build` | Regenerates `tokens.css` after editing token sources |
| `pnpm fonts:build` | Re-converts TTFs to woff2 |
| `pnpm changeset` | Records a version bump; required for any change to a package's public API |

## Rules

**Never hardcode a design value in a component.** No hex, no `rgba()`, no font
family, in `packages/ui/src/styles/*.css`. `scripts/check-tokens.mjs` fails the build
on these. Raw values belong in `packages/tokens/src/primitives.ts` and nowhere else.

**Don't invent values that Figma didn't give you.** If a spacing, radius or color
isn't in `docs/DESIGN-SYSTEM.md`, go read the node in Figma (the inventory has the
node IDs) rather than eyeballing a screenshot. If Figma's label disagrees with what
it renders, follow the render and write the discrepancy down in the design system doc.

**Style with tokens and data attributes, not variant class strings.** Components set
`data-variant`, `data-size`, `data-state`; CSS selects on them. This keeps the class
API stable and makes the CSS readable next to the Figma variant table.

**Every icon comes from `tds library/tds icon`.** No exceptions, and nothing drawn by
hand — not a `clip-path` polygon, not a CSS triangle, not path data eyeballed from a
screenshot. A component that draws its own glyph (the dropdown and accordion chevrons)
transcribes it into `packages/ui/src/icons/`: `d` copied verbatim from the named file,
the exported `fill` swapped for `currentColor` so `--tds-icon-*` still drives the colour.
A component that takes an icon as a prop gets passed the real file. If the drop has no
icon for what you need, that is a finding to raise, not a licence to draw one.

**In `apps/adit-board`, the Tiket design system is for the mockups only.** What sits inside
a device frame (the screens) uses `@tiket-ds/ui` and `--tds-*` under a `TiketProvider`. The
portal around it (side menu, side panels, the Mixpanel, Research bank, Jobs & skills and home
pages) has its own neutral dashboard style: tokens `--portal-*` and classes `p-*` in
`shared/portal.css`, and `Icon`, `Segmented`, `Dialog` (native `<dialog>`) and `Field` in
`shared/portal.tsx`. Portal CSS never reads `--tds-*`; portal code never imports `@tiket-ds/ui`.
The icons still come from the TDS library (`Icon` draws its `GLYPHS`). The side panel is portal too
(`panel.tsx` and `panel.css`: `WidthCard`, `FoldTitle`; `FigmaFiles.tsx`; payment's `UxPanel.tsx`;
insurance's Scenario card); the order-case picker wraps its real order cards in a `TiketProvider`,
as they are mockup pieces. Still on TDS, to move: the experiment summary (`ExperimentCard`), the
Experiments page and the new-experiment form.

**Every new component needs its Code Connect mapping.** `Foo.tsx` gets
`Foo.figma.tsx` next to it, mapping the Figma variant property names *exactly* as
Figma spells them, including the numeric prefixes like `"01 Enabled"`. Without it,
the next design-to-code request regenerates a component that already exists.

**Update `docs/COMPONENT-INVENTORY.md` in the same change.** A component that is
built but still says `todo` will get built again.

## Adding a component

1. Find its row in `docs/COMPONENT-INVENTORY.md` for the node ID and variant list.
2. `get_design_context` on that node. Cross-check every value against
   `docs/DESIGN-SYSTEM.md`; a value with no token is a finding to record, not a
   reason to inline a hex.
3. Build it in `packages/ui/src/components/`, styles in
   `packages/ui/src/styles/<group>.css`, export from `src/index.ts`.
4. Add it to the kitchen sink with every variant visible.
5. Look at it: both themes, all three platforms, keyboard only.
6. Add `<Name>.figma.tsx`, flip the inventory row to `done`, `pnpm changeset`.
7. `pnpm verify`.

## Figma file per page

Each page of a prototype project (payment: Landing page, Instruction, Success; insurance: FDS, Flight Delay Popup, Claim center, Booking form Flight,
Booking form Hotel, Booking form Bus & Shuttle; all but FDS are blank so far) is linked to the Figma file it lives in. The record is the project's
`data/figma-files.json`, editable in the sidebar's "Figma files"
card (dev server only). When asked
to create a Figma page or design for one of them, read that page's URL there, take the file key
from it, and build there with `use_figma`. If it is empty, ask for the link and record it in
that file.

## Prototype projects and the experiment kit

`projects/payment/` and `projects/insurance/` are prototype projects: a screen in a device frame, its
pages in the side menu, and a sidebar for widths, versions and scenario. Everything that is the same in every
project lives in `apps/adit-board/shared/`, and a project only adds what is its own:

| `shared/` | What it gives every project |
|---|---|
| `versions.ts` | `useVersions`: Control, built and form-made versions, saved per browser, and `?embed=1&version=<id>` |
| `PageCode.tsx` | Premade code for a page with no built screen (Payment Instruction and Success, Insurance's pages but FDS): its folder sits beside built pages' (`pages/landing/`), and only the pages listed in `data/page-code.json` count as uploads, so a built page's folder is never served raw, copied or replaced. A built page (Payment's Landing, `PageCodeCard built`) can still be replaced: its upload goes beside the code in `pages/<page>-upload/` (manifest entry `folder`), `PageFrame replace` shows it for Control only (experiment versions keep the built screen), and "Use built page" deletes it again. The empty device frame is a drop zone for an `.html` file or a `.zip` of a page (up to 20 MB). `server/pageFiles.ts` (dev server; POST and DELETE `/api/pages/<project>/<page>`, product projects' own pages only) unpacks it into `projects/<project>/pages/<page>/` (the zip's wrapping folder dropped, root paths like `/assets/app.js` in its HTML made relative, unsafe paths refused; `index.html` or its only HTML file is the page) and records it in `projects/<project>/data/page-code.json`. The frame loads it by URL in a sandbox (scripts work, the board is out of reach); the plugin serves those files as they are (not through Vite) to any origin, so its module scripts load there, and the build copies them beside the project. `PageCodeCard` in the side panel replaces, opens or removes it. Deployed, a zip with module scripts needs the same `Access-Control-Allow-Origin` header on `/projects/*/pages/` |
| `panel.tsx` | `WidthCard`, `FoldTitle` and `ExperimentCard`, styled by `panel.css` |
| `experiments.tsx` | The `Experiment` type, the form, the summary, `buildBrief`'s skeleton, `builtOn` |
| `ExperimentsPage.tsx` | The Experiments page: each experiment laid out as the Confluence EDD template (header table, stakeholder summary, planning, results, conclusions), with live Control and Treatment previews. EDD fields the form doesn't ask for live in `experiment.plan` and show TBD until filled |
| `ResearchPage.tsx` | The Research bank page (`portal/research/`, linked in the side menu below Mixpanel as "Research bank"): every project's research results, a section per project, its files as same-size tiles with the uploader as the last tile (drop or browse .md/.html). Each tile has a colour dot (top right) whose pick is saved in `projects/<project>/data/research/colors.json`. A tile opens its file in a popup (`Dialog`); a Markdown file's YAML front matter is left out. One file each in `projects/<project>/data/research/`. Markdown renders with `marked` (raw HTML in it shows as text); an HTML file runs in a sandboxed frame. `server/researchFiles.ts` on the dev server saves uploads (the same name replaces a file) deletes them (the bin on a tile) and saves colour dots |
| `MixpanelPage.tsx` | The Mixpanel page (`portal/mixpanel/`, linked in the side menu above Research): a tab per project (`portal/mixpanel/#insurance`) from its `data/mixpanel-cases.json`: an overview card (dates, headline-share tiles linked to their reports, "Sync with magic"), then two charts with hover cards, end labels and a table view (series colours checked with the dataviz validator). Below them, charts added from Mixpanel links: "Add with magic" saves `projects/<project>/data/mixpanel-charts/<id>.json` as pending (`server/mixpanelCharts.ts`, dev server; the link must pass `isMixpanelLink` in `mixpanelLink.ts`) and opens Claude Code (brief kind `chart`), which fills in title, kind (line/bar, its guess), unit, x and up to 4 series. Mixpanel's tools don't return a report's chart type, so each chart has a "Chart type" row of icon buttons with Mixpanel's menu (`shared/chartTypes.ts`: line, stacked line, column, stacked column, bar, stacked bar, pie, table), saved as `chart` in its file (PATCH). Its icons (`ChartTypeIcon.tsx`) are TDS `trending`, `bar_chart` (turned sideways for Bar) and `table`; TDS has no stacked or pie icon, so those four are drawn there in `bar_chart`'s style until TDS adds them; the bin deletes one after a confirmation popup. `portal/mixpanel/main.tsx` lists the projects and their snapshots |
| `FigmaFiles.tsx` | The "Figma files" card and `useFigmaLinks` |
| `SideMenu.tsx` | The menu down the left of every project page: Krakatoa's board, then each project (`projects.ts`), which expands to its pages, then Experimentation; below the projects, Mixpanel, Research bank and Jobs & skills; on the open project, Experimentation lists each experiment (`useMenuExperiments`, called by the project's App), and each opens the prototype on that experiment's version (`#landing/H`); the page links are Control. Minimizes to a floating menu button. Its footer shows your Claude plan's 5-hour and weekly limits as % used (`server/usage.ts` on the dev server reads the newer of `~/.claude/tixai-usage.json` and `~/.claude/rate-limits.json`, which the status line `scripts/statusline.mjs` saves). Mounted in each `main.tsx` |
| `portal/project/` | The Project page (side menu, above Mixpanel): the PPRO Jira tasks with Design involvement as a board, a column per status (`STATUS_ORDER` sets their order) or, with Group by, per designer, each card with its designers, then squad, priority and key (Jira's Squad and Designer fields), then a report per designer (tasks by status category, High priority, squads; a "No designer" row last), from `portal/project/jira-tasks.json`. Sync (dev server) opens Claude Code on a brief (`briefs.ts` kind `jira`) that reruns the JQL through the Atlassian MCP and rewrites that file; the page updates by itself |
| `projects/refund/pages/fill-details/` | Refund's Fill in details page as a self-contained module to hand to others: `RefundFillDetails` (`platform` mobile or desktop, `data` one of the cases in `cases.ts`: Hotel bundling, Flight bundling, Combo trip, `reason` picked or null), built from `Mobile.tsx`, `Desktop.tsx` and the blocks both share in `parts.tsx`, styled by `fill-details.css` (tokens only), icons from the TDS drop (`icons.tsx`, `images.ts`) and Figma downloads in `assets/`. It imports nothing from the board, only `@tiket-ds/ui`; `index.ts` is its public entry. `projects/refund/App.tsx` is the board shell around it (widths 412 and 1440, a Scenario card for the case and the reason, Page code Replace) |
| `projects/refund/pages/email/` | Refund's status emails (the Email tab) as a self-contained module: `RefundEmail` (`kind` one of the twelve `EMAIL_CASES`: submitted, verified, completed early/on time/late, rejected by CS/Finance, delayed ×3, Flight auto refund started/completed (reason card, red canceled banner, no status box or passengers); `lang` en or id; or `copy` for real order data), every case's words in `copy.ts` (shared parts per language, each case its differences), styled by `email.css` (tokens only, 600 wide, rendered under a desktop `TiketProvider` for its 18/16/14/12 type), icons from the TDS drop (`icons.tsx`) and the logo, payment logos and store badges from Figma in `assets/`. A React page drawn like the email, not send-ready email HTML. The board shell shows it at 600 with Email and Language pickers and the subject line in the Scenario card |
| `jobs.ts` | Every generation job the board hands to Claude Code and the skill it should use (`.claude/skills/<name>/SKILL.md`). The Jobs & skills page (`portal/skills/`, linked at the bottom of the side menu) lists them, shows which skills exist and lets you upload, or write and edit, each `SKILL.md` (`server/skillFiles.ts` on the dev server writes it, adding the frontmatter Claude Code needs); `server/briefs.ts` names the skill in the prompt |
| `hashPage.ts` | `useHashPage`: which page is open, kept in the URL hash (`projects/insurance/#claim`) so the side menu can link to it; `useHashDetail` and `openExperiment`: the experiment shown, `#experiments/B`; `hashVersion` and `useHashVersion`: the version a flow page shows, `#landing/B` (none is Control) |
| `BuildStep.tsx` | The Build steps (code, then Figma design): "Build with magic" saves the brief to `briefs/<project>-<version>.md` (through `server/briefs.ts` on the dev server) and opens a Terminal window running `claude` on it; the command to copy is the fallback |

A project's own files: `App.tsx` (its frame and side panel), `versions.ts` (its `Version`
type with its scenario, `CONTROL`, `METRICS`, `BUILT_VERSIONS`, and `buildBrief` filling in the
shared skeleton), `data/figma-files.json`, and its screens, copy and CSS: a page's screens and
assets in `pages/<page>/` (Payment's `pages/landing/`), its side-panel cards in `panel/`. Never copy a shared piece
into a project; change it in `shared/` so every project gets the change.

## Building a brief

A brief reaches an agent either pasted ("Copy brief for agent" in the summary card's ⋯ menu) or as a file: the Code step's "Build
with magic" saves it to `briefs/<project>-<version>.md` at the repo root and opens a Terminal
window running `claude` on that file (macOS; elsewhere it shows the command to copy). That is an
ordinary interactive session: its edits are approved there as usual, and nothing runs unattended.
While it runs, the step shows its progress: the session gets `BRIEF_PROGRESS`, and the project
hooks in `.claude/settings.json` run `scripts/brief-progress.mjs`, which logs one line per step to
`briefs/<project>-<version>.progress.jsonl` (sessions without `BRIEF_PROGRESS` log nothing).
Read the whole file and follow it as the task, Atlassian link included.

The same ⋯ menu opens Claude Code on three more briefs: **Build another code alternative** (a new
built version, e.g. `B2`, with `alternativeOf: "B"`, kept out of the version list and switched to
from the menu), **Build Figma alternative** (a new section, its link appended to
`figmaAlternatives`), and the bin beside each code version (after a confirmation). On an original it deletes only
the code and the experiment's `detail`, keeping the version and its brief so it can be built
again from scratch; on an alternative it deletes the alternative. "Delete version" (dev server, built
versions) deletes the whole thing: the version, its code alternatives, its code and its saved briefs,
leaving Figma alone. Versions made in the form have no code; "Delete experiment" removes them from
the browser.

Once a version is built (it has an `experiment.detail`), the Figma design step turns on: it
saves `briefs/<project>-<version>-figma.md`, which says what changed and lists the
Figma file each page is linked to in `data/figma-files.json`. Draw the version in that file, beside
the original frames; never in a new file. A page with no link means asking for it first. When it's drawn, record
the new section's link as `figmaDesign` on the version's experiment in the project's `versions.ts`:
the card then marks the Figma design step done and links to it.

## Adding a project

A project with no screens yet (Pricing, Paylater) is only a line in `shared/projects.ts`
with `pages: []` and an `index.html` that loads `shared/BlankProject.tsx`: the side menu shows it as
one link to a blank page. Every product project (all but the design system, `PRODUCT_PROJECTS` in
`shared/projects.ts`) also gets a Research bank section and a Mixpanel tab, and only those take
research uploads and Mixpanel charts; a new line in `projects.ts` is all it takes. To give it screens:

Copy `projects/insurance/` as the template (it has no desktop layout; `projects/payment/` shows one), then:

1. Rename the folder; `projects/<folder>/` is the project's URL, and the folder name its key everywhere below.
2. `versions.ts`: its scenario type, `CONTROL`, `METRICS`, an empty `BUILT_VERSIONS`, and
   `buildBrief` with its screen name, scenario lines, code paths and widths.
3. `data/figma-files.json`: one key per tab, each a Figma link or `""`. The dev server picks it up.
4. `App.tsx`: `useVersions` with its own `storeKey`; render only the screen when `embed` is set;
   `ExperimentsPage` with `project="<folder>"` (and `desktopWidth` if it has a desktop layout);
   `WidthCard` and `FigmaFiles` in the side panel, `useHashVersion` and `useMenuExperiments`, `<SideMenu />` before `<App />` in `main.tsx`.
5. Add its `index.html` to `vite.config.ts`'s build input, and a line to `shared/projects.ts` with its
   `id`, `path` (`projects/<id>/`) and pages: that lists it on Krakatoa's board and in every page's side menu. The app reads its open page
   with `useHashPage`.
6. `pnpm verify`, and look at it: a built version's "View experiment detail" opens its case.

## Adding a screen

A new page that spans projects is a folder with its own `index.html` under `apps/adit-board/portal/`
(a project's screens live in its `projects/<id>/` folder), added to `build.rolldownOptions.input` in
its `vite.config.ts` (dev finds it without that; the build doesn't). Link to it from the side menu
(`EXTRAS` in `shared/SideMenu.tsx`), and build every URL on `import.meta.env.BASE_URL`.

## Deploying

Vercel builds from the **joy-proto repo root** (`vercel.json` + `pnpm build:site`).
Root Directory in the project settings must be empty (`.`), not this folder.

This project lives at `projects/tix ds/` and is composed into
`/design-system/` on the deployed site. The JOY vault landing page owns `/`.

The font build is the part most likely to bite. Odyssey's TTFs are never committed, so
CI has none of them and `fonts:build` ships a system-font fallback rather than failing —
see `packages/fonts/README.md` before "fixing" a deployment that renders in the wrong
typeface. Locally they're read from `tds library/tds font/`.

## Figma access

File key `RwaA7bpig0BrC9kpFOvjzD`. The MCP server needs auth; if a call returns an
auth error, run `mcp_auth` for the Figma server and retry.

This export ships no variable collections — the tokens were read off the
documentation frames on the canvas. So `get_variable_defs` will come back thin; trust
`docs/DESIGN-SYSTEM.md` and the node geometry instead.
