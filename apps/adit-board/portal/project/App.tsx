import { useState } from "react";

import { HandoffProgress, openInClaude, type MenuTask } from "../../shared/BuildStep.js";
import { syncedLabel } from "../../shared/mixpanelLabels.js";
import { Segmented } from "../../shared/portal.js";
import SNAPSHOT from "./jira-tasks.json";

/** The PPRO tasks Design is involved in: the Jira board's filter, as JQL. */
const JQL = 'project = PPRO AND "cross-functional involvement[checkboxes]" = Design ORDER BY priority DESC, updated DESC';
const BOARD =
  "https://borobudur.atlassian.net/jira/core/projects/PPRO/board?filter=%22cross-functional%20involvement%5Bcheckboxes%5D%22%20%3D%20Design&groupBy=priority";
const FILE = "apps/adit-board/portal/project/jira-tasks.json";

/** What Claude Code is asked to do on Sync (`briefs.ts`, kind `jira`). */
const SYNC_BRIEF = `# Sync the Jira task list

Search Jira (Atlassian MCP, site borobudur.atlassian.net) with this JQL, every page:

    ${JQL}

Rewrite \`${FILE}\` with what it returns, keeping the order:

- "syncedAt": now, ISO with the +07:00 offset
- "tasks": one per issue, { "key", "summary", "status" (its name), "category" (the status category key: "new", "indeterminate" or "done"), "priority" (its name), "squads" (the Squad field, customfield_15450, as its list of names; [] when empty), "designers" (the display names in the Designer field, customfield_15780; [] when empty) }

Change nothing else. The Project page updates by itself.`;

type Task = (typeof SNAPSHOT.tasks)[number];

/**
 * The board's columns, left to right, in PPRO's workflow order. A status not listed here (a new one in
 * Jira) gets its own column after these, to do before in progress before done.
 */
const STATUS_ORDER = [
  "Backlog",
  "Blocked",
  "In Requirement Gathering",
  "In Product",
  "In Dependent Party",
  "In Tech Solutioning",
  "In Tech Team",
  "In Development",
  "In QA",
  "In Experiment",
];
const CATEGORY_ORDER = ["new", "indeterminate", "done"];
const rank = (t: Task) => {
  const i = STATUS_ORDER.indexOf(t.status);
  return i >= 0 ? i : STATUS_ORDER.length + CATEGORY_ORDER.indexOf(t.category);
};

/** Only the statuses that have tasks, each with its tasks in the snapshot's (priority) order. */
const BY_STATUS = [...new Set([...SNAPSHOT.tasks].sort((a, b) => rank(a) - rank(b)).map((t) => t.status))].map((title) => ({
  title,
  tasks: SNAPSHOT.tasks.filter((t) => t.status === title),
}));

/**
 * A row per designer, most tasks first, then the tasks with no designer: how many, by status category,
 * how many are High, and which squads. A task with two designers counts for both.
 */
const REPORT = [...new Set(SNAPSHOT.tasks.flatMap((t) => t.designers))]
  .map((name) => ({ name, tasks: SNAPSHOT.tasks.filter((t) => t.designers.includes(name)) }))
  .sort((a, b) => b.tasks.length - a.tasks.length || a.name.localeCompare(b.name));
const UNASSIGNED = SNAPSHOT.tasks.filter((t) => !t.designers.length);
const count = (tasks: Task[], test: (t: Task) => boolean) => tasks.filter(test).length;

/** The designer view's columns: a designer each, most tasks first, then the tasks with no designer. */
const BY_DESIGNER = [...REPORT.map((row) => ({ title: row.name, tasks: row.tasks })), ...(UNASSIGNED.length ? [{ title: "No designer", tasks: UNASSIGNED }] : [])];

/** In the designer view, the tasks waiting on the designer; the rest fold away under them. */
const ACTIVE = "In Dependent Party";

type View = "status" | "designer";
const VIEWS: { value: View; label: string }[] = [
  { value: "status", label: "Status" },
  { value: "designer", label: "Designer" },
];

/**
 * A task's card; it opens the issue in Jira. In the designer view it shows its status, and only the
 * other designers (the column already names this one).
 */
function TaskCard({ task: t, view, column }: { task: Task; view: View; column: string }) {
  const designers = view === "designer" ? t.designers.filter((name) => name !== column) : t.designers;
  return (
    <a className="pj-task" href={`https://borobudur.atlassian.net/browse/${t.key}`} target="_blank" rel="noreferrer">
      <span className="pj-summary">{t.summary}</span>
      {view === "designer" || designers.length ? (
        <span className="pj-tags">
          {view === "designer" ? (
            <span className="p-badge pj-status" data-category={t.category}>
              {t.status}
            </span>
          ) : null}
          {designers.map((name) => (
            <span key={name} className="p-badge pj-designer" title={`Designer: ${name}`}>
              {name}
            </span>
          ))}
        </span>
      ) : null}
      <span className="pj-foot">
        {t.squads.map((squad) => (
          <span key={squad} className="p-badge pj-squad" title={`Squad: ${squad}`}>
            {squad}
          </span>
        ))}
        <span className="p-badge pj-priority" data-priority={t.priority}>
          {t.priority}
        </span>
        <span className="p-sm p-muted">{t.key}</span>
      </span>
    </a>
  );
}

/** One report row: the counts, and the squads as tags. */
function ReportRow({ name, tasks, muted = false }: { name: string; tasks: Task[]; muted?: boolean }) {
  return (
    <tr>
      <th scope="row" className={muted ? "p-muted" : undefined}>
        {name}
      </th>
      <td className="p-strong">{tasks.length}</td>
      <td>{count(tasks, (t) => t.category === "new")}</td>
      <td>{count(tasks, (t) => t.category === "indeterminate")}</td>
      <td>{count(tasks, (t) => t.category === "done")}</td>
      <td>{count(tasks, (t) => t.priority === "High" || t.priority === "Highest")}</td>
      <td>
        <span className="pj-tags">
          {[...new Set(tasks.flatMap((t) => t.squads))].sort().map((squad) => (
            <span key={squad} className="p-badge pj-squad">
              {squad} {count(tasks, (t) => t.squads.includes(squad))}
            </span>
          ))}
        </span>
      </td>
    </tr>
  );
}

/** The Project page: the PPRO tasks with Design involvement as a board by status or by designer, from a Jira snapshot synced on demand. */
export function App() {
  const [view, setView] = useState<View>("status");
  const columns = view === "status" ? BY_STATUS : BY_DESIGNER;
  const cards = (tasks: Task[], column: string) => (
    <ul className="pj-cards">
      {tasks.map((t) => (
        <li key={t.key}>
          <TaskCard task={t} view={view} column={column} />
        </li>
      ))}
    </ul>
  );
  const [task, setTask] = useState<MenuTask>();
  const [error, setError] = useState("");

  const sync = async () => {
    setError("");
    const started = Date.now();
    const res = await openInClaude("portal/jira", SYNC_BRIEF, "jira");
    if (res.opened) setTask({ key: "portal/jira", what: "Sync from Jira", started });
    else setError(res.error ?? "Couldn't open Claude Code.");
  };

  return (
    <main className="p-main pj-main portal">
      <section className="p-card">
        <div className="p-card__head">
          <div className="p-stack">
            <h1 className="p-h1">Project</h1>
            <span className="p-muted">
              PPRO tasks with Design involvement · {SNAPSHOT.tasks.length} tasks ·{" "}
              <a className="p-link" href={BOARD} target="_blank" rel="noreferrer">
                Open board
              </a>
            </span>
          </div>
          <div className="p-row">
            <span className="p-sm p-muted">Last synced {syncedLabel(SNAPSHOT.syncedAt)}</span>
            {import.meta.env.DEV ? (
              <button type="button" className="p-btn" onClick={() => void sync()}>
                Sync
              </button>
            ) : null}
          </div>
        </div>
        {task ? <HandoffProgress task={task} onDismiss={() => setTask(undefined)} /> : null}
        {error ? (
          <p className="p-sm p-danger" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <div className="p-row">
        <span className="p-sm p-muted">Group by</span>
        <Segmented label="Group by" options={VIEWS} value={view} onChange={setView} />
      </div>

      {/* A column per status or per designer, scrolling sideways when they don't fit. */}
      <div className="pj-board">
        {columns.map((column) => {
          const rest = column.tasks.filter((t) => t.status !== ACTIVE);
          return (
          <section key={column.title} className="pj-column" aria-label={column.title}>
            <h2 className="pj-column__head">
              {column.title}
              <span className="p-sm p-muted">{column.tasks.length}</span>
            </h2>
            {view === "status" ? (
              cards(column.tasks, column.title)
            ) : (
              <>
                {cards(column.tasks.filter((t) => t.status === ACTIVE), column.title)}
                {rest.length ? (
                  <details className="pj-more">
                    <summary className="p-sm p-muted">{`${rest.length} other task${rest.length === 1 ? "" : "s"}`}</summary>
                    {cards(rest, column.title)}
                  </details>
                ) : null}
              </>
            )}
          </section>
          );
        })}
      </div>

      <section className="p-card" aria-labelledby="pj-report">
        <div className="p-stack">
          <h2 className="p-h2" id="pj-report">
            Report per designer
          </h2>
          <span className="p-sm p-muted">From Jira's Designer field. A task with two designers counts for both.</span>
        </div>
        <div className="pj-report">
          <table>
            <thead>
              <tr>
                <th scope="col">Designer</th>
                <th scope="col">Tasks</th>
                <th scope="col">To do</th>
                <th scope="col">In progress</th>
                <th scope="col">Done</th>
                <th scope="col">High priority</th>
                <th scope="col">Squads</th>
              </tr>
            </thead>
            <tbody>
              {REPORT.map((row) => (
                <ReportRow key={row.name} name={row.name} tasks={row.tasks} />
              ))}
              {UNASSIGNED.length ? <ReportRow name="No designer" tasks={UNASSIGNED} muted /> : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
