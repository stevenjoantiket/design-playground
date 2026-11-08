import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Every specimen in the library is addressable, so a link is enough to say which one you
 * mean. Anchors read `category/component/variant/example`, e.g.
 *
 *   #components/navigation/top/scrolling
 *
 * The path is assembled from the nesting, not written out by hand: `Section`, `Variant`
 * and `Example` each add one segment. The first segment is the category, which is how a
 * cold load knows which tab to open before it scrolls.
 */

/** Turns a human label into the stable, URL-safe part of an anchor. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018-\u201f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A repeated segment reads as a stutter (`icons/icons`), so a child that restates its
 * parent is folded into it.
 */
function join(parent: string, segment: string): string {
  if (!parent) return segment;
  if (parent === segment || parent.endsWith(`/${segment}`)) return parent;
  return `${parent}/${segment}`;
}

const PathContext = createContext("");

/** Roots the anchor tree at the current category. */
export function AnchorRoot({ path, children }: { path: string; children: ReactNode }) {
  return <PathContext.Provider value={path}>{children}</PathContext.Provider>;
}

export function useAnchorPath(label: string, explicit?: string): string {
  return join(useContext(PathContext), explicit ?? slugify(label));
}

function linkTo(id: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${id}`;
}

/**
 * Doubles as a link and a copy button: following it moves the page, clicking it also puts
 * the absolute URL on the clipboard, which is the form worth pasting elsewhere.
 */
export function AnchorLink({ id, label }: { id: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <a
      className="ks-anchor"
      href={`#${id}`}
      title={`#${id}`}
      aria-label={`Copy link to ${label}`}
      onClick={() => {
        // The clipboard is a bonus on top of following the link, so a refusal is not worth
        // reporting — the URL is in the address bar either way.
        navigator.clipboard?.writeText(linkTo(id)).then(
          () => setCopied(true),
          () => undefined,
        );
      }}
    >
      {copied ? "copied" : "#"}
    </a>
  );
}

/** One component, or one page of tokens. */
export function Section({
  title,
  figma,
  slug,
  children,
}: {
  title: string;
  figma: string;
  slug?: string;
  children: ReactNode;
}) {
  const id = useAnchorPath(title, slug);

  return (
    <PathContext.Provider value={id}>
      <section
        className="ks-section"
        id={id}
        data-ks-anchor={id}
        data-ks-kind="section"
        data-ks-label={title}
      >
        <div className="ks-anchored">
          <h2>{title}</h2>
          <AnchorLink id={id} label={title} />
        </div>
        <p>Figma: {figma}</p>
        {children}
      </section>
    </PathContext.Provider>
  );
}

/** A named group within a component — the thing the caption used to label. */
export function Variant({
  label,
  slug,
  children,
}: {
  label: string;
  slug?: string;
  children: ReactNode;
}) {
  const id = useAnchorPath(label, slug);

  return (
    <PathContext.Provider value={id}>
      <div
        className="ks-variant"
        id={id}
        data-ks-anchor={id}
        data-ks-kind="variant"
        data-ks-label={label}
      >
        <div className="ks-anchored">
          <p className="ks-caption">{label}</p>
          <AnchorLink id={id} label={label} />
        </div>
        {children}
      </div>
    </PathContext.Provider>
  );
}

/** A single specimen: the one you point at when you say "the second one". */
export function Example({
  name,
  slug,
  children,
}: {
  name: string;
  slug?: string;
  children: ReactNode;
}) {
  const id = useAnchorPath(name, slug);

  return (
    <PathContext.Provider value={id}>
      <div
        className="ks-example"
        id={id}
        data-ks-anchor={id}
        data-ks-kind="example"
        data-ks-label={name}
      >
        <div className="ks-example__bar">
          <span className="ks-example__name">{name}</span>
          <AnchorLink id={id} label={name} />
        </div>
        {children}
      </div>
    </PathContext.Provider>
  );
}

const readHash = () => decodeURIComponent(window.location.hash.replace(/^#/, ""));

/**
 * Hash-based routing, in the two steps the category tabs force: switch to the tab the
 * target lives in, then scroll to it once that tab has rendered.
 *
 * Both steps are one-shot per hash. Reapplying them on every render would pin the page to
 * whatever was last linked to and leave the tabs unclickable. Returns the setter the tabs
 * should use, which keeps the URL in step with a manual switch.
 */
export function useAnchorTarget<T extends string>(
  category: T,
  setCategory: (next: T) => void,
  categories: readonly T[],
): (next: T) => void {
  const [target, setTarget] = useState(readHash);
  const routed = useRef<string | null>(null);
  const scrolled = useRef<string | null>(null);

  useEffect(() => {
    const onHashChange = () => setTarget(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (routed.current === target) return;
    routed.current = target;

    const wanted = target.split("/")[0] as T;
    if (wanted && categories.includes(wanted)) setCategory(wanted);
  }, [target, categories, setCategory]);

  // Waits for the category above to render: until then the target is not in the document,
  // and a miss leaves this to run again on the next commit.
  useEffect(() => {
    if (!target || scrolled.current === target) return;
    const node = document.getElementById(target);
    if (!node) return;
    scrolled.current = target;

    node.scrollIntoView({ block: "start", behavior: "smooth" });
    node.setAttribute("data-ks-hit", "");
    const timer = window.setTimeout(() => node.removeAttribute("data-ks-hit"), 2000);
    return () => window.clearTimeout(timer);
  }, [target, category]);

  return useCallback(
    (next: T) => {
      setCategory(next);
      // Drop the stale target so a reload does not jump back to the last thing linked to.
      // A category on its own has no element, so this never scrolls.
      window.history.replaceState(null, "", `#${next}`);
      setTarget(next);
    },
    [setCategory],
  );
}

type Entry = { id: string; label: string; kind: string };

/**
 * Built by reading the anchors back out of the DOM rather than from a second list that
 * could drift: document order is the order they are on the page, already nested.
 */
export function Contents({ category }: { category: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);

  /*
   * After the frame, not during the effect: this panel is a sibling of the sections it
   * lists, so on the commit that swaps tabs the new ones are not in the document yet and
   * the old ones still are.
   */
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setEntries(
        Array.from(document.querySelectorAll<HTMLElement>("[data-ks-anchor]"), (node) => ({
          id: node.dataset.ksAnchor ?? "",
          label: node.dataset.ksLabel ?? "",
          kind: node.dataset.ksKind ?? "",
        })),
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [category]);

  const sections = entries.filter((entry) => entry.kind === "section");

  return (
    <nav className="ks-toc" aria-label="Contents">
      <div className="ks-toc__jump">
        {sections.map((entry) => (
          <a key={entry.id} className="ks-toc__chip" href={`#${entry.id}`}>
            {entry.label}
          </a>
        ))}
      </div>

      <details className="ks-toc__all">
        <summary>
          Every link on this tab ({entries.length}) — copy one to point at an exact variant
        </summary>
        <ul>
          {entries.map((entry) => (
            <li key={entry.id} data-ks-kind={entry.kind}>
              <a href={`#${entry.id}`}>#{entry.id}</a>
              <span>{entry.label}</span>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}
