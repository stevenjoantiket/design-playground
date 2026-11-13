import { Label } from "@tiket-ds/ui";

import { ORDER_CASES } from "./OrderCases.js";

/** B's ribbon is red; its alternative B2's is blue. */
export type RibbonTone = "red" | "blue";

/** What is running low, by product. A cross-sell order has no single noun, so it says "items". */
const NOUN: Record<string, string> = {
  flight: "seats",
  train: "seats",
  bus: "seats",
  hotel: "rooms",
  ttd: "tickets",
  car: "cars",
  transfer: "rides",
};

/** Demo number; a real build would read remaining stock from the booking. */
const LEFT = 3;

/**
 * Experiment "Button ribbon" (version B): an urgency ribbon above the Pay now button.
 * Figma "Ribbon / Red · tail left" in the Button ribbon file: a rounded flag with a folded tail.
 * Its alternative B2 draws the same ribbon in blue.
 */
export function StockRibbon({ orderCase, tone = "red" }: { orderCase: string; tone?: RibbonTone }) {
  const icons = ORDER_CASES.find((c) => c.id === orderCase)?.icons ?? [];
  const noun = icons.length === 1 ? (NOUN[icons[0]!] ?? "items") : "items";

  return (
    <Label kind="ribbon" tone={tone} className="pay-ribbon">
      Only {LEFT} {noun} left
    </Label>
  );
}
