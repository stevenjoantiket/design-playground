import { useEffect, useState, type ReactNode } from "react";
import "./build-step.css";
import { Icon } from "./portal.js";

/** What the dev server answers (`briefs.ts`): where the brief is, the command, and whether Terminal opened. */
type Handoff = { path: string; command: string; opened?: boolean; error?: string };

/** One line the Claude Code hooks logged for a run (`scripts/brief-progress.mjs`). */
type ProgressLine = { t: number; state: "working" | "waiting" | "idle" | "closed"; text: string };

/** The run's state, as one line over its latest steps. */
const HEADLINE: Record<ProgressLine["state"], { text: string; color: "p-link" | "p-warning" | "p-success" | "p-muted" }> = {
  working: { text: "Claude is working…", color: "p-link" },
  waiting: { text: "Waiting for you in Terminal", color: "p-warning" },
  idle: { text: "Claude replied in Terminal", color: "p-success" },
  closed: { text: "Session closed", color: "p-muted" },
};

/**
 * The run's progress, read every 2 s from the dev server while the session is open. It is read
 * once on load too: Claude's edits reload the page mid-run, and the run picks up where it was.
 */
export function useProgress(fileKey: string, started: number) {
  const [lines, setLines] = useState<ProgressLine[]>([]);
  const closed = lines.at(-1)?.state === "closed";
  useEffect(() => {
    // The log is the dev server's; a built site has none to read.
    if (!import.meta.env.DEV) return;
    let stop = false;
    const read = async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/briefs/progress?key=${encodeURIComponent(fileKey)}`);
        const body = await res.json();
        if (!stop && Array.isArray(body.lines)) setLines(body.lines);
      } catch {
        // The dev server restarts now and then; the next read picks it up.
      }
    };
    void read();
    if (closed) return () => void (stop = true);
    const timer = setInterval(read, 2000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [fileKey, started, closed]);
  return lines;
}

/** The tasks the dev server can open Claude Code on (`TASKS` in briefs.ts). */
export type HandoffKind = "code" | "figma" | "mixpanel" | "remove" | "chart" | "jira";

/**
 * Saves `brief` to `briefs/<key>.md` and opens Claude Code in Terminal on it (dev server only).
 * Resolves with what the server said, or an error message when it couldn't be reached.
 */
export async function openInClaude(key: string, brief: string, kind: HandoffKind): Promise<Handoff> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}api/briefs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, brief, kind, open: true }),
    });
    const body = await res.json();
    return res.ok ? body : { path: "", command: "", opened: false, error: body.error ?? "Couldn't save the brief." };
  } catch {
    return { path: "", command: "", opened: false, error: "Couldn't reach the dev server." };
  }
}

/** A task the ⋯ menu handed to Claude Code, kept per version in this tab so it survives reloads. */
export type MenuTask = { key: string; what: string; started: number };

/**
 * Live progress of a task the ⋯ menu started (deleting code, building an alternative): a spinner
 * while Claude works, then where it stands, with its latest steps. Same log as the Build steps.
 */
export function HandoffProgress({ task, onDismiss }: { task: MenuTask; onDismiss: () => void }) {
  const progress = useProgress(task.key, task.started);
  // Lines from an earlier run of the same key don't count.
  const lines = progress.filter((line) => line.t >= task.started - 5000);
  const latest = lines.at(-1);
  const busy = !latest || latest.state === "working";
  const headline = latest ? HEADLINE[latest.state] : { text: "Opening Claude Code…", color: "p-link" as const };
  return (
    <div className="bs-progress bs-task" role="status" aria-live="polite" aria-busy={busy}>
      <div className="bs-task__head">
        {busy ? (
          <span className="p-spinner p-link" aria-hidden="true" />
        ) : (
          <span className={latest?.state === "waiting" ? "p-warning" : "p-success"}>
            <Icon name="check" size={16} />
          </span>
        )}
        <span className={`p-sm p-strong ${headline.color}`}>
          {headline.text}
        </span>
        {busy ? null : (
          <button type="button" className="bs-link bs-task__close" aria-label="Dismiss" onClick={onDismiss}>
            <Icon name="cross" size={16} />
          </button>
        )}
      </div>
      <span className="p-sm p-muted">
        {task.what}
      </span>
      {lines.length ? (
        <ol className="bs-progress__list">
          {lines.map((line, i) => (
            <li key={i} data-latest={line === latest || undefined}>
              <span className={`p-sm p-clamp2 ${line === latest ? "" : "p-muted"}`}>
                {line.text}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

/** Where a build step stands: done already, can run now, or waiting on the step before it. */
export type StepStatus = "done" | "ready" | "locked";

/**
 * One step of building a version (code, then Figma). "Build with magic" saves its brief to
 * `briefs/` through the dev server (`briefs.ts`) and opens a Terminal window running Claude Code on
 * it: your own interactive session, where you approve each step as usual. Where Terminal can't be
 * opened, the step shows the command to copy instead. Dev server only.
 */
export function BuildStep({
  n,
  title,
  status,
  note,
  fileKey,
  brief,
  kind,
  action = "Build with magic",
}: {
  n: number;
  title: string;
  status: StepStatus;
  /** One line under the title: what the step does, why it's waiting, or where its result is. */
  note: ReactNode;
  /** `<project>/<name>`: saved as `briefs/<project>-<name>.md`. */
  fileKey: string;
  brief: string;
  /** Which task Claude Code is given: build the version in code, or draw it in Figma. */
  kind: HandoffKind;
  /** The button's label; building is the default. */
  action?: string;
}) {
  const [handoff, setHandoff] = useState<Handoff>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [started, setStarted] = useState(0);
  const progress = useProgress(fileKey, started);
  const latest = progress.at(-1);
  // A run is live once Terminal opened, or when a reload finds one still going.
  const running = Boolean(handoff?.opened) || (latest !== undefined && latest.state !== "closed");
  // A finished run's log shows only if this page started it: one left from an earlier build (say,
  // of code since deleted) says nothing about the step now.
  const showLog = latest !== undefined && (latest.state !== "closed" || started > 0);

  const open = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/briefs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileKey, brief, kind, open: true }),
      });
      const body = await res.json();
      if (!res.ok) setError(body.error ?? "Couldn't save the brief.");
      else {
        setHandoff(body);
        setStarted(Date.now());
      }
    } catch {
      setError("Couldn't reach the dev server.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy; select the command and copy it.");
    }
  };

  const fallback = handoff && !handoff.opened;

  return (
    <li className="bs-step" data-status={status}>
      <span className="bs-step__dot" aria-hidden="true">
        {status === "done" ? (
          <Icon name="check" size={14} />
        ) : (
          <span className={`p-sm p-strong ${status === "ready" ? "" : "p-muted"}`}>
            {n}
          </span>
        )}
      </span>
      <span className="bs-step__text">
        <span className={`p-strong ${status === "locked" ? "p-muted" : ""}`}>
          {title}
        </span>
        {typeof note === "string" ? (
          <span className="p-sm p-muted">
            {note}
          </span>
        ) : (
          note
        )}
      </span>
      {status === "ready" ? (
        <button type="button" className={running ? "p-btn p-btn--outline bs-step__action" : "p-btn bs-step__action"} aria-busy={busy} disabled={busy} onClick={() => void open()}>
          {running ? "Open again" : action}
        </button>
      ) : null}
      {/* A done step shows only its status; the run's log and command are for while it's going. */}
      {showLog && latest && status !== "done" ? (
        <div className="bs-step__extra bs-progress" role="status" aria-live="polite">
          <span className={`p-sm p-strong ${HEADLINE[latest.state].color}`}>
            {HEADLINE[latest.state].text}
          </span>
          <ol className="bs-progress__list">
            {progress.map((line, i) => (
              <li key={i} data-latest={line === latest || undefined}>
                <span className={`p-sm p-clamp2 ${line === latest ? "" : "p-muted"}`}>
                  {line.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {handoff?.opened && status !== "done" ? (
        <div className="bs-step__extra">
          {latest ? null : (
            <span className="p-sm p-success" role="status">
              Opened in Terminal. Approve Claude's steps there.
            </span>
          )}
          <button type="button" className="bs-link" onClick={() => setShowCommand(!showCommand)}>
            <span className="p-sm p-strong p-link">
              {showCommand ? "Hide command" : "Show command"}
            </span>
          </button>
        </div>
      ) : null}
      {handoff && status !== "done" && (fallback || showCommand) ? (
        <div className="bs-step__extra">
          {handoff.error ? (
            <span className="p-sm p-danger" role="alert">
              {handoff.error}
            </span>
          ) : null}
          <div className="bs-cmd__head">
            <span className="p-sm p-muted">
              Run in a terminal
            </span>
            <button type="button" className="bs-link" onClick={() => void copy(handoff.command)}>
              <span className={`p-sm p-strong ${copied ? "p-success" : "p-link"}`}>
                {copied ? "Copied" : "Copy"}
              </span>
            </button>
          </div>
          <pre className="bs-cmd" tabIndex={0}>
            {handoff.command}
          </pre>
        </div>
      ) : null}
      {error ? (
        <span className="p-sm p-danger bs-step__extra" role="alert">
          {error}
        </span>
      ) : null}
    </li>
  );
}
