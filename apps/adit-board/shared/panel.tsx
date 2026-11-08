import { createContext, useContext, useState, type ComponentProps, type ReactNode } from "react";
import { TiketProvider } from "@tiket-ds/ui";

import { ExperimentSummary } from "./experiments.js";
import { Icon } from "./portal.js";
import "./panel.css";

const HIDDEN_KEY = "adit-board:side-panel";

/** The panel's hide button, for the first card's header; set by `PanelColumn`. */
const HideContext = createContext<(() => void) | undefined>(undefined);

/**
 * The prototype's right-hand column. Hidden, it leaves one floating button top right that shows it
 * again, and the prototype takes the room; this browser remembers which.
 */
export function PanelColumn({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(HIDDEN_KEY) === "hidden";
    } catch {
      return false;
    }
  });
  const set = (next: boolean) => {
    setHidden(next);
    try {
      localStorage.setItem(HIDDEN_KEY, next ? "hidden" : "shown");
    } catch {
      // Storage can be blocked (private window); the panel then starts shown.
    }
  };
  if (hidden)
    return (
      <div className="portal">
        <button type="button" className="pn-float" aria-label="Show panel" title="Show panel" onClick={() => set(false)}>
          <Icon name="chevronLeft" size={20} />
        </button>
      </div>
    );
  return (
    <div className="pay-side-col portal">
      <HideContext.Provider value={() => set(true)}>{children}</HideContext.Provider>
    </div>
  );
}

/** A card title that doubles as its minimize button. */
export function FoldTitle({ open, onToggle, children }: { open: boolean; onToggle: () => void; children: string }) {
  return (
    <h2 className="p-h3">
      <button type="button" className="pn-fold" aria-expanded={open} onClick={onToggle}>
        {children}
        <Icon name="chevronDown" size={18} />
      </button>
    </h2>
  );
}

/** The screen widths the prototype can show, each a tile with a small outline of the screen's proportions. */
export function WidthCard({
  widths,
  width,
  onChange,
  disabledWidths = [],
}: {
  widths: readonly string[];
  width: string;
  onChange: (width: string) => void;
  /** Widths shown but not pickable, for a screen not designed at them yet. */
  disabledWidths?: readonly string[];
}) {
  const hide = useContext(HideContext);
  return (
    <section className="p-card pn-card" aria-label="Screen width">
      <div className="pn-head">
        <h2 className="p-h3">Screen width</h2>
        {hide ? (
          <button type="button" className="p-icon-btn pn-hide" aria-label="Hide panel" title="Hide panel" onClick={hide}>
            <Icon name="chevronRight" size={20} />
          </button>
        ) : null}
      </div>
      <div className="pn-widths" role="radiogroup" aria-label="Screen width">
        {widths.map((w) => (
          <label key={w} className="pn-width" data-selected={w === width || undefined} data-disabled={disabledWidths.includes(w) || undefined}>
            <input type="radio" name="screen-width" checked={w === width} disabled={disabledWidths.includes(w)} onChange={() => onChange(w)} />
            <span className="pn-width__box" aria-hidden="true">
              <span className="pn-width__shape" data-size={w} />
            </span>
            {w}px
          </label>
        ))}
      </div>
    </section>
  );
}

/** The open experiment's card in the prototype's side panel: its metric, ticket, build steps and ⋯ menu. Nothing for Control. */
export function ExperimentCard(props: ComponentProps<typeof ExperimentSummary>) {
  if (!props.version.experiment) return null;
  return (
    <section className="p-card pn-card" aria-label="Experiment">
      {/* ponytail: the summary is still on the Tiket design system; it moves with the Experiments page. */}
      <TiketProvider theme="light" platform="desktop">
        <ExperimentSummary {...props} />
      </TiketProvider>
    </section>
  );
}
