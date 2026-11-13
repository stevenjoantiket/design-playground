import { useEffect, useState, type ReactNode } from "react";
import {
  BottomAppBar,
  Button,
  ProgressStep,
  Radio,
  StatusBar,
  Text,
  TiketProvider,
  TopBar,
} from "@tiket-ds/ui";

import { LibraryIcon } from "../../design-system/icons.js";
import { Countdown } from "./pages/landing/Countdown.js";
import { ExperimentsPage } from "../../shared/ExperimentsPage.js";
import { FigmaFiles, useFigmaLinks } from "../../shared/FigmaFiles.js";
import { PageCodeCard, PageFrame } from "../../shared/PageCode.js";
import { builtOn } from "../../shared/experiments.js";
import { ExperimentCard, PanelColumn } from "../../shared/panel.js";
import { useVersions } from "../../shared/versions.js";
import { FIGMA_LINKS, PAGES } from "./pages.js";
import { openExperiment, useHashDetail, useHashPage, useHashVersion } from "../../shared/hashPage.js";
import { isProjectPage } from "../../shared/projects.js";
import { useMenuExperiments } from "../../shared/SideMenu.js";

const PAGE_IDS = [...PAGES.map((p) => p.value), "experiments" as const];
import { Desktop } from "./pages/landing/Desktop.js";
import { CardFields } from "./pages/landing/CardFields.js";
import { CvvNudge, DpBanner, DpPayButtons, type CvvAlt, DpScreens, dpAmounts, type DpMethod, type DpScreen, type Tenor } from "./pages/landing/DownPay.js";
import { BUILT_VERSIONS, CONTROL, METRICS, buildBrief, type Version } from "./versions.js";
import { MethodSheet } from "./pages/landing/MethodSheet.js";
import { OrderTrip, RefundNudge, isFlightOrder } from "./pages/landing/OrderCases.js";
import { StockRibbon } from "./pages/landing/StockRibbon.js";
import { BLIBLI_CARDS, ImportCta, ImportSheet, type BlibliCardId } from "./pages/landing/BlibliCards.js";
import { DEFAULT_CASE, OPTIONS, UxPanel, type UxCase } from "./panel/UxPanel.js";
import pointSrc from "../../../../tds library/tds icon/tds_ic_bt_point_fullcolor.svg";
// Not in `tds library/tds icon`; downloaded from the payment Figma file (11957:6868).
import discountSrc from "./pages/landing/assets/discount-general.svg";
import mandiriSrc from "./pages/landing/assets/mandiri.png";
import mastercardSrc from "./pages/landing/assets/mastercard.png";
import bcaSrc from "./pages/landing/assets/bca.png";

const STEPS = [{ label: "Select Method" }, { label: "Payment Instruction" }, { label: "Complete" }];

const WIDTHS = ["412", "839", "840", "1440"] as const;
type Width = (typeof WIDTHS)[number];

/** A saved screen is never "expired": the payment clock restarts on load. */
const fresh = (ux: Partial<UxCase>): UxCase => ({ ...DEFAULT_CASE, ...ux, expired: false });

/** Version D: the price before promo and points. With the default promo on, the total is Control's IDR 100,000,000. */
const FULL_PRICE = 101_000_000;
/** The total the desktop layout shows. */
const DESKTOP_TOTAL = 120_000_000;
const idr = (amount: number) => `IDR ${amount.toLocaleString("en-US")}`;

const PAYMENT_WINDOW_MS = (12 * 60 + 54) * 1000;

function hhmmss(totalSeconds: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor(totalSeconds / 60) % 60)}:${pad(totalSeconds % 60)}`;
}

type MethodId = "mandiri" | "bca-cc" | "bca-va" | BlibliCardId;

function Card({ title, className, children }: { title?: string; className?: string; children: ReactNode }) {
  return (
    <section className={className ? `pay-card ${className}` : "pay-card"}>
      {title ? (
        <Text as="h2" variant="body3Bold">
          {title}
        </Text>
      ) : null}
      {children}
    </section>
  );
}

function Logo({ src, inset }: { src: string; inset: string }) {
  return (
    <span className="pay-logo">
      <span style={{ inset }}>
        <img src={src} alt="" />
      </span>
    </span>
  );
}

function MethodRow({
  id,
  logo,
  selected,
  onSelect,
  below,
  children,
}: {
  id: MethodId;
  logo: ReactNode;
  selected: MethodId;
  onSelect: (id: MethodId) => void;
  /** Fields that open under the row while it is the chosen method (a card's tenor and CVV). */
  below?: ReactNode;
  children: ReactNode;
}) {
  const row = (
    <div className="pay-method">
      <label className="pay-method__body" htmlFor={`method-${id}`}>
        {logo}
        <span className="pay-method__text">{children}</span>
      </label>
      <Radio id={`method-${id}`} name="method" checked={selected === id} onChange={() => onSelect(id)} />
    </div>
  );
  return below && selected === id ? (
    <div className="pay-method-group">
      {row}
      <div className="pay-method__below">{below}</div>
    </div>
  ) : (
    row
  );
}

export function App() {
  const [method, setMethod] = useState<MethodId>("mandiri");
  // The saved card's installment tenor and CVV, typed under it once it is the chosen method.
  const [cardTenor, setCardTenor] = useState<Tenor>(0);
  const [cvv, setCvv] = useState("");
  // Each version is its own scenario: the control, plus a copy per experiment.
  // `?embed=1&version=<id>`: just the phone, for the Experiments page (see `useVersions`).
  const {
    embed,
    params,
    versions,
    activeId,
    active,
    select,
    update,
    updateVersion,
    add,
    remove,
  } = useVersions<Version>({
    storeKey: "payment-versions",
    control: CONTROL,
    built: BUILT_VERSIONS,
    revive: (v) => ({ ...v, ux: fresh(v.ux), from: v.from && { ...v.from, ux: fresh(v.from.ux) } }),
    fork: (anchor, label, experiment) => ({ id: label, label, experiment, ux: { ...anchor.ux }, from: { label: anchor.label, ux: anchor.ux } }),
  });
  // The phone keeps its real 412 × 917 proportions: a short window scales it down (CSS `zoom` via --pay-scale) rather than squeezing its height.
  useEffect(() => {
    const fit = () => {
      const room = window.innerHeight - 24 - 24; // stage padding + the frame's own margin
      const scale = Math.max(0.5, Math.min(1, room / (917 + 24))); // 917 screen + 24 bezel
      document.documentElement.style.setProperty("--pay-scale", String(scale));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  const ux = active.ux;
  const setUx = (next: UxCase) => update((v) => ({ ...v, ux: next }));
  const [deadline, setDeadline] = useState(() => Date.now() + PAYMENT_WINDOW_MS);
  const [now, setNow] = useState(() => Date.now());
  const restartClock = () => {
    const restart = Date.now();
    setDeadline(restart + PAYMENT_WINDOW_MS);
    setNow(restart);
  };

  // Ticks once a second until the deadline, then flips the scenario to expired.
  useEffect(() => {
    if (ux.expired) return;
    const timer = setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (tick >= deadline) {
        updateVersion(activeId, (v) => ({ ...v, ux: { ...v.ux, expired: true } }));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [ux.expired, deadline, activeId, updateVersion]);

  /** Every scenario change goes through here so that leaving "expired" restarts the clock. */
  const updateUx = (next: UxCase) => {
    if (ux.expired && !next.expired) restartClock();
    setUx(next);
  };

  const selectVersion = (id: string) => {
    select(id);
    restartClock();
    setBlibliCards(false);
    if (method.startsWith("blibli")) setMethod("mandiri");
  };
  // Built versions: B adds the ribbon, C adds the banner shimmer. Each reaches only the
  // versions built on top of it, so C (built on Control) has no ribbon.
  const stockRibbon = builtOn(versions, active.id, "B");
  const bannerShimmer = builtOn(versions, active.id, "C");
  const savingsAtPay = builtOn(versions, active.id, "D");
  const blibliImport = builtOn(versions, active.id, "E");
  const ctaShimmer = builtOn(versions, active.id, "F");
  const ctaGradient = builtOn(versions, active.id, "G");
  // Version I: with the card's CVV empty both pay buttons are greyed out and a line says the CVV is missing.
  const cvvWait = builtOn(versions, active.id, "I");
  // Version I's alternatives: A (the helper line), B (a nudge slides up), C (the CVV field is highlighted). `?alt=B` opens one directly.
  const [cvvAlt, setCvvAlt] = useState<CvvAlt>(() => {
    const a = new URLSearchParams(location.search).get("alt");
    return a === "B" || a === "C" ? a : "A";
  });
  // Version J: both buttons stay active; tapping one with the card's CVV empty puts the CVV field in its error state, says what is missing, and focuses it.
  const cvvField = builtOn(versions, active.id, "J");
  const cvvEmpty = method === "bca-cc" && ux.savedCard && cvv.length < 3;
  const [cvvTried, setCvvTried] = useState(0);
  const cvvError = cvvField && cvvEmpty && cvvTried > 0 ? "Enter your card’s CVV to pay" : undefined;
  const cvvMissing = cvvWait && method === "bca-cc" && ux.savedCard && cvv.length < 3;
  // Version H: the prototype's flight stands in for the cheapest search result, so flight orders get the banner.
  const cheapestFare = builtOn(versions, active.id, "H") && isFlightOrder(ux.orderCase);
  // Version E: the Blibli cards, once imported; forgotten on a version switch so each visit starts fresh.
  const [blibliCards, setBlibliCards] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const importCards = () => {
    setBlibliCards(true);
    setImportOpen(false);
    setMethod(BLIBLI_CARDS[0].id);
  };
  // Demo amounts from the "You Can Save More!" card; one point counted as IDR 1.
  const saving = (ux.promo ? 1_000_000 : 0) + (ux.points ? 100_000 : 0);
  const total = savingsAtPay ? FULL_PRICE - saving : 100_000_000;
  // tiketDP: flight-only orders can pay 25% now and the rest later (DownPay.tsx).
  const downPay = ux.tiketDP && isFlightOrder(ux.orderCase) ? dpAmounts(total) : null;
  const [dpScreen, setDpScreen] = useState<DpScreen>(null);
  // Desktop draws its own fixed total (IDR 120,000,000) and has its own method list.
  const desktopDownPay = ux.tiketDP && isFlightOrder(ux.orderCase) ? dpAmounts(DESKTOP_TOTAL) : null;
  const [desktopMethod, setDesktopMethod] = useState<DpMethod | null>(null);
  const savings = savingsAtPay
    ? [
        ...(ux.promo ? [{ label: "Promo code", amount: 1_000_000 }] : []),
        ...(ux.points ? [{ label: "Use Blibli Tiket Points", amount: 100_000 }] : []),
      ]
    : [];
  const blibliCard = BLIBLI_CARDS.find((c) => c.id === method);
  const dpMethod: DpMethod = blibliCard
    ? {
        logo: <Logo src={blibliCard.logo} inset={blibliCard.inset} />,
        name: <Text variant="body3Bold">{`${blibliCard.bank} •••• ${blibliCard.last4}`}</Text>,
        card: true,
      }
    : method === "bca-cc" && ux.savedCard
      ? {
          logo: <Logo src={mastercardSrc} inset="14.29% 26.83%" />,
          name: <Text variant="body3Bold">BCA •••• 1098</Text>,
          card: true,
        }
      : method === "bca-va"
        ? { logo: <Logo src={bcaSrc} inset="25% 12.2% 25% 9.76%" />, name: <Text variant="body3Bold">BCA Virtual Account</Text> }
        : { logo: <Logo src={mandiriSrc} inset="28.57% 14.63% 28.57% 17.07%" />, name: <Text variant="body3Bold">Mandiri Transfer</Text> };
  const time = hhmmss(ux.expired ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000)));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [page] = useHashPage(PAGE_IDS);
  const pageLabel = PAGES.find((p) => p.value === page)?.label ?? page;
  // The version in the hash: on the flow's pages the prototype shows it (`#landing/H`, from the side
  // menu; `#landing` is Control), on the Experiments page it is the experiment shown (`#experiments/H`).
  const experimentId = useHashDetail();
  useMenuExperiments(versions, { metrics: METRICS, onAdd: add });
  // A version picked in the side menu: the hash names it, and the prototype switches to it.
  useHashVersion((id) => {
    const next = versions.some((v) => v.id === id) ? id : "control";
    if (next !== activeId) selectVersion(next);
  });
  const [links, saveLinks] = useFigmaLinks("payment", FIGMA_LINKS);
  /** The frame is the scroller, so the top bar takes Figma's Scrolling state once it has moved. */
  const [scrolled, setScrolled] = useState(false);
  // `&width=1440` in embed mode: the desktop layout, for the Experiments page's desktop preview.
  const [width, setWidth] = useState<Width>(() => WIDTHS.find((w) => embed && w === params.get("width")) ?? "412");
  const desktop = Number(width) >= 840;

  return (
    <div className="pay-layout" data-embed={embed ? "" : undefined} data-page={page}>
      {page === "experiments" ? (
        <ExperimentsPage
          project="payment"
          built={versions}
          desktopWidth="1440"
          id={experimentId}
          onSelect={openExperiment}
          metrics={METRICS}
          onAdd={add}
        />
      ) : (
      <div className="pay-stage">
        <div
          className="pay-frame"
          data-device={width === "412" ? "iphone" : undefined}
          style={{ width: `min(${width}px, 100%)` }}
          onScrollCapture={(event) => {
            const target = event.target as HTMLElement;
            if (target.classList.contains("pay")) setScrolled(target.scrollTop > 0);
          }}
        >
          <TiketProvider theme="light" platform={desktop ? "desktop" : "mobile"} className="pay">
            {page !== "landing" ? (
              <PageFrame project="payment" page={page} label={pageLabel} />
            ) : (
              // An upload can stand in for the built Landing (its Page code card's Replace), for Control only:
              // experiment versions are changes to the built code, so they keep showing it.
              <PageFrame project="payment" page={page} label={pageLabel} replace={activeId === "control"}>
                {desktop ? (
                  <Desktop
                    ux={ux}
                    setUx={updateUx}
                    time={time}
                    stockRibbon={stockRibbon}
                    ctaShimmer={ctaShimmer}
                    ctaGradient={ctaGradient}
                    blibli={blibliImport ? { imported: blibliCards, onOpen: () => setImportOpen(true) } : null}
                    downPay={desktopDownPay}
                    onDp={(screen, picked) => {
                      setDesktopMethod(picked);
                      setDpScreen(screen);
                    }}
                  />
                ) : (
                  <>
                    <TopBar
                      scrolling={scrolled}
                      statusBar={<StatusBar platform="ios" />}
                      leading={
                        <a className="pay-icon-button" href={import.meta.env.BASE_URL} aria-label="Back">
                          <LibraryIcon name="back" size={24} color="highEmphasis" />
                        </a>
                      }
                      title="Continue to Payment"
                      subtitle="Order ID : 12345678"
                    />
                    <ProgressStep aria-label="Payment" current={1} steps={STEPS} />

                    <main className="pay-content">
                      <div>
                        {ux.refund ? <RefundNudge shimmer={bannerShimmer} /> : null}
                        <Card className={ux.refund ? "pay-card--refund" : undefined}>
                          <div className="pay-row">
                            <Text variant="body3Bold">Complete payment in</Text>
                            <Countdown time={time} />
                          </div>
                          <OrderTrip id={ux.orderCase} />
                        </Card>
                      </div>

                      <Card title="Payment Method">
                        <div className="pay-methods">
                          <div className="pay-recommended">
                            <MethodRow
                              id="mandiri"
                              selected={method}
                              onSelect={setMethod}
                              logo={<Logo src={mandiriSrc} inset="28.57% 14.63% 28.57% 17.07%" />}
                            >
                              <Text variant="body3Bold">Mandiri Transfer</Text>
                            </MethodRow>
                            {ux.nudge ? (
                              <div className="pay-switch">
                                <span>
                                  <Text as="p" variant="smallRegular">
                                    Switch to Mandiri Virtual Account
                                  </Text>
                                  <Text as="p" variant="smallRegular" className="pay-benefit">
                                    Instant confirmation, no hassle!
                                  </Text>
                                </span>
                                <button type="button" className="pay-link">
                                  <Text variant="smallBold" color="active">
                                    Switch
                                  </Text>
                                </button>
                              </div>
                            ) : null}
                          </div>

                          {ux.savedCard ? (
                            <MethodRow
                              id="bca-cc"
                              selected={method}
                              onSelect={setMethod}
                              below={<CardFields total={total} tenor={cardTenor} onTenor={setCardTenor} cvv={cvv} onCvv={setCvv} highlight={cvvMissing && cvvAlt === "C"} error={cvvError} focusSignal={cvvTried} />}
                              logo={<Logo src={mastercardSrc} inset="14.29% 26.83%" />}
                            >
                              <span className="pay-row pay-row--start pay-gap-4">
                                <Text variant="body3Bold">BCA</Text>
                                <Text variant="body3Bold">•••• 1098</Text>
                                <Text variant="smallRegular" color="lowEmphasis">
                                  (02/24)
                                </Text>
                              </span>
                              <span className="pay-row pay-row--start pay-gap-4">
                                <Text variant="smallRegular" color="active">
                                  Credit
                                </Text>
                                <span className="pay-dot pay-dot--small" />
                                <Text variant="smallRegular" color="lowEmphasis" lineClamp={1}>
                                  BCA Mastercard Tiket.com
                                </Text>
                              </span>
                            </MethodRow>
                          ) : null}

                          {blibliImport && blibliCards
                            ? BLIBLI_CARDS.map((card) => (
                                <MethodRow
                                  key={card.id}
                                  id={card.id}
                                  selected={method}
                                  onSelect={setMethod}
                                  logo={<Logo src={card.logo} inset={card.inset} />}
                                >
                                  <span className="pay-row pay-row--start pay-gap-4">
                                    <Text variant="body3Bold">{card.bank}</Text>
                                    <Text variant="body3Bold">•••• {card.last4}</Text>
                                    <Text variant="smallRegular" color="lowEmphasis">
                                      ({card.expiry})
                                    </Text>
                                  </span>
                                  <span className="pay-row pay-row--start pay-gap-4">
                                    <Text variant="smallRegular" color="active">
                                      {card.type}
                                    </Text>
                                    <span className="pay-dot pay-dot--small" />
                                    <Text variant="smallRegular" color="lowEmphasis" lineClamp={1}>
                                      Saved on Blibli
                                    </Text>
                                  </span>
                                </MethodRow>
                              ))
                            : null}

                          <MethodRow
                            id="bca-va"
                            selected={method}
                            onSelect={setMethod}
                            logo={<Logo src={bcaSrc} inset="25% 12.2% 25% 9.76%" />}
                          >
                            <Text variant="body3Bold">BCA Virtual Account</Text>
                          </MethodRow>
                        </div>

                        {blibliImport && !blibliCards ? <ImportCta onOpen={() => setImportOpen(true)} /> : null}

                        <button type="button" className="pay-link pay-see-all" onClick={() => setSheetOpen(true)}>
                          <Text variant="body3Bold" color="active">
                            See all
                          </Text>
                          <LibraryIcon name="chevronDown" size={24} color="active" />
                        </button>
                      </Card>

                      <Card title="You Can Save More!">
                        {ux.promo ? (
                          <div className="pay-box">
                            <img src={discountSrc} alt="" width={20} height={20} />
                            <span className="pay-box__text pay-benefit">
                              <Text variant="body3Bold">Yay! You save IDR 1,000,000</Text>
                              <Text variant="smallRegular">PLAUOI50MEZ6XBCD</Text>
                            </span>
                            <button type="button" className="pay-link" aria-label="Remove promo" onClick={() => updateUx({ ...ux, promo: false })}>
                              <LibraryIcon name="ovalCross" size={24} color="lowEmphasis" />
                            </button>
                          </div>
                        ) : null}
                        <div className="pay-box">
                          <label className="pay-box__label" htmlFor="use-points">
                            <img src={pointSrc} alt="" width={20} height={20} />
                            <span className="pay-box__text">
                              <Text variant="body3" color={ux.points ? "highEmphasis" : "lowEmphasis"}>
                                Use 100,000 points
                              </Text>
                              <Text variant="smallRegular" color="lowEmphasis">
                                Current points: 350,000
                              </Text>
                            </span>
                          </label>
                          <Radio id="use-points" checked={ux.points} onChange={() => {}} onClick={() => updateUx({ ...ux, points: !ux.points })} />
                        </div>
                      </Card>

                      {downPay ? <DpBanner amounts={downPay} onOpen={() => setDpScreen("info")} /> : null}

                      <Text as="p" variant="smallRegular" color="lowEmphasis">
                        By clicking the pay button, you agree to the <a href="#terms">Terms &amp; Conditions</a> and the tiket.com{" "}
                        <a href="#privacy">Privacy Policy</a>.
                      </Text>
                    </main>

                    <BottomAppBar scrolling homeIndicator className="pay-bar">
                      <CvvNudge show={cvvMissing && cvvAlt === "B" && !!downPay} />
                      <div
                        className="pay-bar__inner"
                        data-cta-shimmer={ctaShimmer || undefined}
                        data-cta-gradient={ctaGradient || undefined}
                      >
                        {stockRibbon && !downPay ? (
                          <div className="pay-ribbon-row">
                            <StockRibbon orderCase={ux.orderCase} />
                          </div>
                        ) : null}
                        <div className="pay-row">
                          {savingsAtPay ? (
                            <div className="pay-total-col">
                              {saving ? (
                                <Text variant="slashprice" color="lowEmphasis">
                                  {idr(FULL_PRICE)}
                                </Text>
                              ) : null}
                              <button type="button" className="pay-link pay-total" onClick={() => setDpScreen("price")}>
                                <Text variant="body2Bold">{idr(FULL_PRICE - saving)}</Text>
                                <LibraryIcon name="chevronDown" size={20} color="highEmphasis" />
                              </button>
                              {saving ? (
                                <span className="pay-row pay-row--start pay-gap-4 pay-benefit">
                                  <LibraryIcon name="discountRibbon" size={16} color="inherit" />
                                  <Text variant="smallBold">You save {idr(saving)}</Text>
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <button type="button" className="pay-link pay-total" onClick={() => setDpScreen("price")}>
                              <Text variant="body2Bold">IDR 100,000,000</Text>
                              <LibraryIcon name="chevronDown" size={20} color="highEmphasis" />
                            </button>
                          )}
                          {downPay ? null : (
                            <Button variant="primary" size="large" className="pay-now" disabled={ux.expired}>
                              Pay now
                            </Button>
                          )}
                        </div>
                        {downPay && cvvWait ? null : <hr className="pay-dash" />}
                        {downPay ? (
                          <>
                          <DpPayButtons
                            amounts={downPay}
                            disabled={ux.expired}
                            alt={cvvAlt}
                            cardIncomplete={cvvEmpty && !cvvField ? (cvvWait ? "disable-both" : "disable") : null}
                            ribbon={stockRibbon ? <StockRibbon orderCase={ux.orderCase} /> : null}
                            onUpfront={() => (cvvField && cvvEmpty ? setCvvTried((n) => n + 1) : setDpScreen("page"))}
                            onFull={() => (cvvField && cvvEmpty ? setCvvTried((n) => n + 1) : undefined)}
                          />
                          {cvvWait ? (
                            <>
                              <hr className="pay-dash" />
                              <Text as="p" variant="smallRegular" color="lowEmphasis" className="pay-center">
                                Get <Text variant="smallBold">14,803</Text> Blibli Tiket Points
                              </Text>
                            </>
                          ) : null}
                          </>
                        ) : (
                          <Text as="p" variant="smallRegular" color="lowEmphasis" className="pay-center">
                            Get <Text variant="smallRegular">99,999,999</Text> Blibli Tiket Points
                          </Text>
                        )}
                      </div>
                    </BottomAppBar>
                  </>
                )}
              </PageFrame>
            )}
          </TiketProvider>
          {desktop || page !== "landing" ? null : <MethodSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />}
          {/* Outside the scrolling page, like the method sheet, so a sheet covers the frame. */}
          {page !== "landing" ? null : (
            <TiketProvider theme="light" platform={desktop ? "desktop" : "mobile"} className="dp-layer">
              <DpScreens
                screen={dpScreen}
                onClose={() => setDpScreen(null)}
                amounts={desktop ? desktopDownPay : downPay}
                method={desktop ? (desktopMethod ?? dpMethod) : dpMethod}
                desktop={desktop}
                orderCase={ux.orderCase}
                total={desktop ? DESKTOP_TOTAL : total}
                savings={desktop ? [] : savings}
                cheapestFare={cheapestFare}
              />
              {importOpen ? <ImportSheet desktop={desktop} onClose={() => setImportOpen(false)} onAgree={importCards} /> : null}
            </TiketProvider>
          )}
        </div>
      </div>
      )}
      {embed || isProjectPage(page) ? null : (
      <PanelColumn>
        <UxPanel
          value={ux}
          onChange={updateUx}
          widths={WIDTHS}
          width={width}
          onWidthChange={(w) => setWidth(w as Width)}
        >
          {cvvWait ? (
            <div className="alt-toggle" role="group" aria-label="Alternative">
              <span className="alt-toggle__label">Alternative</span>
              {(["A", "B", "C"] as const).map((a) => (
                <button key={a} type="button" className="alt-toggle__btn" aria-pressed={cvvAlt === a} onClick={() => setCvvAlt(a)}>
                  {a}
                </button>
              ))}
              <span className="alt-toggle__note">
                {cvvAlt === "A" ? "Both buttons grey, helper line under them" : cvvAlt === "B" ? "Nudge slides up above the bar" : "CVV field highlighted + helper with info icon"}
              </span>
            </div>
          ) : null}
          <ExperimentCard
            version={active}
            brief={buildBrief(active, OPTIONS)}
            onOpenDetail={openExperiment}
            project="payment"
            figma={{ pages: PAGES, links }}
            allVersions={versions}
            onSelect={(id) => (location.hash = `${page}/${encodeURIComponent(id)}`)}
            onRemove={remove}
            codeIds={BUILT_VERSIONS.map((v) => v.id)}
          />
          <PageCodeCard project="payment" page={page} label={pageLabel} built={page === "landing"} />
          <FigmaFiles pages={PAGES} links={links} onSave={saveLinks} />
        </UxPanel>
      </PanelColumn>
      )}
    </div>
  );
}
