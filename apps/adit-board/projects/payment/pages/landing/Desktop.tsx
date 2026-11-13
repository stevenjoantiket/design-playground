import { useState, type ReactNode } from "react";
import { Button, ProgressStep, Radio, Text } from "@tiket-ds/ui";

import { LibraryIcon } from "../../../../design-system/icons.js";
import { Countdown } from "./Countdown.js";
import { DpBanner, DpPayButtons, type DpAmounts, type DpMethod, type DpScreen } from "./DownPay.js";
import { OrderTrip } from "./OrderCases.js";
import { StockRibbon, type RibbonTone } from "./StockRibbon.js";
import { BLIBLI_CARDS, ImportCta, type BlibliCardId } from "./BlibliCards.js";
import { BlipaySplit } from "./BlipaySplit.js";
import { CheckMethods, checkDpMethod, type PayCheck } from "./PayCheck.js";
import type { UxCase } from "../../panel/UxPanel.js";
import pointSrc from "../../../../../../tds library/tds icon/tds_ic_bt_point_fullcolor.svg";
import creditCardSrc from "../../../../../../tds library/tds icon/tds_ic_credit_card.svg";
// Not in `tds library/tds icon`; downloaded from the payment Figma file (12044:20454).
import tiketLogoSrc from "./assets/tiket-logo.svg";
import securitySrc from "./assets/security-guarantee.svg";
import ovoSrc from "./assets/ovo.png";
import mandiriSrc from "./assets/mandiri.png";

/**
 * Payment Landing Page, desktop — Figma KmlgsiVixQ8uGYW5yfhxpM, node 12044:20454.
 * Drawn at 1440; the gutters shrink with the frame so it still fits at 840.
 */

const STEPS = [{ label: "Select Method" }, { label: "Pay" }, { label: "Complete", final: true }];

type MethodId = "mandiri" | "ovo" | "card" | BlibliCardId;

function OutlineLogo({ src, inset }: { src: string; inset: string }) {
  return (
    <span className="payd-logo">
      <span style={{ inset }}>
        <img src={src} alt="" />
      </span>
    </span>
  );
}

function Method({
  id,
  selected,
  onSelect,
  logo,
  children,
}: {
  id: MethodId;
  selected: MethodId;
  onSelect: (id: MethodId) => void;
  logo: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="payd-method">
      <Radio id={`d-method-${id}`} name="d-method" checked={selected === id} onChange={() => onSelect(id)} />
      <label className="payd-method__body" htmlFor={`d-method-${id}`}>
        {logo}
        {children}
      </label>
    </div>
  );
}

export function Desktop({
  ux,
  setUx,
  time,
  stockRibbon,
  ctaShimmer,
  ctaGradient,
  blibli,
  blipayTotal,
  hideOrder,
  check = null,
  downPay,
  onDp,
}: {
  ux: UxCase;
  setUx: (next: UxCase) => void;
  time: string;
  /** Experiment "Button ribbon": red on version B, blue on its alternative B2. */
  stockRibbon: RibbonTone | null;
  /** Experiment "Animated CTA button" (version F). */
  ctaShimmer: boolean;
  /** Experiment "Change button color" (version G). */
  ctaGradient: boolean;
  /** Experiment "Import blibli card" (version E): null when off. */
  blibli: { imported: boolean; onOpen: () => void } | null;
  /** Experiment "Split Payment" (version I): the total Blipay splits, null when off. */
  blipayTotal: number | null;
  /** Experiment "Hide order summary" (version J): no order ID or trip card at the top of the summary. */
  hideOrder: boolean;
  /** Version M: the methods and the pay-tap check (PayCheck.tsx), shared with mobile; null when off. */
  check?: PayCheck | null;
  /** tiketDP amounts on a flight-only order with tiketDP on, else null. */
  downPay: DpAmounts | null;
  /** Opens a tiketDP screen (or the price details), with the method picked here. */
  onDp: (screen: DpScreen, method: DpMethod) => void;
}) {
  const [method, setMethod] = useState<MethodId>("ovo");
  const imported = Boolean(blibli?.imported);
  // Freshly imported cards are picked straight away; losing them falls back to the default.
  const [wasImported, setWasImported] = useState(imported);
  if (wasImported !== imported) {
    setWasImported(imported);
    setMethod(imported ? BLIBLI_CARDS[0].id : "ovo");
  }
  const [blipayOn, setBlipayOn] = useState(false);
  const blibliCard = BLIBLI_CARDS.find((c) => c.id === method);
  const methodName = blibliCard
    ? `${blibliCard.bank} •••• ${blibliCard.last4}`
    : method === "card"
      ? "Credit/Debit Card"
      : method === "mandiri"
        ? "Mandiri Transfer"
        : "OVO";
  const dpMethod: DpMethod = check ? checkDpMethod(check, true) : {
    name: <Text variant="body3Bold">{methodName}</Text>,
    ...(blibliCard
      ? { logo: <OutlineLogo src={blibliCard.logo} inset={blibliCard.inset} />, card: true }
      : method === "card"
        ? { logo: <OutlineLogo src={creditCardSrc} inset="14.29% 32.14%" />, card: true }
        : method === "mandiri"
          ? { logo: <OutlineLogo src={mandiriSrc} inset="28.57% 16.07%" /> }
          : { logo: <OutlineLogo src={ovoSrc} inset="6px 11px 7px 10px" /> }),
  };
  const open = (screen: DpScreen) => onDp(screen, dpMethod);

  const payNow = downPay ? (
    <DpPayButtons
      amounts={downPay}
      disabled={ux.expired}
      stacked
      ribbon={stockRibbon ? <StockRibbon orderCase={ux.orderCase} tone={stockRibbon} /> : null}
      onUpfront={() => {
        if (!check || check.attempt("upfront")) open("page");
      }}
      onFull={check ? () => check.attempt("full") : undefined}
    />
  ) : (
    <Button
      variant="primary"
      size="large"
      className="payd-pay"
      disabled={ux.expired}
      onClick={check ? () => check.attempt("full") : undefined}
    >
      Pay now
    </Button>
  );

  return (
    <>
      <header className="payd-header">
        <img src={tiketLogoSrc} alt="tiket.com" width={123} height={27} />
        <ProgressStep aria-label="Payment" current={0} steps={STEPS} />
      </header>

      <main className="payd-content">
        <div className="payd-column">
          <section className="payd-card payd-countdown">
            <Text variant="body3Bold">Complete payment in</Text>
            <Countdown time={time} />
          </section>

          <section className="payd-card">
            <div className="pay-row">
              <Text as="h2" variant="body2Bold">
                Payment Method
              </Text>
              <img src={securitySrc} alt="100% security guarantee" width={69} height={16} />
            </div>

            {check ? (
              <CheckMethods check={check} total={downPay?.before ?? 120_000_000} desktop />
            ) : (
            <div className="payd-methods">
              {blipayTotal ? (
                <BlipaySplit desktop on={blipayOn} onChange={setBlipayOn} total={blipayTotal} />
              ) : null}
              <Method
                id="mandiri"
                selected={method}
                onSelect={setMethod}
                logo={<OutlineLogo src={mandiriSrc} inset="28.57% 16.07%" />}
              >
                <Text variant="body1" color="lowEmphasis">
                  Mandiri Transfer
                </Text>
              </Method>
              <Method
                id="ovo"
                selected={method}
                onSelect={setMethod}
                // Figma crops the OVO bitmap to a 35 × 15 window; object-fit: cover does the same.
                logo={<OutlineLogo src={ovoSrc} inset="6px 11px 7px 10px" />}
              >
                <Text variant="body1Bold" color="lowEmphasis">
                  OVO
                </Text>
                <Text variant="body3" color="lowEmphasis">
                  (OVO Cash: IDR 4,000,000)
                </Text>
              </Method>
              {/* Version I lists three methods in all, Blipay first: the card moves to See all. */}
              {blipayTotal ? null : (
                <Method
                  id="card"
                  selected={method}
                  onSelect={setMethod}
                  logo={<OutlineLogo src={creditCardSrc} inset="14.29% 32.14%" />}
                >
                  <Text variant="body1" color="lowEmphasis">
                    Credit/Debit Card
                  </Text>
                </Method>
              )}
              {imported
                ? BLIBLI_CARDS.map((card) => (
                    <Method
                      key={card.id}
                      id={card.id}
                      selected={method}
                      onSelect={setMethod}
                      logo={<OutlineLogo src={card.logo} inset={card.inset} />}
                    >
                      <Text variant="body1Bold" color="lowEmphasis">
                        {card.bank} •••• {card.last4}
                      </Text>
                      <Text variant="body3" color="lowEmphasis">
                        ({card.type} · Saved on Blibli)
                      </Text>
                    </Method>
                  ))
                : null}
            </div>
            )}
            {blibli && !imported ? <ImportCta desktop onOpen={blibli.onOpen} /> : null}

            <hr className="pay-dash payd-dash" />
            <button type="button" className="pay-link pay-see-all">
              <Text variant="body1Bold" color="active">
                See all
              </Text>
              <LibraryIcon name="chevronDown" size={24} color="active" />
            </button>
          </section>
        </div>

        <aside className="payd-card payd-order">
          {hideOrder ? null : (
            <>
              <Text variant="body3Bold" color="lowEmphasis">
                Order ID: 1847987
              </Text>
              <OrderTrip id={ux.orderCase} desktop />

              <hr className="pay-dash payd-dash" />
            </>
          )}
          <Text as="h2" variant="body2Bold" color="lowEmphasis">
            You Can Save More!
          </Text>
          <label className="pay-box payd-box" htmlFor="d-promo">
            <span className="pay-benefit">
              <LibraryIcon name="discountRibbon" size={24} color="inherit" />
            </span>
            <Text variant="body2" className="payd-box__grow">
              See promos/vouchers
            </Text>
            <Radio id="d-promo" checked={ux.promo} onChange={() => {}} onClick={() => setUx({ ...ux, promo: !ux.promo })} />
          </label>
          <label className="pay-box payd-box" htmlFor="d-points">
            <img src={pointSrc} alt="" width={24} height={24} />
            <span className="pay-box__text payd-box__grow">
              <Text variant="body2">Use 1,000,000 points</Text>
              <Text variant="body3" color="lowEmphasis">
                Current points: 350,000
              </Text>
            </span>
            <Radio id="d-points" checked={ux.points} onChange={() => {}} onClick={() => setUx({ ...ux, points: !ux.points })} />
          </label>
          {downPay ? <DpBanner amounts={downPay} onOpen={() => open("info")} /> : null}

          <hr className="pay-dash payd-dash" />
          {ux.lpg ? (
            <Text variant="small" className="payd-lpg">
              Lowest Price Guarantee! Claim 2x the price gap*
            </Text>
          ) : null}
          <div
            className="payd-price"
            data-cta-shimmer={ctaShimmer || undefined}
            data-cta-gradient={ctaGradient || undefined}
          >
            <div>
              <Text as="p" variant="slashprice" color="lowEmphasis">
                IDR 999.999
              </Text>
              <button type="button" className="pay-link pay-total" onClick={() => open("price")}>
                <Text variant="body1Bold">IDR 120,000,000</Text>
                <LibraryIcon name="chevronDown" size={24} color="highEmphasis" />
              </button>
              <span className="pay-row pay-row--start pay-gap-4 pay-benefit">
                <LibraryIcon name="discountRibbon" size={16} color="inherit" />
                <Text variant="body3">Save IDR 500,000</Text>
              </span>
            </div>
            {stockRibbon && !downPay ? (
              <div className="payd-pay-col">
                <StockRibbon orderCase={ux.orderCase} tone={stockRibbon} />
                {payNow}
              </div>
            ) : (
              payNow
            )}
          </div>

          <hr className="pay-dash payd-dash" />
          <Text as="p" variant="body3" color="lowEmphasis" className="pay-center">
            Get <Text variant="body3">99,999,999</Text> blibli tiket points
          </Text>
          <Text as="p" variant="small" color="lowEmphasis">
            By clicking the pay button, you agree to the <a href="#terms">Terms &amp; Conditions</a> and the tiket.com{" "}
            <a href="#privacy">Privacy Policy</a>.
          </Text>
        </aside>
      </main>
    </>
  );
}
