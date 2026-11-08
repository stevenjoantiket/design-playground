import { Text } from "@tiket-ds/ui";

import { LibraryIcon } from "../../../../design-system/icons.js";
// Product icons are not in `tds library/tds icon`; downloaded from the Order Detail
// Standardization Figma file (Tcbh3pgh68ioCj5Yive0ac, 5282:91506).
import flightSrc from "./assets/flight-vertical.svg";
import ttdSrc from "./assets/todo-vertical.svg";
import hotelSrc from "./assets/products/hotel.svg";
import carSrc from "./assets/products/car.svg";
import transferSrc from "./assets/products/transfer.svg";
import trainSrc from "./assets/products/train.svg";
import busSrc from "./assets/products/bus.svg";
import chevronSrc from "./assets/airline.svg";
import nudgeLineSrc from "./assets/products/nudge-line.svg";

const ICONS = {
  flight: flightSrc,
  hotel: hotelSrc,
  ttd: ttdSrc,
  car: carSrc,
  transfer: transferSrc,
  train: trainSrc,
  bus: busSrc,
};

type Product = keyof typeof ICONS;

/** A count shown as a white label ("1 Room"), or plain text joined to its neighbours by dots. */
type Segment = string | { chip: string };

export interface OrderCase {
  id: string;
  group: "Single order" | "Multi-order, same product" | "Multi-order, cross-sell";
  label: string;
  /** One icon for a single product; several stack, with `more` as the "+n" badge. */
  icons: Product[];
  more?: number;
  /** A plain title, or a route pair joined by → (one way) or ⇄ (round trip). */
  title: string | { from: string; to: string; round?: boolean };
  subtitle: Segment[];
}

const DATE = "Sun, 10 Oct 2022";

/** Order Card — Title & Subtitle Matrix, every row. Copy follows the drawn card where it differs from the rule text. */
export const ORDER_CASES: OrderCase[] = [
  { id: "flight", group: "Single order", label: "Flight — one way", icons: ["flight"], title: { from: "Jakarta", to: "Hong Kong" }, subtitle: [DATE, "12:40"] },
  { id: "hotel", group: "Single order", label: "Hotel — 1 room, 1 night", icons: ["hotel"], title: "Maison Teraskita Bandung", subtitle: [{ chip: "1 Room" }, DATE, "1 Night"] },
  { id: "ttd", group: "Single order", label: "TTD — single product", icons: ["ttd"], title: "Dunia Fantasi Ancol (Dufan)", subtitle: [DATE, "12:40"] },
  { id: "car", group: "Single order", label: "Car rental — 1 car", icons: ["car"], title: "Daihatsu All New Xenia", subtitle: [DATE, "08:00", "2 Days"] },
  { id: "transfer", group: "Single order", label: "Airport transfer — one way", icons: ["transfer"], title: { from: "Soekarno Hatta", to: "Grand Indonesia" }, subtitle: [DATE, "08:00"] },
  { id: "train", group: "Single order", label: "Train — one way", icons: ["train"], title: { from: "Jakarta", to: "Bandung" }, subtitle: [DATE, "08:00"] },
  { id: "bus", group: "Single order", label: "Bus & shuttle — one way", icons: ["bus"], title: { from: "Terminal Kalideres", to: "Terminal Jombor" }, subtitle: [DATE, "08:00"] },

  { id: "hotel-rooms", group: "Multi-order, same product", label: "Hotel — multi room, 1 night", icons: ["hotel"], title: "Maison Teraskita Bandung", subtitle: [{ chip: "4 Rooms" }, DATE, "1 Night"] },
  { id: "hotel-rooms-nights", group: "Multi-order, same product", label: "Hotel — multi room, multi night", icons: ["hotel"], title: "Maison Teraskita Bandung", subtitle: [{ chip: "4 Rooms" }, DATE, "2 Nights"] },
  { id: "flight-rt", group: "Multi-order, same product", label: "Flight — round trip", icons: ["flight"], title: { from: "Jakarta", to: "Hong Kong", round: true }, subtitle: [DATE, "12:40"] },
  { id: "flight-ow-inter", group: "Multi-order, same product", label: "Flight — one way, interlining", icons: ["flight"], title: { from: "Jakarta", to: "Hong Kong" }, subtitle: ["Mon, 10 Oct 2022", "12:40", "Multiple Airlines"] },
  { id: "flight-rt-inter", group: "Multi-order, same product", label: "Flight — round trip, interlining", icons: ["flight"], title: { from: "Jakarta", to: "Hong Kong", round: true }, subtitle: [DATE, "12:40", "Multiple Airlines"] },
  { id: "flight-multi", group: "Multi-order, same product", label: "Flight — multi-city", icons: ["flight"], title: "Flight Multiple Routes", subtitle: [{ chip: "2 Routes" }, DATE] },
  { id: "flight-multi-inter", group: "Multi-order, same product", label: "Flight — multi-city, interlining", icons: ["flight"], title: "Flight Multiple Routes", subtitle: [{ chip: "2 Routes" }, DATE, "Multiple Airlines"] },
  { id: "train-rt", group: "Multi-order, same product", label: "Train — round trip", icons: ["train"], title: { from: "Jakarta", to: "Bandung", round: true }, subtitle: [DATE, "08:00"] },
  { id: "train-rt-inter", group: "Multi-order, same product", label: "Train — round trip, interlining", icons: ["train"], title: { from: "Jakarta", to: "Bandung", round: true }, subtitle: [DATE, "08:00", "Multiple Trains"] },
  { id: "bus-rt", group: "Multi-order, same product", label: "Bus & shuttle — round trip", icons: ["bus"], title: { from: "Terminal Kalideres", to: "Terminal Bandung", round: true }, subtitle: [DATE, "08:00"] },

  { id: "cross-2-same", group: "Multi-order, cross-sell", label: "2 products — same date", icons: ["flight", "hotel"], title: "Flight & Hotel", subtitle: [{ chip: "1 Flight" }, { chip: "2 Hotels" }] },
  { id: "cross-2-multi", group: "Multi-order, cross-sell", label: "2 products — different dates", icons: ["flight", "hotel"], title: "Flight, Hotel", subtitle: [{ chip: "2 Products" }, "Multiple dates"] },
  { id: "cross-n-same", group: "Multi-order, cross-sell", label: "More than 2 — same date", icons: ["flight", "hotel", "ttd"], more: 2, title: "Flight, Hotel + 2 Others", subtitle: [{ chip: "6 Products" }, "04 Oct 2022, 04 Oct 2022"] },
  { id: "cross-n-multi", group: "Multi-order, cross-sell", label: "More than 2 — different dates", icons: ["flight", "hotel", "ttd"], more: 2, title: "Flight, Hotel + 2 Others", subtitle: [{ chip: "3 Products" }, "Multiple dates"] },
];

export const DEFAULT_ORDER_CASE = ORDER_CASES[0]!.id;

/** Flights only, no other product: the orders tiketDP (down payment) applies to. */
export const isFlightOrder = (id: string) => ORDER_CASES.find((c) => c.id === id)?.icons.every((p) => p === "flight") ?? false;

/**
 * The grey trip block inside the order card. `desktop` steps the type up one size, as the
 * desktop Order Detail card does.
 */
export function OrderTrip({ id, desktop = false }: { id: string; desktop?: boolean }) {
  const order = ORDER_CASES.find((c) => c.id === id) ?? ORDER_CASES[0]!;
  const titleVariant = desktop ? "body2Bold" : "body3Bold";
  const textVariant = desktop ? "body3" : "smallRegular";
  const iconSize = desktop ? 24 : 20;

  return (
    <div className={desktop ? "payd-trip" : "pay-trip"}>
      <div className="pay-row">
        {order.icons.length === 1 ? (
          <img src={ICONS[order.icons[0]!]} alt="" width={iconSize} height={iconSize} />
        ) : (
          <span className="pay-stack" aria-hidden="true">
            {order.icons.map((product) => (
              <span key={product} className="pay-stack__icon">
                <img src={ICONS[product]} alt="" />
              </span>
            ))}
            {order.more ? <span className="pay-stack__icon pay-stack__more">+{order.more}</span> : null}
          </span>
        )}
        <Text variant={titleVariant} className="pay-route">
          {typeof order.title === "string" ? (
            <span className="pay-ellipsis">{order.title}</span>
          ) : (
            <>
              <span className="pay-nowrap">{order.title.from}</span>
              <LibraryIcon name={order.title.round ? "leftRight" : "departure"} size={20} color="highEmphasis" />
              <span className="pay-ellipsis">{order.title.to}</span>
            </>
          )}
        </Text>
        {desktop ? (
          <LibraryIcon name="chevronDown" size={24} color="highEmphasis" />
        ) : (
          <span className="pay-airline">
            <img src={chevronSrc} alt="" width={16} height={16} />
          </span>
        )}
      </div>
      <div className="pay-row pay-row--start">
        {order.subtitle.map((segment, index) => {
          if (typeof segment !== "string") {
            return (
              <Text key={index} variant={textVariant} className="pay-pax">
                {segment.chip}
              </Text>
            );
          }
          const afterText = index > 0 && typeof order.subtitle[index - 1] === "string";
          return (
            <span key={index} className="pay-row pay-row--start">
              {afterText ? <span className={desktop ? "pay-dot payd-dot" : "pay-dot"} /> : null}
              <Text variant={textVariant} color="lowEmphasis" className="pay-nowrap">
                {segment}
              </Text>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Figma "Refund Reschedule Nudge": the green strip tucked behind the top of the order card.
 * `shimmer` (experiment "Promo nudge banner shimer effect", version C) sweeps a highlight across it.
 */
export function RefundNudge({ shimmer = false }: { shimmer?: boolean }) {
  return (
    <div className="pay-nudge" data-shimmer={shimmer ? "true" : undefined}>
      <img className="pay-nudge__shine" src={nudgeLineSrc} alt="" />
      <Text variant="smallRegular" color="staticWhite">
        FREE refund! Reschedule allowed until 13 Dec 2023
      </Text>
    </div>
  );
}
