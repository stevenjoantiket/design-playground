import { useCallback, useEffect, useState } from "react";

import type { Experiment, VersionRef } from "./experiments.js";
import { hashVersion } from "./hashPage.js";

/**
 * A project's versions: Control, the ones built into the code, and the ones made in the form.
 *
 * Versions made in the form are saved in this browser, so a reload (including one an agent's code
 * edit causes) keeps them. Built ones always come from the code, live: only the scenario the page
 * set on one is kept. `?embed=1&version=<id>` (the Experiments page's before/after) shows that version and
 * never reads or writes what this browser saved, so it always shows the code as built.
 */
export function useVersions<V extends VersionRef>({
  storeKey,
  control,
  built,
  revive = (v) => v,
  fork,
}: {
  storeKey: string;
  control: V;
  built: V[];
  /** Fixes up a version read back from storage, e.g. fills in fields added since it was saved. */
  revive?: (version: V) => V;
  /** The version an experiment makes: a copy of `anchor`'s scenario, under the new label. */
  fork: (anchor: V, label: string, experiment: Experiment) => V;
}) {
  const [params] = useState(() => new URLSearchParams(location.search));
  const embed = params.get("embed") === "1";

  /** What the page holds: Control, versions made in the form, and copies of built ones it changed. */
  const [saved] = useState(() => {
    if (embed) return null;
    try {
      const data = JSON.parse(localStorage.getItem(storeKey) ?? "null");
      if (!Array.isArray(data?.versions) || data.versions[0]?.id !== "control") return null;
      return { versions: (data.versions as V[]).map(revive), activeId: data.activeId as string };
    } catch {
      return null;
    }
  });
  const [stored, setStored] = useState<V[]>(saved?.versions ?? [control]);

  // Built versions come from the code on every render, so what an agent records there (its
  // detail, a figmaDesign link) shows as soon as the file changes, without a reload. What the page
  // changed on one, its scenario, is kept.
  const versions: V[] = [
    stored[0]!,
    ...built.map((b) => {
      const local = stored.find((v) => v.id === b.id);
      return local ? { ...local, label: b.label, experiment: b.experiment, from: b.from } : b;
    }),
    // A copy of a built version whose code has since been deleted goes with it.
    ...stored.slice(1).filter((v) => !built.some((b) => b.id === v.id) && !("builtCopy" in v)),
  ];
  const [chosenId, setActiveId] = useState(() => {
    // The hash's version first (`#landing/H`; `#landing` is Control), then what this browser had open.
    const wanted = embed ? params.get("version") : (hashVersion() ?? saved?.activeId ?? null);
    return wanted && versions.some((v) => v.id === wanted) ? wanted : "control";
  });

  // The open version, or Control once it is gone (its code deleted, say), so nothing acts on a dead id.
  const activeId = versions.some((v) => v.id === chosenId) ? chosenId : "control";

  /** Changes one version, e.g. its scenario. Stable, so effects can depend on it. */
  const updateVersion = useCallback(
    (id: string, change: (version: V) => V) =>
      setStored((all) =>
        all.some((v) => v.id === id)
          ? all.map((v) => (v.id === id ? change(v) : v))
          : [...all, ...built.filter((b) => b.id === id).map((b) => ({ ...change(b), builtCopy: true }))],
      ),
    [built],
  );

  useEffect(() => {
    if (embed) return;
    try {
      localStorage.setItem(storeKey, JSON.stringify({ versions: stored, activeId }));
    } catch {
      // Storage can be blocked (private window); versions then last until the next reload.
    }
  }, [stored, activeId, embed, storeKey]);

  return {
    /** True inside the Experiments page's before/after: show only the screen. */
    embed,
    params,
    versions,
    activeId,
    active: versions.find((v) => v.id === activeId) ?? versions[0]!,
    select: setActiveId,
    /** Changes the active version, e.g. its scenario. */
    update: (change: (version: V) => V) => updateVersion(activeId, change),
    updateVersion,
    /** Copies the version the experiment builds on top of, and opens the copy. */
    /** Deletes a version made in the form; built ones live in the code. */
    remove: (id: string) => {
      setStored((all) => all.filter((v) => v.id !== id || v.id === "control"));
      if (activeId === id) setActiveId("control");
    },
    add: (experiment: Experiment, anchorId: string) => {
      // The next free letter: code alternatives (B2, …) and removed versions don't use one up.
      let code = 66;
      while (versions.some((v) => v.label === String.fromCharCode(code))) code++;
      const label = String.fromCharCode(code);
      const anchor = versions.find((v) => v.id === anchorId) ?? versions[0]!;
      setStored([...stored, fork(anchor, label, experiment)]);
      setActiveId(label);
      return label;
    },
  };
}
