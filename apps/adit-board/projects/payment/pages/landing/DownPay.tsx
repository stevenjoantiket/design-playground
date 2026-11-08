import { useEffect, useEffectEvent, useId, useState, type CSSProperties, type ReactNode } from "react";
import { Button, Radio, StatusBar, Text } from "@tiket-ds/ui";

import infoOutlineSrc from "./assets/tds_ic_information_outline.svg";
import { LibraryIcon } from "../../../../design-system/icons.js";
import { ORDER_CASES } from "./OrderCases.js";
import crossSrc from "../../../../../../tds library/tds icon/tds_ic_cross_big.svg";
import backSrc from "../../../../../../tds library/tds icon/tds_ic_back.svg";
import infoSrc from "../../../../../../tds library/tds icon/tds_ic_information.svg";
// Not in `tds library/tds icon` (or drawn differently there); downloaded from the SSOT-Payment
// Figma file, tiketDP section 6013:81771.
import downpayIconSrc from "./assets/downpay-icon.svg";
import downpaySwooshSrc from "./assets/downpay-swoosh.svg";
import todayBgSrc from "./assets/dp-step-today-bg.svg";
import todayIconSrc from "./assets/dp-step-today-icon.svg";
import dueSrc from "./assets/dp-step-due.svg";
import departureSrc from "./assets/dp-step-departure.svg";
import insuranceSrc from "./assets/dp-insurance.svg";
import heroEllipseSrc from "./assets/dp-hero-ellipse.svg";
import heroSwooshSrc from "./assets/dp-hero-swoosh.svg";
import heroVectorSrc from "./assets/dp-hero-vector.svg";
import stepLineSrc from "./assets/dp-step-line.png";
import buttonEffectSrc from "./assets/dp-button-effect.svg";

/**
 * tiketDP (tiket DownPayment) — Figma ShfdpRBPz0jMNPynprlfbM, section 6013:81771.
 * Flight-only orders can pay a down payment now and the rest before a due date. Using it upgrades the
 * ticket to 100% Refund, which adds a fee; the down payment is taken from the upgraded price.
 */

/** tiketDP takes 25% of the (upgraded) total; every label and amount derives from this. */
export const DP_PERCENT = 25;
const DP_SHARE = DP_PERCENT / 100;

const idr = (amount: number) => `IDR ${amount.toLocaleString("en-US")}`;
const thousands = (amount: number) => Math.round(amount / 1000) * 1000;

// Figma's sample dates; the prototype's order has no real dates.
const DUE = "3 May 2025";
const DUE_TIME = "(13:34 GMT+7)";
const DEPARTURE = "17 May 2025";

export type DpAmounts = {
  /** The total before the upgrade. */
  before: number;
  /** The 100% Refund upgrade fee: 10% of the total, as in Figma (IDR 1,000,000 → 1,100,000). */
  fee: number;
  after: number;
  /** Paid today: the down payment share of the upgraded price. */
  upfront: number;
  /** Paid before the due date. */
  rest: number;
};

export function dpAmounts(total: number): DpAmounts {
  const fee = thousands(total * 0.1);
  const after = total + fee;
  const upfront = thousands(after * DP_SHARE);
  return { before: total, fee, after, upfront, rest: after - upfront };
}

/** The payment method the order is paid with today; a card can also be split into instalments. */
export type DpMethod = { logo: ReactNode; name: ReactNode; card?: boolean };

/** Escape closes only the topmost tiketDP layer (the instalment sheet over the DownPay page). */
const layers: object[] = [];
function useEscape(close: () => void) {
  const onClose = useEffectEvent(close);
  // Registered once per layer, so a re-render never moves a layer above the one opened on it.
  useEffect(() => {
    const layer = {};
    layers.push(layer);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && layers.at(-1) === layer) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      layers.splice(layers.indexOf(layer), 1);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
}

/** The banner under "You Can Save More!"; it opens the info sheet. */
export function DpBanner({ amounts, onOpen }: { amounts: DpAmounts; onOpen: () => void }) {
  return (
    <button type="button" className="pay-dp-banner" onClick={onOpen}>
      <img src={downpaySwooshSrc} alt="" width={124.552} height={58.587} className="pay-dp-banner__swoosh" />
      <img src={downpayIconSrc} alt="" width={28} height={28} />
      <Text variant="smallRegular" className="pay-dp-banner__text dp-teal">
        New payment option! Lock your ticket at {idr(amounts.upfront)}. See details
      </Text>
      <LibraryIcon name="chevronRight" size={20} color="inherit" />
    </button>
  );
}

export type CvvAlt = "A" | "B" | "C";

/** Alternative B: a grey strip that slides up from behind the bottom bar while the card's CVV is missing. */
export function CvvNudge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="pay-cvv-nudge" role="status">
      <div className="pay-cvv-nudge__strip">
        <Text variant="body2" color="lowEmphasis">
          Enter your card’s CVV to pay
        </Text>
        <img src={infoOutlineSrc} alt="" width={12} height={12} />
      </div>
    </div>
  );
}

/** "Pay N% upfront" (opens the DownPay page) and "Pay in full", side by side or stacked. */
export function DpPayButtons({
  amounts,
  disabled,
  stacked = false,
  ribbon,
  onUpfront,
  cardIncomplete,
  alt = "A",
}: {
  amounts: DpAmounts;
  disabled: boolean;
  stacked?: boolean;
  /**
   * The chosen card has no CVV yet. "disable" greys out Pay in full (Control, as production does);
   * "disable-both" greys out Pay upfront as well, with the design system's disabled state, and says
   * what is missing under the buttons (version I). Null: nothing missing.
   */
  cardIncomplete?: "disable" | "disable-both" | null;
  /** Version I's alternative: A is the helper line only; B moves the message to a nudge that slides up above the bar (see `CvvNudge`); C adds an info icon and highlights the CVV field. */
  alt?: CvvAlt;
  /** Version B's stock ribbon: it sits on the top-right corner of "Pay in full", as it does on "Pay now". */
  ribbon?: ReactNode;
  onUpfront: () => void;
}) {
  const upfrontDisabled = disabled || cardIncomplete === "disable-both";
  const color = upfrontDisabled ? "disabled" : "staticWhite";
  const fullDisabled = disabled || cardIncomplete === "disable" || cardIncomplete === "disable-both";
  return (
    <div className="pay-dp-actions" data-stacked={stacked || undefined}>
      <button type="button" className="pay-dp-pay" disabled={upfrontDisabled} onClick={onUpfront}>
        <Text variant="body2Bold" color={color}>
          Pay {DP_PERCENT}% upfront
        </Text>
        <Text variant="smallRegular" color={color}>
          {idr(amounts.upfront)}
        </Text>
      </button>
      <span className="pay-dp-full">
        {ribbon}
        <Button
          variant="primary"
          size="large"
          fullWidth
          disabled={fullDisabled}
        >
          Pay in full
        </Button>
      </span>
      {cardIncomplete === "disable-both" && alt !== "B" ? (
        <Text as="p" variant="body2" color={alt === "C" ? "lowEmphasis" : "alert"} className="pay-dp-hint" role="alert">
          {alt === "C" ? "Enter your card’s CVV to pay" : "Enter your card’s CVV to pay."}
          {alt === "C" ? <img src={infoOutlineSrc} alt="" width={12} height={12} /> : null}
        </Text>
      ) : null}
    </div>
  );
}

/** Today → before the due date → departure, joined by a line. */
function Steps({ amounts, page, children }: { amounts: DpAmounts; page: boolean; children?: ReactNode }) {
  return (
    <ol className="dp-steps" data-page={page || undefined} style={{ "--dp-line": `url(${stepLineSrc})` } as CSSProperties}>
      <li className="dp-step dp-step--today">
        <span className="dp-step__icon" aria-hidden="true">
          <img src={todayBgSrc} alt="" width={24} height={24} />
          <img src={todayIconSrc} alt="" width={14} height={14} className="dp-step__glyph" />
        </span>
        <div className="dp-step__body">
          <Text variant="body2Bold" className="dp-teal">
            Today
          </Text>
          <Text as="p" variant="body3" color="lowEmphasis">
            Pay{" "}
            <Text variant="body3Bold" className="dp-teal">
              {idr(amounts.upfront)}
            </Text>{" "}
            to secure your ticket at today’s price.
          </Text>
          {children}
        </div>
      </li>
      <li className="dp-step dp-step--due">
        <img src={dueSrc} alt="" width={24} height={24} className="dp-step__icon" />
        <div className="dp-step__body dp-step__body--tight">
          <span className="pay-row pay-row--start pay-gap-4">
            <Text variant="body3Bold">Before {DUE}</Text>
            {page ? <Text variant="smallRegular">{DUE_TIME}</Text> : null}
          </span>
          {page ? (
            <Text variant="body3" color="lowEmphasis">
              {idr(amounts.rest)}
            </Text>
          ) : (
            <Text variant="smallRegular" color="lowEmphasis">
              Final payment: {idr(amounts.rest)}
            </Text>
          )}
        </div>
      </li>
      <li className="dp-step">
        <img src={departureSrc} alt="" width={24} height={24} className="dp-step__icon" />
        <div className="dp-step__body dp-step__body--tight">
          <Text variant="body3Bold">{DEPARTURE}</Text>
          <Text variant={page ? "body3" : "smallRegular"} color="lowEmphasis">
            Your departure date
          </Text>
        </div>
      </li>
    </ol>
  );
}

/** "Your ticket will be upgraded!" and what that does to the price. */
function Upgrade({ amounts }: { amounts: DpAmounts }) {
  return (
    <div className="dp-upgrade">
      <div className="dp-upgrade__head">
        <span className="pay-row pay-row--start pay-gap-4">
          <img src={insuranceSrc} alt="" width={20} height={20} />
          <Text variant="smallBold" className="dp-teal">
            Your ticket will be upgraded!
          </Text>
        </span>
        <Text as="p" variant="smallRegular" className="dp-teal">
          It will be protected with a 100% Refund with an additional fee of {idr(amounts.fee)}.
        </Text>
      </div>
      <Text as="p" variant="smallRegular" color="lowEmphasis" className="dp-upgrade__foot">
        The price will be adjusted from {idr(amounts.before)} to {idr(amounts.after)}. The upgrade fee is non-refundable.
      </Text>
    </div>
  );
}

/**
 * A sheet over the phone (handle, cross, title), or on desktop the same content as a centred
 * dialog. Built on the page's own `.pay-sheet` styles, as the payment method sheet is.
 */
export function Sheet({
  title,
  desktop,
  onClose,
  children,
  footer,
}: {
  title: string;
  desktop: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const id = useId();
  useEscape(onClose);
  return (
    <div className="pay-sheet dp-sheet" data-desktop={desktop || undefined} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pay-sheet__stack">
        {desktop ? null : <span className="pay-sheet__handle" aria-hidden="true" />}
        <div className="pay-sheet__panel" role="dialog" aria-modal="true" aria-labelledby={id}>
          <div className="pay-sheet__header">
            <button type="button" className="pay-link" aria-label="Close" onClick={onClose} autoFocus>
              <img src={crossSrc} alt="" width={24} height={24} />
            </button>
            <Text as="h2" variant="heading3" id={id} className="dp-title">
              {title}
            </Text>
          </div>
          <div className="pay-sheet__body dp-sheet__body">{children}</div>
          {footer ? <div className="dp-sheet__footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** "See details" on the banner: how tiketDP works, no button to use it. */
function InfoSheet({ amounts, desktop, onClose }: { amounts: DpAmounts; desktop: boolean; onClose: () => void }) {
  return (
    <Sheet title="Easily & flexibly secure tickets with tiket DownPayment!" desktop={desktop} onClose={onClose}>
      <div className="dp-sheet__content">
        <Steps amounts={amounts} page={false} />
        <Upgrade amounts={amounts} />
        <Text as="p" variant="smallRegular" color="lowEmphasis">
          *Points and promo are not applicable when using tiket DownPayment.
        </Text>
      </div>
    </Sheet>
  );
}

/** 0 is full payment; otherwise the number of monthly instalments. */
export type Tenor = 0 | 3 | 6;
export const TENORS: Tenor[] = [0, 3, 6];
export const tenorLabel = (tenor: Tenor, upfront: number) => (tenor ? `${tenor} x ${idr(thousands(upfront / tenor))}` : "Full payment");
/** Figma: IDR 21,100 a month on IDR 330,000, about 6.4% of the amount; rounded to the hundred. */
const monthlyFee = (upfront: number) => Math.round((upfront * 0.064) / 100) * 100;

function InstallmentSheet({
  amounts,
  value,
  desktop,
  onPick,
  onClose,
}: {
  amounts: DpAmounts;
  value: Tenor;
  desktop: boolean;
  onPick: (tenor: Tenor) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState(value);
  return (
    <Sheet
      title="Installment"
      desktop={desktop}
      onClose={onClose}
      footer={
        <Button variant="primary" size="large" fullWidth onClick={() => onPick(picked)}>
          Ok
        </Button>
      }
    >
      <div className="dp-sheet__content">
        <p className="dp-note">
          <img src={infoSrc} alt="" width={20} height={20} />
          <Text variant="smallRegular">Tenor availability is set according to your tiket DownPayment calculation.</Text>
        </p>
        <div role="radiogroup" aria-label="Installment" className="dp-tenors">
          {TENORS.map((tenor) => (
            <div key={tenor} className="dp-tenor">
              <label className="pay-box__text dp-tenor__label" htmlFor={`dp-tenor-${tenor}`}>
                <Text variant="body2Bold">{tenorLabel(tenor, amounts.upfront)}</Text>
                {tenor ? (
                  <Text variant="body3" color="lowEmphasis">
                    Installment fee of {idr(monthlyFee(amounts.upfront))}/month
                  </Text>
                ) : null}
              </label>
              <Radio id={`dp-tenor-${tenor}`} name="dp-tenor" checked={picked === tenor} onChange={() => setPicked(tenor)} />
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

const TERMS: ReactNode[] = [
  "Using tiket DownPayment requires upgrading your ticket benefits (100% Refund), which includes an additional fee.",
  "Early settlement is allowed before the due date.",
  <>
    The order will be <span className="dp-alert">auto-cancelled</span> if the payment is not completed by the deadline.
  </>,
  "Promo codes and gift vouchers applied to payments are non-refundable.",
  "Fees for add-ons, insurance, and upgrade to tiket 100% Refund are non-refundable.",
  "The refund you receive will not include any non-refundable fees.",
];

/** "Pay N% upfront": the full DownPay page on a phone, a tall dialog on desktop. */
function DownPayPage({
  amounts,
  method,
  desktop,
  onClose,
}: {
  amounts: DpAmounts;
  method: DpMethod;
  desktop: boolean;
  onClose: () => void;
}) {
  const id = useId();
  const [tenor, setTenor] = useState<Tenor>(0);
  const [picking, setPicking] = useState(false);
  useEscape(onClose);
  return (
    <div className="dp-page" data-desktop={desktop || undefined} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dp-page__panel" role="dialog" aria-modal="true" aria-labelledby={id}>
        {/* The phone's status bar stays on top, white over the dark header, as in Figma's transparent navbar. */}
        {desktop ? null : <StatusBar platform="ios" invert dynamicIsland className="dp-page__status" />}
        <div className="dp-page__scroll">
          <div className="dp-hero" aria-hidden="true">
            <img src={heroEllipseSrc} alt="" className="dp-hero__ellipse" />
            <img src={heroSwooshSrc} alt="" className="dp-hero__swoosh" />
            <img src={heroVectorSrc} alt="" className="dp-hero__vector" />
          </div>
          <button type="button" className="dp-page__close" aria-label={desktop ? "Close" : "Back"} onClick={onClose} autoFocus>
            <img src={desktop ? crossSrc : backSrc} alt="" width={20} height={20} />
          </button>
          <div className="dp-page__title">
            {desktop ? (
              <Text variant="body2Bold" color="staticWhite">
                tiket DownPayment
              </Text>
            ) : null}
            <Text as="h2" variant="heading3" color="staticWhite" id={id} className="dp-title">
              Easily &amp; flexibly secure tickets with tiket DownPayment!
            </Text>
          </div>
          <section className="dp-page__card">
            <Steps amounts={amounts} page>
              <div className="dp-method">
                <Text variant="body3" color="lowEmphasis">
                  Payment Method
                </Text>
                <span className="dp-method__row">
                  {method.logo}
                  <span className="pay-method__text">{method.name}</span>
                </span>
                {method.card ? (
                  <div className="tds-field tds-field--select">
                    <button type="button" className="tds-field__box pay-ux__trigger" onClick={() => setPicking(true)}>
                      <span className="tds-field__content">
                        <span className="tds-field__label">Full payment/Installment</span>
                        <span className="tds-field__input">{tenorLabel(tenor, amounts.upfront)}</span>
                      </span>
                      <span className="tds-field__chevron" aria-hidden="true">
                        <LibraryIcon name="chevronDown" size={20} color="highEmphasis" />
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>
            </Steps>
            <Upgrade amounts={amounts} />
          </section>
          <section className="dp-terms">
            <Text as="h3" variant="body3Bold" color="lowEmphasis">
              Terms &amp; Conditions
            </Text>
            <ul>
              {TERMS.map((term, i) => (
                <li key={i}>
                  <Text variant="smallRegular" color="lowEmphasis">
                    {term}
                  </Text>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="dp-page__bar">
          <button type="button" className="dp-cta">
            <img src={buttonEffectSrc} alt="" className="dp-cta__effect" aria-hidden="true" />
            <Text variant="body2Bold" color="staticWhite">
              Use tiket DownPayment
            </Text>
          </button>
        </div>
      </div>
      {picking ? (
        <InstallmentSheet
          amounts={amounts}
          value={tenor}
          desktop={desktop}
          onPick={(next) => {
            setTenor(next);
            setPicking(false);
          }}
          onClose={() => setPicking(false)}
        />
      ) : null}
    </div>
  );
}

function Line({ label, value, tone, strong = false }: { label: ReactNode; value: string; tone?: "positive"; strong?: boolean }) {
  return (
    <div className="dp-line" data-strong={strong || undefined}>
      <Text variant={strong ? "body3Bold" : "body3"}>{label}</Text>
      <Text variant={strong ? "body3Bold" : "body3"} color={tone}>
        {value}
      </Text>
    </div>
  );
}

/** The bottom bar's total, opened: what the order costs and, with tiketDP, what is due when. */
function PriceSheet({
  orderCase,
  total,
  savings,
  amounts,
  desktop,
  cheapestFare,
  onClose,
}: {
  orderCase: string;
  total: number;
  savings: { label: string; amount: number }[];
  amounts: DpAmounts | null;
  desktop: boolean;
  /** Version H: the picked flight is the cheapest result of the search, so the sheet says so. */
  cheapestFare: boolean;
  onClose: () => void;
}) {
  const order = ORDER_CASES.find((c) => c.id === orderCase);
  const title = order?.title;
  const route = typeof title === "object" ? `${title.from} → ${title.to}` : (title ?? "");
  const saved = savings.reduce((sum, s) => sum + s.amount, 0);
  return (
    <Sheet title="Price Details" desktop={desktop} onClose={onClose}>
      <div className="dp-price">
        <div className="dp-price__group">
          <Text variant="body1Bold">{route}</Text>
          {cheapestFare ? (
            <div className="dp-cheapest" role="note">
              <LibraryIcon name="bestPrice" size={20} color="inherit" />
              <Text variant="body3Bold" color="positive">
                This is the cheapest fare for your route and date
              </Text>
            </div>
          ) : null}
          <div className="dp-price__box">
            <Text variant="body2Bold">Garuda Indonesia - Economy</Text>
            <hr />
            <Text variant="body3Bold">Price</Text>
            <Line label="• Adult (x1)" value={idr(total + saved)} />
          </div>
        </div>
        {amounts ? (
          <div className="dp-price__group">
            <Text variant="body3Bold">Other Add-ons</Text>
            <Line label="• Upgrade to tiket 100% Refund" value={idr(amounts.fee)} />
          </div>
        ) : null}
        <div className="dp-price__group dp-price__group--rule">
          {savings.length ? (
            <>
              <Text variant="body3Bold">Price Deduction</Text>
              {savings.map((s) => (
                <Line key={s.label} label={`• ${s.label}`} value={`- ${idr(s.amount)}`} tone="positive" />
              ))}
            </>
          ) : null}
          <Text variant="body3Bold">Other Fees</Text>
          <div className="dp-line">
            <Text variant="body3">• Tax</Text>
            <Text variant="body3" color="positive">
              Included
            </Text>
          </div>
          <Line label="• Service charge" value={idr(0)} />
          <Line label="• Transaction fee" value={idr(0)} />
        </div>
        <div className="dp-price__total">
          <Line label="Total" value={idr(amounts ? amounts.after : total)} strong />
        </div>
        {amounts ? (
          <>
            <div className="dp-price__group">
              <Text variant="body3Bold" className="dp-teal">
                tiket DownPayment
              </Text>
              <Line label={`Next bill (before ${DUE})`} value={idr(amounts.rest)} />
            </div>
            <div className="dp-price__total">
              <Line label="Current Bill" value={idr(amounts.upfront)} strong />
            </div>
          </>
        ) : null}
      </div>
    </Sheet>
  );
}

export type DpScreen = "info" | "page" | "price" | null;

/** Whichever tiketDP screen is open, over the landing page. */
export function DpScreens({
  screen,
  onClose,
  amounts,
  method,
  desktop,
  orderCase,
  total,
  savings,
  cheapestFare = false,
}: {
  screen: DpScreen;
  onClose: () => void;
  /** Null when tiketDP is off: only the price details can open then. */
  amounts: DpAmounts | null;
  method: DpMethod;
  desktop: boolean;
  orderCase: string;
  total: number;
  savings: { label: string; amount: number }[];
  cheapestFare?: boolean;
}) {
  if (screen === "price")
    return (
      <PriceSheet
        orderCase={orderCase}
        total={total}
        savings={savings}
        amounts={amounts}
        desktop={desktop}
        cheapestFare={cheapestFare}
        onClose={onClose}
      />
    );
  if (!amounts) return null;
  if (screen === "info") return <InfoSheet amounts={amounts} desktop={desktop} onClose={onClose} />;
  if (screen === "page") return <DownPayPage amounts={amounts} method={method} desktop={desktop} onClose={onClose} />;
  return null;
}
