import { useState } from "react";
import { FIGMA_URL } from "./figma.js";
import { FoldTitle } from "./panel.js";
import { Field } from "./portal.js";

type Note = { error?: string; saved?: boolean };

/**
 * The project's Figma links and a save that writes them to `<project>/data/figma-files.json` through the
 * dev server. The save resolves to an error message, or null once saved.
 */
export function useFigmaLinks<P extends string>(project: string, initial: Record<P, string>) {
  const [links, setLinks] = useState(initial);
  const save = async (next: Record<P, string>) => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/figma-files/${project}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) return (await res.text()) || "Couldn't save";
      setLinks(next);
      return null;
    } catch {
      return "Couldn't reach the dev server";
    }
  };
  return [links, save] as const;
}

/**
 * Sidebar card for the Figma file behind each page. Edits go to the project's `figma-files.json`
 * through the dev server, so they survive in the repo for whoever builds in Figma next.
 */
export function FigmaFiles<P extends string>({
  pages,
  links,
  onSave,
}: {
  pages: readonly { value: P; label: string }[];
  links: Record<P, string>;
  /** Resolves to an error message, or null once saved. */
  onSave: (next: Record<P, string>) => Promise<string | null>;
}) {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState(links);
  const [notes, setNotes] = useState<Partial<Record<P, Note>>>({});
  const editable = import.meta.env.DEV;

  async function commit(page: P) {
    const value = drafts[page].trim();
    setDrafts({ ...drafts, [page]: value });
    if (value === links[page]) return;
    if (value && !FIGMA_URL.test(value)) {
      setNotes({ ...notes, [page]: { error: "Paste a figma.com/design link." } });
      return;
    }
    const error = await onSave({ ...links, [page]: value });
    setNotes((current) => ({ ...current, [page]: error ? { error } : { saved: true } }));
  }

  return (
    <section className="p-card pn-card" aria-label="Figma files" data-collapsed={open ? undefined : "true"}>
      <div className="pn-head">
        <FoldTitle open={open} onToggle={() => setOpen(!open)}>
          Figma files
        </FoldTitle>
      </div>
      <p className="p-sm p-muted">
        The file each page's designs live in. “Create a Figma page” builds in that file.
        {editable ? "" : " Editing works on the dev server only."}
      </p>
      {pages.map(({ value: page, label }) => {
        const note = notes[page];
        const linked = drafts[page] !== "" && drafts[page] === links[page];
        return (
          <Field
            key={page}
            label={label}
            type="url"
            value={drafts[page]}
            disabled={!editable}
            error={note?.error}
            help={
              note?.saved ? (
                "Saved to figma-files.json"
              ) : linked ? (
                <a className="p-link" href={links[page]} target="_blank" rel="noreferrer">
                  Open in Figma
                </a>
              ) : (
                "No file linked yet"
              )
            }
            onChange={(event) => {
              setDrafts({ ...drafts, [page]: event.target.value });
              setNotes({ ...notes, [page]: undefined });
            }}
            onBlur={() => void commit(page)}
            onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
          />
        );
      })}
    </section>
  );
}
