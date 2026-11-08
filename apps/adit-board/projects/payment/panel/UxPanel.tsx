import { useState, type ReactNode } from "react";
import { TiketProvider } from "@tiket-ds/ui";

import { FoldTitle, WidthCard } from "../../../shared/panel.js";
import { Dialog, Icon, RadioList, Switch } from "../../../shared/portal.js";
import { DEFAULT_ORDER_CASE, ORDER_CASES, OrderTrip } from "../pages/landing/OrderCases.js";
import { MIXPANEL as mixpanel } from "../data/mixpanel.js";
import { rangeLabel, syncedLabel } from "../../../shared/mixpanelLabels.js";

const GROUPS = [...new Set(ORDER_CASES.map((c) => c.group))];

/** The scenario the prototype renders. Both layouts read it; the panel beside the frame sets it. */
export interface UxCase {
  promo: boolean;
  points: boolean;
  nudge: boolean;
  savedCard: boolean;
  lpg: boolean;
  expired: boolean;
  refund: boolean;
  /** tiketDP, the 25% down payment. Shown on flight-only orders; other order cases ignore it. */
  tiketDP: boolean;
  /** Which row of the Order Card matrix the order card shows. */
  orderCase: string;
}

export type Switch = Exclude<keyof UxCase, "orderCase">;

/** The three scenarios most users land in. Picking one sets every toggle below it. */
const PRESETS = [
  {
    id: "returning",
    label: "Returning",
    value: { promo: true, points: false, nudge: true, savedCard: true, lpg: true, expired: false },
  },
  {
    id: "new",
    label: "New user",
    value: { promo: false, points: false, nudge: true, savedCard: false, lpg: true, expired: false },
  },
  {
    id: "savings",
    label: "Savings",
    value: { promo: true, points: true, nudge: false, savedCard: true, lpg: true, expired: false },
  },
] as const satisfies readonly { id: string; label: string; value: Partial<UxCase> }[];

export const DEFAULT_CASE: UxCase = { ...PRESETS[0].value, refund: true, tiketDP: false, orderCase: DEFAULT_ORDER_CASE };

/** "Oct 2025 – Oct 2026": the year the Mixpanel numbers cover. */
const MIXPANEL_RANGE = rangeLabel(mixpanel.from, mixpanel.to);

/** Presets cover the payment toggles only, so a chosen order case survives switching between them. */
function activePreset(value: UxCase): string {
  const match = PRESETS.find((p) => (Object.entries(p.value) as [Switch, boolean][]).every(([k, v]) => value[k] === v));
  return match?.id ?? "custom";
}

export const OPTIONS: { key: Switch; label: string; hint: string }[] = [
  { key: "promo", label: "Promo applied", hint: "Promo code is on the order" },
  { key: "points", label: "Use points", hint: "tiket points redeemed" },
  { key: "nudge", label: "Switch-method nudge", hint: "Mobile: suggest Mandiri Virtual Account" },
  { key: "savedCard", label: "Saved credit card", hint: "Mobile: BCA •••• 1098 in the list" },
  { key: "lpg", label: "Lowest Price Guarantee", hint: "Desktop: label above the price" },
  { key: "expired", label: "Payment time expired", hint: "Countdown at 00:00:00, Pay now disabled" },
  { key: "refund", label: "Refund nudge", hint: "Mobile: green FREE refund strip on the order card" },
  { key: "tiketDP", label: "tiketDP", hint: "Flight orders only: pay 25% upfront" },
];

export function UxPanel({
  value,
  onChange,
  widths,
  width,
  onWidthChange,
  children,
}: {
  value: UxCase;
  onChange: (next: UxCase) => void;
  /** The screen widths the prototype can show, and the one on screen. */
  widths: readonly string[];
  width: string;
  onWidthChange: (width: string) => void;
  /** More cards for the sidebar, between Screen width and UX case: Versions, Figma files. */
  children?: ReactNode;
}) {
  const [picking, setPicking] = useState(false);
  const [uxOpen, setUxOpen] = useState(true);
  const current = ORDER_CASES.find((c) => c.id === value.orderCase);
  const preset = activePreset(value);

  return (
    <div className="pay-side">
      <WidthCard widths={widths} width={width} onChange={onWidthChange} />
      {children}
      <aside className="p-card pn-card" aria-label="UX case" data-collapsed={uxOpen ? undefined : "true"}>
        <div className="pn-head">
          <FoldTitle open={uxOpen} onToggle={() => setUxOpen(!uxOpen)}>
            UX case
          </FoldTitle>
          {uxOpen ? (
            <button type="button" className="p-text-btn" onClick={() => onChange(DEFAULT_CASE)}>
              Reset
            </button>
          ) : null}
        </div>
        <div className="pn-section">
          <span className="p-field__label p-muted">{preset === "custom" ? "Custom case" : "Common cases"}</span>
          {/* A list, not tabs: more cases are coming. Each shows how common it is, from a one-time
              Mixpanel pull (`mixpanel-cases.json`). */}
          <RadioList
            label="Common cases"
            value={preset}
            onChange={(id) => onChange({ ...value, ...PRESETS.find((p) => p.id === id)!.value })}
            options={PRESETS.map((p) => {
              const data = mixpanel.cases[p.id as keyof typeof mixpanel.cases];
              return {
                value: p.id,
                label: p.label,
                aside: data ? (
                  <a className="pn-share" href={data.report} target="_blank" rel="noreferrer" title={`${data.how}. Opens in Mixpanel.`}>
                    {data.summary}
                  </a>
                ) : undefined,
              };
            })}
          />
          {/* Opens the project's Mixpanel page, with the charts and the Sync button. */}
          <a className="pn-mixpanel" href={`${import.meta.env.BASE_URL}portal/mixpanel/#payment`}>
            <span className="p-link">Mixpanel · {MIXPANEL_RANGE}</span>
            <span className="p-muted">Synced {syncedLabel(mixpanel.syncedAt)}</span>
          </a>
        </div>
        <div className="pn-section p-field">
          <span className="p-field__label">Order case</span>
          <button type="button" className="p-input pn-select" onClick={() => setPicking(true)}>
            <span>{current?.label}</span>
            <Icon name="chevronDown" size={18} />
          </button>
        </div>
        {picking ? (
          <Dialog title="Order case" className="pn-cases" onClose={() => setPicking(false)}>
            {/* The real order card blocks, so the choice is made by looking at them; they are mockup pieces. */}
            <TiketProvider theme="light" platform="desktop">
              {GROUPS.map((group) => (
                <fieldset key={group} className="pn-group portal">
                  <legend>{group}</legend>
                  <div className="pn-group__grid">
                    {ORDER_CASES.filter((c) => c.group === group).map((c) => (
                      <label key={c.id} className="pn-case">
                        <span className="pn-case__name">
                          <input
                            type="radio"
                            name="order-case"
                            checked={value.orderCase === c.id}
                            onChange={() => {
                              onChange({ ...value, orderCase: c.id });
                              setPicking(false);
                            }}
                          />
                          {c.label}
                        </span>
                        <span className="pn-case__preview">
                          <OrderTrip id={c.id} />
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </TiketProvider>
          </Dialog>
        ) : null}
        {OPTIONS.map(({ key, label, hint }) => (
          <label key={key} className="pn-row">
            <span>
              <span className="p-strong">{label}</span>
              <span className="p-sm p-muted">{hint}</span>
            </span>
            <Switch checked={value[key]} onChange={(e) => onChange({ ...value, [key]: e.target.checked })} />
          </label>
        ))}
      </aside>
    </div>
  );
}
