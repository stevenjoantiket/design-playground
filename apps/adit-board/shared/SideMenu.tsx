import { useEffect, useState, useSyncExternalStore } from "react";
import { TiketProvider } from "@tiket-ds/ui";

import { Icon } from "./portal.js";
import { ExperimentSheet, type Experiment, type VersionRef } from "./experiments.js";
import { useHashDetail, useHashPage } from "./hashPage.js";
import { PROJECTS, isProjectPage } from "./projects.js";
import "./portal.css";
import "./side-menu.css";

const BASE = import.meta.env.BASE_URL;
const HERE = PROJECTS.find((project) => location.pathname.startsWith(`${BASE}${project.path}`));
const HERE_PAGES = (HERE?.pages ?? []).map((page) => page.value);
const STORE_KEY = "adit-board:side-menu";
/** The pages below the projects, each its own Vite page. */
const EXTRAS = [
] as { path?: string; href?: string; label: string; emoji: string }[];

/**
 * The open project's experiments, for the links under Experimentation, each with its designs (the
 * version it was built as, then its code alternatives B2, B3…), which are not listed. Only the project's App knows
 * them (versions made in the form live in this browser), so it hands them over with `useMenuExperiments`.
 */
let menuExperiments: { name: string; designs: { id: string; label: string }[] }[] = [];
const menuListeners = new Set<() => void>();
const subscribeMenu = (listener: () => void) => {
  menuListeners.add(listener);
  return () => menuListeners.delete(listener);
};

/** What the menu's "Add new experiment" form needs from the open project; set by `useMenuExperiments`. */
let menuForm: { versions: VersionRef[]; metrics: readonly string[]; onAdd: (experiment: Experiment, anchorId: string) => string } | null =
  null;

/**
 * Lists the project's experiments in the side menu, one row each however many designs it has, and
 * lets the menu's "Add new experiment" add one to this project.
 */
export function useMenuExperiments(versions: VersionRef[], form: { metrics: readonly string[]; onAdd: (experiment: Experiment, anchorId: string) => string }) {
  useEffect(() => {
    menuForm = { versions, ...form };
  });
  const design = (v: VersionRef) => ({ id: v.id, label: v.label });
  const key = JSON.stringify(
    versions.flatMap((v) =>
      v.experiment && !v.experiment.alternativeOf
        ? [{ name: v.experiment.name, designs: [v, ...versions.filter((alt) => alt.experiment?.alternativeOf === v.label)].map(design) }]
        : [],
    ),
  );
  useEffect(() => {
    menuExperiments = JSON.parse(key);
    menuListeners.forEach((listener) => listener());
  }, [key]);
}

type Limit = { percent: number; resetsAt: number | null } | null;
type Usage = { at: number | null; fiveHour: Limit; weekly: Limit };

/** Green until half used, orange from half, red from 80%. */
const level = (percent: number) => (percent >= 80 ? "alert" : percent >= 50 ? "analytic" : "positive");

/** "Resets 3:40 PM" within a day, else "Resets Mon 9:00 AM". */
function resets(at: number | null) {
  if (!at) return "";
  const date = new Date(at);
  const soon = at - Date.now() < 24 * 3600_000;
  return `Resets ${date.toLocaleString("en", soon ? { hour: "numeric", minute: "2-digit" } : { weekday: "short", hour: "numeric", minute: "2-digit" })}`;
}

/** "2h 14m" until `at` (minutes only under an hour, days over a day); "now" once it has passed. */
function timeLeft(at: number) {
  const minutes = Math.max(0, Math.round((at - Date.now()) / 60_000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

/** Your Claude Code plan limits, from the dev server (`usage.ts`), read every minute. None outside the dev server. */
function useUsage() {
  const [usage, setUsage] = useState<Usage>();
  useEffect(() => {
    let stop = false;
    const read = async () => {
      try {
        const res = await fetch(`${BASE}api/usage`);
        if (res.ok && !stop) setUsage(await res.json());
      } catch {
        // No dev server (a build), or it is restarting; the footer stays as it was.
      }
    };
    void read();
    const timer = setInterval(read, 60_000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, []);
  return usage;
}

/** One plan limit: its share used as a coloured meter, and when it resets. */
function LimitMeter({
  label,
  limit,
  compact = false,
  countdown = false,
}: {
  label: string;
  limit: Limit;
  compact?: boolean;
  /** Also say how long until it resets: the 5-hour window, which is the one that runs out. Expanded only. */
  countdown?: boolean;
}) {
  const percent = Math.min(100, Math.round(limit?.percent ?? 0));
  return (
    <div className="side-menu__limit" data-level={limit ? level(percent) : undefined}>
      <div className="side-menu__limit-head">
        <span className="p-text-xs p-muted">{label}</span>
        <span className="side-menu__percent">{limit ? `${percent}%` : "–"}</span>
      </div>
      <div
        className="side-menu__meter"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      {limit?.resetsAt && !compact ? (
        <span className="p-text-xs p-muted">
          {resets(limit.resetsAt)}
          {countdown ? ` · in ${timeLeft(limit.resetsAt)}` : ""}
        </span>
      ) : null}
      {limit && !limit.resetsAt && countdown && !compact ? (
        // No window running: the 5-hour window starts with the next message, and its reset with it.
        <span className="p-text-xs p-muted">No window running: it starts with your next message</span>
      ) : null}
    </div>
  );
}

const USAGE_KEY = "adit-board:plan-usage";

/** Expanded unless this browser minimized the usage footer last time. */
function readUsageOpen() {
  try {
    return localStorage.getItem(USAGE_KEY) !== "minimized";
  } catch {
    return true;
  }
}

/**
 * The footer: the plan's 5-hour and weekly limits. Expanded, each has its meter and reset time;
 * minimized, both sit side by side as a short label, the share and a thin meter.
 */
function PlanUsage({ usage }: { usage: Usage }) {
  const [open, setOpen] = useState(readUsageOpen);
  const toggle = () => {
    setOpen(!open);
    try {
      localStorage.setItem(USAGE_KEY, open ? "minimized" : "expanded");
    } catch {
      // Storage can be blocked (private window); the footer then starts expanded.
    }
  };
  return (
    <div className="side-menu__usage" data-open={open || undefined}>
      <button type="button" className="side-menu__usage-head" aria-expanded={open} onClick={toggle}>
        Claude plan usage
        <Icon name="chevronDown" size={16} />
      </button>
      <div className={open ? "side-menu__limits" : "side-menu__limits side-menu__limits--compact"}>
        <LimitMeter label={open ? "5-hour limit" : "5h"} limit={usage.fiveHour} compact={!open} countdown />
        <LimitMeter label={open ? "Weekly limit" : "Week"} limit={usage.weekly} compact={!open} />
      </div>
      {usage.at || !open ? null : (
        <span className="p-text-xs p-muted">Shows once a Claude Code session in Terminal has replied.</span>
      )}
    </div>
  );
}

/** A top-level row's name, after its emoji icon. */
function MenuLabel({ emoji, children }: { emoji: string; children: string }) {
  return (
    <span className="side-menu__label">
      <span className="side-menu__emoji" aria-hidden="true">
        {emoji}
      </span>
      {children}
    </span>
  );
}

/** Docked unless this browser minimized it last time. */
function readMinimized() {
  try {
    return localStorage.getItem(STORE_KEY) === "minimized";
  } catch {
    return false;
  }
}

/**
 * The menu down the left of every project page: Krakatoa's board, then each project, which opens
 * to its pages. The open project starts expanded with its page marked. Minimized, it is a floating
menu button top left that docks it again; this browser remembers which. Not shown in embed mode.
 */
export function SideMenu() {
  const embed = new URLSearchParams(location.search).get("embed") === "1";
  const [page] = useHashPage(HERE_PAGES);
  const detail = useHashDetail();
  const experiments = useSyncExternalStore(subscribeMenu, () => menuExperiments);
  const flow = !isProjectPage(page);
  const [adding, setAdding] = useState(false);
  // Experimentation's list of experiments: open on the Experiments page or an experiment's prototype, closed
  // on a Control page; a second click on it, on the Experiments page, folds it.
  const [subsFolded, setSubsFolded] = useState(false);
  const subsOpen = page === "experiments" ? !subsFolded : flow && !!detail && detail !== "control";
  const [minimized, setMinimized] = useState(readMinimized);
  const usage = useUsage();

  useEffect(() => {
    if (embed) return;
    const state = minimized ? "minimized" : "docked";
    document.documentElement.dataset.sideMenu = state;
    try {
      localStorage.setItem(STORE_KEY, state);
    } catch {
      // Storage can be blocked (private window); the menu then starts docked.
    }
  }, [embed, minimized]);

  if (embed) return null;

  if (minimized) {
    return (
      <div className="side-menu portal">
        <button
          type="button"
          className="side-menu__float"
          aria-label="Show menu"
          title="Show menu"
          onClick={() => setMinimized(false)}
        >
          <Icon name="gridView" size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="side-menu portal">
      <nav aria-label="Projects" className="side-menu__body">
        <div className="side-menu__head">
          <a className="side-menu__home" href={BASE}>
            <span className="side-menu__brand">Krakatoa's board</span>
          </a>
          <button
            type="button"
            className="side-menu__minimize"
            aria-label="Minimize menu"
            title="Minimize menu"
            onClick={() => setMinimized(true)}
          >
            <Icon name="chevronLeft" size={20} />
          </button>
        </div>
        {PROJECTS.map((project) => {
          const current = project === HERE;
          // A project with no pages yet is one link, to its blank page.
          if (!project.pages.length)
            return (
              <a key={project.path} className="side-menu__row" href={`${BASE}${project.path}`} aria-current={current ? "page" : undefined}>
                <MenuLabel emoji={project.emoji}>{project.title}</MenuLabel>
              </a>
            );
          return (
            <details key={project.path} className="side-menu__project" open={current}>
              <summary className="side-menu__row">
                <MenuLabel emoji={project.emoji}>{project.title}</MenuLabel>
                <span className="side-menu__chevron">
                  <Icon name="chevronDown" size={16} />
                </span>
              </summary>
              <ul className="side-menu__pages">
                {project.pages.map((item) => {
                  // On a flow page, a version in the hash (`#landing/H`) is that experiment's prototype, not this Control page.
                  const open = current && item.value === page && !(flow && detail);
                  // The open project's Experimentation opens out into its experiments, each a link to its prototype.
                  const subs = current && item.value === "experiments" ? experiments : [];
                  const designs = subs.flatMap((x) => x.designs);
                  // A flow page names the version it shows; the Experiments page shows the first when it names none.
                  const shownId = flow ? detail : page !== "experiments" ? undefined : designs.some((d) => d.id === detail) ? detail : designs[0]?.id;
                  return (
                    <li key={item.value}>
                      <a
                        className="side-menu__row"
                        href={`${BASE}${project.path}#${item.value}`}
                        aria-current={open && !(subs.length && subsOpen) ? "page" : undefined}
                        aria-expanded={subs.length ? subsOpen : undefined}
                        onClick={(event) => {
                          if (!subs.length) return;
                          if (page === item.value) {
                            event.preventDefault();
                            setSubsFolded(subsOpen);
                          } else setSubsFolded(false);
                        }}
                      >
                        <span className="side-menu__label">{item.label}</span>
                        {subs.length ? <span className="side-menu__count">{subs.length}</span> : null}
                      </a>
                      {subs.length && subsOpen ? (
                        <ul className="side-menu__subs">
                          {subs.map((x) => {
                            // Marked while any of its designs (the version, or a code alternative) is shown.
                            const shown = x.designs.some((d) => d.id === shownId);
                            return (
                              <li key={x.designs[0]!.id}>
                                <a
                                  className="side-menu__row side-menu__sub"
                                  href={`${BASE}${project.path}#${project.pages[0]!.value}/${encodeURIComponent(x.designs[0]!.id)}`}
                                  aria-current={shown ? "page" : undefined}
                                  title={x.name}
                                >
                                  <span className="side-menu__ellipsis">{x.name}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
        {/* Not projects: every project's numbers and research in one place, and the jobs the board hands to Claude Code. */}
        {EXTRAS.map((extra) => {
          if (extra.href) {
            return (
              <a key={extra.href} className="side-menu__row side-menu__extra" href={extra.href} target="_blank" rel="noopener noreferrer">
                <MenuLabel emoji={extra.emoji}>{extra.label}</MenuLabel>
              </a>
            );
          }
          const here = location.pathname.startsWith(`${BASE}${extra.path}`);
          return (
            <a key={extra.path} className="side-menu__row side-menu__extra" href={`${BASE}${extra.path}`} aria-current={here ? "page" : undefined}>
              <MenuLabel emoji={extra.emoji}>{extra.label}</MenuLabel>
            </a>
          );
        })}
        {/* On a project with experiments: the new-experiment form, then the new experiment's prototype. */}
        {HERE_PAGES.includes("experiments") ? (
          <button type="button" className="p-btn p-btn--soft side-menu__add" onClick={() => setAdding(true)}>
            <Icon name="plus" size={16} />
            Add new experiment
          </button>
        ) : null}
        {adding && menuForm ? (
          // ponytail: the form is still built from the Tiket design system; it moves to portal styles in a later step.
          <TiketProvider theme="light" platform="desktop">
          <ExperimentSheet
            versions={menuForm.versions}
            metrics={menuForm.metrics}
            onCancel={() => setAdding(false)}
            onCreate={(experiment, anchorId) => {
              const id = menuForm!.onAdd(experiment, anchorId);
              setAdding(false);
              location.hash = `${HERE_PAGES[0]}/${encodeURIComponent(id)}`;
            }}
          />
          </TiketProvider>
        ) : null}
        {usage ? <PlanUsage usage={usage} /> : null}
      </nav>
    </div>
  );
}
