import { useState, type DragEvent, type ReactNode } from "react";

import { Dialog, Icon } from "./portal.js";
import "./page-code.css";

/** `folder`: where in `pages/` it sits when not its page's own folder (an upload replacing a built page). */
type Entry = { name: string; kind: "html" | "zip"; files: number; addedAt: number; folder?: string };

/**
 * Each project's `page-code.json`: which pages have premade code, saved by `server/pageFiles.ts` on the
 * dev server. The code itself sits in `projects/<project>/pages/<page>/` and is loaded by URL, so however
 * big it is, it never rides along in the board's own scripts. A malformed file counts as none.
 */
const MANIFESTS = import.meta.glob("../projects/*/data/page-code.json", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
function entryOf(project: string, page: string): Entry | undefined {
  try {
    const entry = (JSON.parse(MANIFESTS[`../projects/${project}/data/page-code.json`] ?? "{}") as Record<string, Entry>)[page];
    return typeof entry?.name === "string" ? entry : undefined;
  } catch {
    return undefined;
  }
}

/** The page's own URL; `?v=` changes with each upload, so a replaced page never shows from the cache. */
const srcOf = (project: string, page: string, entry: Entry) =>
  `${import.meta.env.BASE_URL}projects/${project}/pages/${entry.folder ?? page}/index.html?v=${entry.addedAt}`;

const MAX_BYTES = 20_000_000;
const ACCEPT = ".html,.htm,.zip,text/html,application/zip";

/** The file as base64, for a zip sent inside JSON. */
const base64Of = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Sends a file to the dev server; resolves to an error message, or null once it is saved. */
async function save(project: string, page: string, file: File): Promise<string | null> {
  const zip = /\.zip$/i.test(file.name);
  if (!zip && !/\.html?$/i.test(file.name)) return "Pick an HTML (.html) file or a zip of the page.";
  if (file.size > MAX_BYTES) return "The file is over 20 MB.";
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}api/pages/${project}/${page}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(zip ? { name: file.name, data: await base64Of(file) } : { name: file.name, text: await file.text() }),
    });
    if (res.ok) return null;
    return ((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "Couldn't save it";
  } catch {
    return "Couldn't reach the dev server";
  }
}

/** Upload state for one page: busy while saving, the last error, and the handler for a picked or dropped file. */
function useUpload(project: string, page: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const upload = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    setError((await save(project, page, file)) ?? "");
    setBusy(false);
  };
  return { busy, error, upload };
}

/**
 * The device frame's content on a page that has no built screen: the page's uploaded code, run in a
 * sandbox (its scripts work but can't reach the board), or a drop zone to upload it.
 */
export function PageFrame({
  project,
  page,
  label,
  replace = true,
  children,
}: {
  project: string;
  page: string;
  label: string;
  /** A built page's own screen (`children`) shows unless its upload replaces it; `replace` false keeps it (an experiment version). */
  replace?: boolean;
  children?: ReactNode;
}) {
  const entry = entryOf(project, page);
  const { busy, error, upload } = useUpload(project, page);
  const [over, setOver] = useState(false);

  if (children !== undefined && !(entry && replace)) return <>{children}</>;
  if (entry) return <iframe className="pc-frame" title={label} sandbox="allow-scripts allow-popups allow-forms" src={srcOf(project, page, entry)} />;
  if (!import.meta.env.DEV) {
    return (
      <div className="pc-empty portal">
        <p className="p-muted">No design for {label} yet.</p>
      </div>
    );
  }
  const drop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    void upload(event.dataTransfer.files[0]);
  };
  return (
    <div className="pc-empty portal">
      <label
        className="pc-drop"
        data-over={over || undefined}
        aria-busy={busy}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}
      >
        <input type="file" accept={ACCEPT} disabled={busy} onChange={(event) => void upload(event.target.files?.[0])} />
        <span className="pc-drop__icon">{busy ? <span className="p-spinner" /> : <Icon name="upload" size={24} />}</span>
        <span className="p-strong">{busy ? "Uploading…" : `Upload ${label}`}</span>
        <span className="p-sm p-muted">Drop the page's .html file or a .zip of it here, or click to browse</span>
      </label>
      {error ? (
        <p className="p-sm p-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Where a page's files sit in the repo, from its root: what to hand Claude Code or open in the editor. */
const folderOf = (project: string, page: string) => `apps/adit-board/projects/${project}/pages/${page}/`;

/** The page's folder, wrapped only after a slash, with a button that copies it. */
function PathRow({ folder }: { folder: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(folder);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the path stays on screen to select by hand.
    }
  };
  return (
    <div className="pc-path">
      <code>
        {folder
          .split("/")
          .filter(Boolean)
          .map((part, i) => (
            <span key={i}>
              <span className="pc-path__part">{part}/</span>
              <wbr />
            </span>
          ))}
      </code>
      <button type="button" className="p-icon-btn" aria-label="Copy path" title={copied ? "Copied" : "Copy path"} onClick={() => void copy()}>
        <Icon name={copied ? "check" : "copy"} size={16} />
      </button>
    </div>
  );
}

/**
 * The side panel's card for a page's code. A built page (`built`, e.g. Payment's Landing) shows where
 * its source lives; any other page shows its upload, to replace, open or remove. Nothing until there is one.
 */
export function PageCodeCard({ project, page, label, built = false }: { project: string; page: string; label: string; built?: boolean }) {
  if (!built || entryOf(project, page)) return <UploadedCode project={project} page={page} label={label} built={built} />;
  return <BuiltCode project={project} page={page} label={label} />;
}

/** A built page with nothing replacing it: where its code lives, and Replace to show an upload instead. */
function BuiltCode({ project, page, label }: { project: string; page: string; label: string }) {
  const { busy, error, upload } = useUpload(project, page);
  return (
    <section className="p-card pn-card" aria-label="Page code">
      <div className="pn-head">
        <h2 className="p-h3">Page code</h2>
        <span className="p-badge">Built</span>
      </div>
      <p className="p-sm p-muted">
        {label} is built in code on the Tiket design system: its screens and assets are in this folder, and the
        project page around them in <code>App.tsx</code>.
      </p>
      <PathRow folder={folderOf(project, page)} />
      {import.meta.env.DEV ? (
        <>
          <p className="p-sm p-muted">
            Replace shows an uploaded .html or .zip here instead. The built code stays, and experiment versions keep
            using it.
          </p>
          <div className="p-row">
            <label className="p-btn p-btn--outline pc-replace" aria-busy={busy}>
              <input type="file" accept={ACCEPT} disabled={busy} onChange={(event) => void upload(event.target.files?.[0])} />
              {busy ? "Uploading…" : "Replace"}
            </label>
          </div>
        </>
      ) : null}
      {error ? (
        <p className="p-sm p-danger" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

/** A page's uploaded code: replace it, open it on its own, or remove it. Nothing until there is one. */
function UploadedCode({ project, page, label, built }: { project: string; page: string; label: string; built: boolean }) {
  const entry = entryOf(project, page);
  const { busy, error, upload } = useUpload(project, page);
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");
  if (!entry) return null;
  const dev = import.meta.env.DEV;
  // Where the files sit in the repo, from its root: what to hand Claude Code or open in the editor.
  const folder = folderOf(project, entry.folder ?? page);

  const remove = async () => {
    setRemoving(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/pages/${project}/${page}`, { method: "DELETE" });
      if (!res.ok) setRemoveError("Couldn't remove it");
    } catch {
      setRemoveError("Couldn't reach the dev server");
    }
    setRemoving(false);
    setConfirming(false);
  };

  return (
    <section className="p-card pn-card" aria-label="Page code">
      <div className="pn-head">
        <h2 className="p-h3">Page code</h2>
        <span className="p-badge">{built ? "Replaced" : entry.kind === "zip" ? "ZIP" : "HTML"}</span>
      </div>
      <div className="p-stack">
        <span className="p-strong pc-name" title={entry.name}>
          {entry.name}
        </span>
        <span className="p-sm p-muted">
          {entry.kind === "zip" ? `${entry.files} files, ` : ""}uploaded{" "}
          {new Date(entry.addedAt).toLocaleString("en", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
        </span>
      </div>
      <PathRow folder={folder} />
      <p className="p-sm p-muted">
        {built ? `Shown instead of the built ${label} (experiment versions still use the built code). ` : ""}Runs in a
        sandbox: its scripts work but can't reach the board.
      </p>
      <div className="p-row">
        {dev ? (
          <label className="p-btn p-btn--outline pc-replace" aria-busy={busy}>
            <input type="file" accept={ACCEPT} disabled={busy} onChange={(event) => void upload(event.target.files?.[0])} />
            {busy ? "Uploading…" : "Replace"}
          </label>
        ) : null}
        <a className="p-btn p-btn--outline" href={srcOf(project, page, entry)} target="_blank" rel="noreferrer">
          Open
        </a>
        {dev ? (
          <button type="button" className="p-btn p-btn--outline pc-remove" onClick={() => setConfirming(true)}>
            {built ? "Use built page" : "Remove"}
          </button>
        ) : null}
      </div>
      {error || removeError ? (
        <p className="p-sm p-danger" role="alert">
          {error || removeError}
        </p>
      ) : null}
      {confirming ? (
        <Dialog
          title={built ? `Go back to the built ${label}?` : "Remove this page's code?"}
          subtext={
            built
              ? `The upload (${entry.name}) is deleted from the board and ${label} shows its built code again, which was never touched. The file you uploaded from stays where it was.`
              : `${label} goes back to blank, and its uploaded code (${entry.name}) is deleted from the board. The file you uploaded from stays where it was.`
          }
          onClose={() => setConfirming(false)}
          footer={
            <>
              <button type="button" className="p-btn p-btn--outline" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button type="button" className="p-btn p-btn--danger" aria-busy={removing} disabled={removing} onClick={() => void remove()}>
                {built ? "Use built page" : "Remove"}
              </button>
            </>
          }
        />
      ) : null}
    </section>
  );
}
