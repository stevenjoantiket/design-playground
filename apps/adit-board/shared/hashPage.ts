import { useCallback, useEffect, useRef, useState } from "react";

import { isProjectPage } from "./projects.js";

/** The hash without its `#`, decoded; a malformed escape (`#50%off`) is read as typed rather than throwing. */
function hashText() {
  const raw = location.hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** The page in the URL hash (`#amount`, or `#components/button` for a section on it), else the first. */
function readPage<T extends string>(values: readonly T[]): T {
  const wanted = hashText().split("/")[0];
  return values.find((v) => v === wanted) ?? values[0]!;
}

/** What follows the page in the hash: the version, `H` in `#experiments/H` or `#landing/H`, else undefined. */
const readDetail = () => hashText().split("/")[1] || undefined;

/** The hash's detail (see `readDetail`), kept current as the hash changes, e.g. from the side menu. */
export function useHashDetail() {
  const [detail, setDetail] = useState(readDetail);
  useEffect(() => {
    const onHashChange = () => setDetail(readDetail());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return detail;
}

/**
 * The version a page of the flow shows: the one its hash names (`#landing/H`, from the side menu),
 * else Control. Null on the project's own pages (Experiments), where the hash names
 * something else or nothing.
 */
export function hashVersion() {
  const [page, detail] = hashText().split("/");
  return isProjectPage(page ?? "") ? null : detail || "control";
}

/** Calls `onVersion` with `hashVersion()` each time the hash changes, e.g. an experiment picked in the side menu. */
export function useHashVersion(onVersion: (id: string) => void) {
  // Subscribed once: re-subscribing on every render could drop the listener in the middle of the
  // very hashchange it should hear, since other listeners re-render first.
  const latest = useRef(onVersion);
  useEffect(() => {
    latest.current = onVersion;
  });
  useEffect(() => {
    const onHashChange = () => {
      const id = hashVersion();
      if (id) latest.current(id);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
}

/** Opens one experiment's page: its case, metric, ticket and build steps. */
export const openExperiment = (id: string) => {
  location.hash = `experiments/${encodeURIComponent(id)}`;
};

/**
 * Which of a project's pages is open, kept in the URL hash so the side menu can link to each
 * one. Choosing a page sets the hash, which the side menu follows too.
 */
export function useHashPage<T extends string>(values: readonly T[]) {
  const [page, setPage] = useState(() => readPage(values));
  useEffect(() => {
    const onHashChange = () => setPage(readPage(values));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [values]);
  // Moving between pages keeps what follows the page: the version open in the prototype.
  const select = useCallback((next: T) => {
    const detail = readDetail();
    location.hash = detail ? `${next}/${encodeURIComponent(detail)}` : next;
  }, []);
  return [page, select] as const;
}
