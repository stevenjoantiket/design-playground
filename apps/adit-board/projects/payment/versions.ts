import { buildBrief as sharedBrief, type Experiment } from "../../shared/experiments.js";
import { ORDER_CASES } from "./pages/landing/OrderCases.js";
import { DEFAULT_CASE, type Switch, type UxCase } from "./panel/UxPanel.js";

/** One screen state: the control, or a copy of it that an experiment changed. */
export interface Version {
  id: string;
  label: string;
  ux: UxCase;
  experiment?: Experiment;
  /** The version this one was copied from, as it was at that moment. */
  from?: { label: string; ux: UxCase };
}

export const CONTROL: Version = { id: "control", label: "Control", ux: DEFAULT_CASE };

/** The numbers a payment experiment can be judged on. */
export const METRICS = ["Payment conversion", "Time to pay", "Promo & points usage", "Drop-off at payment step"];

type Option = { key: Switch; label: string };


/**
 * Versions an agent has built from a brief. They are part of the code, so they are always in
 * the Versions list: they don't depend on what this browser has saved, and they come back
 * fresh from here on every load.
 *
 * When you finish building a brief, add its version here with the same label and answers the
 * brief carries (`from` is the version it builds on top of), and gate the change with
 * `builtOn(versions, active.id, label)` (from `../shared/experiments.tsx`) in `App.tsx`, so versions built on top of it get it too.
 */
export const BUILT_VERSIONS: Version[] = [
  {
    id: "I",
    label: "I",
    ux: { ...DEFAULT_CASE, tiketDP: true },
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Both pay buttons wait for the CVV",
      hypothesis:
        "Greying out both Pay 25% upfront and Pay in full until the card's CVV is typed, and saying what is missing, shows that the form comes first, so people stop reading a single active button as the only way to pay.",
      request:
        "On a tiketDP flight with a card chosen and the CVV empty, grey out both buttons with the design system's disabled state and say “Enter your card's CVV to pay” under them. They turn blue as soon as a 3-digit CVV is typed.",
      metric: "Payment conversion",
      link: "https://github.com/aditseptian-tiket/Design-Exp/issues/5",
      detail: {
        why: "A public post says tiket.com offered only a 25% DP: with a card chosen and no CVV typed, Pay in full was greyed out beside an active DP button, and the customer took DP to be the only option. If both wait for the CVV, and the screen says why, neither looks like the one allowed choice.",
        before: "With a card chosen and the CVV empty, Pay in full is greyed out and Pay 25% upfront looks like the only way to pay.",
        after:
          "Both buttons use the disabled state until a 3-digit CVV is typed, with “Enter your card's CVV to pay” under them. To see it: turn on tiketDP and Saved credit card, then pick the saved card and leave its CVV empty.",
        facts: [
          {
            claim: "Control greys out Pay in full only, while Pay 25% upfront stays active.",
            status: "needs-data",
            evidence: "Taken from the post and the team's account of production. Confirm on production.",
          },
          {
            claim: "The post's customer left because Pay in full looked unavailable.",
            status: "needs-data",
            evidence: "One public post. Check support tickets and drop-off of tiketDP flight orders on card with an empty CVV.",
          },
          {
            claim: "The down payment is 25%.",
            status: "confirmed",
            evidence: "The post and the OPRP-151 PRD both say 25%; the prototype takes 25% of the total (DP_PERCENT in DownPay.tsx).",
          },
        ],
      },
    },
  },
];

/** Payment's brief: the shared skeleton, with the payment switches as the starting point. */
export function buildBrief(version: Version, options: Option[]): string {
  const ux = version.from?.ux ?? version.ux;
  return sharedBrief(version, {
    screen: "Payment screen",
    scenario: [
      ...options.map((o) => `- ${o.label}: ${ux[o.key] ? "on" : "off"}`),
      `- Order card: ${ORDER_CASES.find((c) => c.id === ux.orderCase)?.label ?? ux.orderCase}`,
    ],
    where: [
      "- Code lives in `apps/adit-board/projects/payment/`: `App.tsx` (mobile), `Desktop.tsx` (desktop, 840px and up), `OrderCases.tsx` (order card), `UxPanel.tsx` (switches), `versions.ts` (versions and this brief).",
    ],
    cover: "- Cover mobile (412, 839) and desktop (840, 1440) unless the request says otherwise.",
    check: "412 and 1440",
  });
}
