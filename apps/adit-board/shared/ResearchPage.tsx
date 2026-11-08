import { useRef, useState } from "react";
import { marked } from "marked";

import { useHashDetail, useHashPage } from "./hashPage.js";
import { Dialog, Icon } from "./portal.js";
import { PRODUCT_PROJECTS } from "./projects.js";
import { RESEARCH_COLORS } from "./researchColors.js";
import "./research-page.css";

/** Every project's research, found at build time: `projects/<project>/data/research/<name>.md` or `.html`. An upload adds one and the page updates. */
const FOUND = import.meta.glob("../projects/*/data/research/*.{md,html}", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

/** Each project's colour dots, `projects/<project>/data/research/colors.json` (file → colour); setting one updates the page. */
const COLOR_FILES = import.meta.glob("../projects/*/data/research/colors.json", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
/** Parsed one by one, so a malformed `colors.json` loses its dots instead of failing the page. */
const COLORS: Record<string, Record<string, string>> = Object.fromEntries(
  Object.entries(COLOR_FILES).flatMap(([path, text]) => {
    try {
      return [[path, JSON.parse(text) as Record<string, string>]];
    } catch {
      return [];
    }
  }),
);
const colorOf = (project: string, file: string) => COLORS[`../projects/${project}/data/research/colors.json`]?.[file] ?? "";

// Raw HTML in a Markdown file shows as text: the page renders Markdown, nothing a file could run.
const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
marked.use({ renderer: { html: ({ text }) => escape(text) } });

type Doc = { file: string; text: string; title: string; html: boolean };

/** A project's research files, in file-name order, each titled by its first heading (or an HTML file's <title>). */
function docsOf(project: string): Doc[] {
  return Object.entries(FOUND)
    .filter(([path]) => path.startsWith(`../projects/${project}/data/research/`))
    .map(([path, raw]) => {
      const file = path.split("/").at(-1)!;
      // A Markdown file's YAML front matter (`---` … `---`, as skills have) is metadata, not part of the read.
      const text = file.endsWith(".md") ? raw.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n/, "") : raw;
      const html = file.endsWith(".html");
      const heading = html
        ? (text.match(/<title[^>]*>([^<]+)<\/title>/i) ?? text.match(/<h1[^>]*>([^<]+)<\/h1>/i))?.[1]
        : text.match(/^#\s+(.+)$/m)?.[1];
      return { file, text, html, title: heading?.trim() || file.replace(/\.(md|html)$/, "") };
    });
}

/** Every product project gets a section, in the side menu's order. */
const SECTIONS = PRODUCT_PROJECTS;
const SECTION_IDS = SECTIONS.map((s) => s.id);

const KIND = /\.(md|markdown|html?)$/i;

/**
 * The last tile of a project's grid, the same size as a file's: drop Markdown or HTML files on it,
 * or click it to browse. They save in `projects/<project>/data/research/` (dev server only, `researchFiles.ts`),
 * each turns into a tile, and the last one opens.
 */
function UploadTile({ project }: { project: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [state, setState] = useState({ busy: false, message: "", error: false });
  if (!import.meta.env.DEV) return null;

  const upload = async (files: File[]) => {
    const wrong = files.find((f) => !KIND.test(f.name));
    if (wrong) return setState({ busy: false, message: `${wrong.name} isn't a Markdown (.md) or HTML (.html) file.`, error: true });
    setState({ busy: true, message: "", error: false });
    let last = "";
    for (const file of files) {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}api/research/${project}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, text: await file.text() }),
        });
        const body = await res.json();
        if (!res.ok) return setState({ busy: false, message: `${file.name}: ${body.error ?? "Couldn't save it."}`, error: true });
        last = body.file;
      } catch {
        return setState({ busy: false, message: "Couldn't reach the dev server.", error: true });
      }
    }
    setState({ busy: false, message: "", error: false });
    if (last) location.hash = `${project}/${encodeURIComponent(last)}`;
  };

  return (
    <>
      <button
        type="button"
        className="rs-tile rs-tile--upload"
        data-over={over || undefined}
        disabled={state.busy}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const files = [...e.dataTransfer.files];
          if (files.length) void upload(files);
        }}
      >
        <Icon name="upload" size={24} />
        <span className="p-strong p-link">
          {state.busy ? "Uploading…" : "Upload"}
        </span>
        <span className="p-sm p-muted">
          or drop .md, .html
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept=".md,.markdown,.html,.htm,text/markdown,text/html"
        multiple
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) void upload(files);
        }}
      />
      {state.message ? (
        <p className="p-sm p-danger rs-msg" role="alert">
          {state.message}
        </p>
      ) : null}
    </>
  );
}

/**
 * A file's colour dot, top right of its tile: hollow until a colour is picked. On the dev server it
 * opens a palette and saves the pick in `projects/<project>/data/research/colors.json`; elsewhere it only shows.
 */
function ColorDot({ project, doc }: { project: string; doc: Doc }) {
  const color = colorOf(project, doc.file);
  const [picking, setPicking] = useState(false);
  const label = color ? `Colour: ${color}` : "No colour";
  if (!import.meta.env.DEV) return color ? <span className="rs-dot" data-color={color} role="img" aria-label={label} /> : null;

  const pick = async (next: string) => {
    setPicking(false);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/research/${project}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: doc.file, color: next }),
      });
      if (!res.ok) alert((await res.json()).error ?? "Couldn't save the colour.");
    } catch {
      alert("Couldn't reach the dev server.");
    }
  };

  return (
    <div
      className="rs-dot-wrap"
      // The palette closes when focus leaves it, or on Escape.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPicking(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setPicking(false);
      }}
    >
      <button
        type="button"
        className="rs-dot"
        data-color={color || undefined}
        aria-label={`${label}. Change colour of ${doc.title}`}
        aria-expanded={picking}
        title="Colour"
        onClick={() => setPicking(!picking)}
      />
      {picking ? (
        <div className="rs-palette" role="group" aria-label="Colour">
          {[...RESEARCH_COLORS, ""].map((c) => (
            <button
              key={c || "none"}
              type="button"
              className="rs-swatch"
              data-color={c || undefined}
              aria-label={c || "No colour"}
              aria-pressed={c === color}
              title={c || "No colour"}
              onClick={() => void pick(c)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** A file in a project's grid: its colour dot, kind and whole title, and a bin on hover (dev server only). */
function FileTile({ project, doc, open, onClick }: { project: string; doc: Doc; open: boolean; onClick: () => void }) {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    if (!confirm(`Delete "${doc.title}" (${project}/data/research/${doc.file})? This can't be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/research/${project}?file=${encodeURIComponent(doc.file)}`, { method: "DELETE" });
      if (!res.ok) alert((await res.json()).error ?? "Couldn't delete it.");
      // The tile goes when the file does; an open file closes.
      else if (open) location.hash = project;
    } catch {
      alert("Couldn't reach the dev server.");
    }
    setBusy(false);
  };
  return (
    <div className="rs-tile" data-open={open || undefined}>
      <ColorDot project={project} doc={doc} />
      {import.meta.env.DEV ? (
        <button type="button" className="p-icon-btn p-icon-btn--danger rs-tile__delete" aria-label={`Delete ${doc.title}`} title="Delete" disabled={busy} onClick={remove}>
          <Icon name="delete" size={16} />
        </button>
      ) : null}
      <button type="button" className="rs-tile__open" aria-pressed={open} title={doc.title} onClick={onClick}>
      <span className="rs-tile__top" aria-hidden="true">
        <Icon name="file" size={24} />
        <span className="rs-tile__kind" data-kind={doc.html ? "html" : "md"}>
          {doc.html ? "HTML" : "MD"}
        </span>
      </span>
      <span className={`p-strong rs-tile__title ${open ? "p-link" : ""}`}>
        {doc.title}
      </span>
      </button>
    </div>
  );
}

/**
 * The Research page, linked from the side menu above Jobs & skills: every project's research results,
 * a section each, one Markdown or HTML file each in `projects/<project>/data/research/`. `#payment/<file>` is the one open, in a popup.
 */
export function ResearchPage() {
  const [hashProject] = useHashPage(SECTION_IDS);
  const openFile = useHashDetail();
  const openProject = openFile ? hashProject : undefined;
  const open = openProject ? docsOf(openProject).find((d) => d.file === openFile) : undefined;

  return (
    <div className="portal">
      <main className="p-main">
        <section className="p-card">
          <h1 className="p-h1">
            Research bank
          </h1>
          <span className="p-muted">
            Research results for each project, one Markdown or HTML file each in <code>&lt;project&gt;/data/research/</code>.
          </span>
        </section>

        {SECTIONS.map((section) => {
          const docs = docsOf(section.id);
          return (
            <section key={section.id} className="p-card rs-project" aria-labelledby={`rs-${section.id}`}>
              <div className="rs-project__head">
                <h2 className="p-h2" id={`rs-${section.id}`}>
                  {section.title}
                </h2>
                <span className="rs-count">{docs.length}</span>
              </div>
              <div className="rs-grid">
                {docs.map((d) => (
                  <FileTile
                    key={d.file}
                    project={section.id}
                    doc={d}
                    open={d.file === open?.file && section.id === openProject}
                    onClick={() => (location.hash = `${section.id}/${encodeURIComponent(d.file)}`)}
                  />
                ))}
                {/* Last, after the files, like a "new" tile. */}
                <UploadTile project={section.id} />
              </div>
              {docs.length || import.meta.env.DEV ? null : (
                <p className="p-muted">
                  No research for {section.title} yet.
                </p>
              )}
            </section>
          );
        })}
      </main>
      {/* The open file, in a popup over the grid; closing it (Escape, the scrim) drops it from the hash. */}
      {open && openProject ? (
        <Dialog onClose={() => (location.hash = openProject)} title={open.title} subtext={`${openProject}/data/research/${open.file}`} className="rs-sheet">
          {open.html ? (
            // Its scripts run, but sandboxed apart from this page and unable to reach it.
            <iframe className="rs-frame" title={open.title} sandbox="allow-scripts allow-popups" srcDoc={open.text} />
          ) : (
            <div className="rs-doc" dangerouslySetInnerHTML={{ __html: marked.parse(open.text, { async: false }) }} />
          )}
        </Dialog>
      ) : null}
    </div>
  );
}
