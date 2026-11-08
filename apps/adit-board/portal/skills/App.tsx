import { useEffect, useRef, useState } from "react";

import { JOBS } from "../../shared/jobs.js";

/** The skills in the repo, found at build time: `.claude/skills/<name>/SKILL.md`. Adding one updates the page. */
const FOUND = import.meta.glob("../../../../.claude/skills/*/SKILL.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const BUILT_IN = new Map(
  Object.entries(FOUND).map(([path, text]) => [
    path.split("/").at(-2)!,
    text.match(/^description:\s*(.+)$/m)?.[1]?.replace(/^["']|["']$/g, "") ?? "",
  ]),
);

type Skills = Map<string, string>;

/** Saves the skill from an uploaded Markdown file, or from text written or pasted here (dev server only, `skillFiles.ts`). */
function SkillEditor({ name, exists, onSaved }: { name: string; exists: boolean; onSaved: (skills: Skills) => void }) {
  const [text, setText] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<{ busy: boolean; message: string; error: boolean }>({ busy: false, message: "", error: false });
  if (!import.meta.env.DEV) return null;
  const api = `${import.meta.env.BASE_URL}api/skills`;

  const open = async () => {
    setState({ busy: false, message: "", error: false });
    if (!exists) return setText("");
    try {
      const res = await fetch(`${api}?name=${encodeURIComponent(name)}`);
      setText(res.ok ? ((await res.json()).text ?? "") : "");
    } catch {
      setText("");
    }
  };

  const save = async (text: string, from = "") => {
    setState({ busy: true, message: "", error: false });
    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text }),
      });
      const body = await res.json();
      if (!res.ok) return setState({ busy: false, message: body.error ?? "Couldn't save it.", error: true });
      onSaved(new Map(Object.entries(body)));
      setText(null);
      setState({ busy: false, message: `Saved ${from}as .claude/skills/${name}/SKILL.md.`, error: false });
    } catch {
      setState({ busy: false, message: "Couldn't reach the dev server.", error: true });
    }
  };

  const upload = async (file: File) => {
    if (!/\.(md|markdown)$/i.test(file.name)) return setState({ busy: false, message: "Pick a Markdown (.md) file.", error: true });
    await save(await file.text(), `${file.name} `);
  };

  return (
    <div className="sk-edit">
      <input
        ref={input}
        type="file"
        accept=".md,.markdown,text/markdown"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
      {text === null ? (
        <div className="sk-edit__actions">
          <button type="button" className="p-btn p-btn--outline" aria-busy={state.busy} disabled={state.busy} onClick={() => input.current?.click()}>
            {exists ? "Replace with a file" : "Upload SKILL.md"}
          </button>
          <button type="button" className="p-btn p-btn--outline" disabled={state.busy} onClick={() => void open()}>
            {exists ? "Edit SKILL.md" : "Write manually"}
          </button>
        </div>
      ) : (
        <>
          <textarea
            className="p-input sk-edit__text"
            aria-label={`SKILL.md for ${name}`}
            placeholder="Paste the skill here. Frontmatter (name, description) is added if it's missing."
            value={text}
            onChange={(event) => setText(event.target.value)}
            autoFocus
          />
          <div className="sk-edit__actions">
            <button type="button" className="p-btn p-btn--outline" onClick={() => setText(null)}>
              Cancel
            </button>
            <button type="button" className="p-btn" aria-busy={state.busy} disabled={state.busy || !text.trim()} onClick={() => void save(text)}>
              Save
            </button>
          </div>
        </>
      )}
      {state.message ? (
        <span className={`p-sm ${state.error ? "p-danger" : "p-success"}`} role="status">
          {state.message}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Jobs & skills: every generation the board hands to Claude Code, where it starts, what it makes,
 * and the skill that should guide it (and whether that skill is written yet).
 */
export function App() {
  // What the build found, then the dev server's live list, so a save shows without a reload.
  const [SKILLS, setSkills] = useState<Skills>(BUILT_IN);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    fetch(`${import.meta.env.BASE_URL}api/skills`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => body && setSkills(new Map(Object.entries(body))))
      .catch(() => {});
  }, []);
  const needed = [...new Set(JOBS.flatMap((j) => (j.skill ? [j.skill] : [])))];
  const written = needed.filter((s) => SKILLS.has(s)).length;
  return (
    <main className="p-main portal">
        <section className="p-card">
          <div className="p-stack">
            <span className="p-sm p-muted">
              Krakatoa's board
            </span>
            <h1 className="p-h1">
              Jobs &amp; skills
            </h1>
            <p className="p-muted">
              What “Build with magic” and the ⋯ menu hand to Claude Code. A skill teaches Claude how to do a job well here;
              {` ${written} of ${needed.length}`} are written. Add one as <code>.claude/skills/&lt;name&gt;/SKILL.md</code> at the repo
              root: Claude Code picks it up, and the job's prompt names it.
            </p>
          </div>
        </section>

        <ul className="sk-jobs">
          {JOBS.map((job) => {
            const ready = job.skill ? SKILLS.has(job.skill) : null;
            return (
              <li key={job.id} className="p-card sk-job">
                <div className="sk-job__head">
                  <h2 className="p-h2">
                    {job.name}
                  </h2>
                  {ready === null ? (
                    <span className="p-sm p-strong p-muted">
                      No skill needed
                    </span>
                  ) : ready ? (
                    <span className="p-badge p-badge--success">Skill ready</span>
                  ) : (
                    <span className="p-badge p-badge--warning">Skill not written yet</span>
                  )}
                </div>
                <dl className="p-meta">
                  <div>
                    <dt>Starts from</dt>
                    <dd>{job.trigger}</dd>
                  </div>
                  <div>
                    <dt>Produces</dt>
                    <dd>{job.output}</dd>
                  </div>
                  <div>
                    <dt>Skill</dt>
                    <dd>
                      {job.skill ? (
                        <span className="p-stack">
                          <code>{job.skill}</code>
                          {ready && SKILLS.get(job.skill) ? (
                            <span className="p-sm p-muted">
                              {SKILLS.get(job.skill)}
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="p-muted">None</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Should teach</dt>
                    <dd>{job.skillTeaches}</dd>
                  </div>
                </dl>
                {job.skill ? <SkillEditor name={job.skill} exists={Boolean(ready)} onSaved={setSkills} /> : null}
              </li>
            );
          })}
        </ul>
    </main>
  );
}
