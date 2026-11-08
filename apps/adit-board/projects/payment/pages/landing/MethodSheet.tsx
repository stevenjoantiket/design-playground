import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import { Text } from "@tiket-ds/ui";

import { LibraryIcon } from "../../../../design-system/icons.js";

import crossSrc from "../../../../../../tds library/tds icon/tds_ic_cross_big.svg";
import chevronRightSrc from "../../../../../../tds library/tds icon/tds_ic_chevron_right.svg";
// Not in `tds library/tds icon`; the circled arrow from the "Payment Group" design (11957:6927).
import arrowCircleSrc from "./assets/arrow-circle.svg";
// Downloaded from the payment Figma file, "Select Payment Method" (11987:5505).
import bca from "./assets/bca.png";
import mandiri from "./assets/mandiri.png";
import mastercard from "./assets/mastercard.png";
import bni from "./assets/methods/bni.png";
import briva from "./assets/methods/briva.png";
import visa from "./assets/methods/visa.png";
import amex from "./assets/methods/amex.png";
import jcb from "./assets/methods/jcb.png";
import kki from "./assets/methods/kki.png";
import atmBersama from "./assets/methods/atm-bersama.png";
import prima from "./assets/methods/prima.png";
import alto from "./assets/methods/alto.png";
import indomaret from "./assets/methods/indomaret.png";
import alfamart from "./assets/methods/alfamart.png";
import alfamidi from "./assets/methods/alfamidi.png";
import lawson from "./assets/methods/lawson.png";
import dandan from "./assets/methods/dandan.png";
import klikbca from "./assets/methods/klikbca.png";
import octo from "./assets/methods/octo.png";
import sakuku from "./assets/methods/sakuku.png";
import oneklik from "./assets/methods/oneklik.png";
import mandiriClickpay from "./assets/methods/mandiri-clickpay.png";
import bcaKlikpay from "./assets/methods/bca-klikpay.png";
import indodana from "./assets/methods/indodana.svg";
import kredivo from "./assets/methods/kredivo.png";
import akulaku from "./assets/methods/akulaku.png";
import gopay from "./assets/methods/gopay.png";
import shopeepay from "./assets/methods/shopeepay.png";
import linkaja from "./assets/methods/linkaja.png";
import blipay from "./assets/methods/blipay.svg";

/**
 * One 56 × 28 outlined tile. `inset` places the logo inside it and `img` crops a bitmap
 * that Figma draws larger than its box — both copied from the Figma layers.
 */
type Logo = { name: string; src: string; inset: string; img?: CSSProperties };

const CONTAIN: CSSProperties = { objectFit: "contain" };

/** Only Transfers has a designed intro and switch card (Figma 11957:6927); the other categories list their banks alone. */
type Section = {
  title: string;
  logos: Logo[];
  detail?: { intro: string; switchCard: { text: string; cta: string; badge: string; to: string } };
};

const SECTIONS: Section[] = [
  {
    title: "Virtual Account",
    logos: [
      { name: "BCA", src: bca, inset: "28.57% 14.29%" },
      { name: "Mandiri", src: mandiri, inset: "28.57% 16.07%" },
      { name: "BNI", src: bni, inset: "28.57% 14.29%" },
      { name: "Briva", src: briva, inset: "25% 14.29%" },
    ],
  },
  {
    title: "Credit / Debit Card",
    logos: [
      { name: "Mastercard", src: mastercard, inset: "14.29% 26.79%" },
      { name: "Visa", src: visa, inset: "28.57% 19.64%" },
      { name: "American Express", src: amex, inset: "14.29% 32.14%" },
      { name: "JCB", src: jcb, inset: "14.29% 26.79% 14.29% 25%" },
      {
        name: "Kartu Kredit Indonesia",
        src: kki,
        inset: "2px 23.21% 2px 21.43%",
        img: { position: "absolute", width: "119.35%", height: "142.07%", left: "-9.68%", top: "-21.03%" },
      },
    ],
  },
  {
    title: "ATM",
    logos: [
      { name: "ATM Bersama", src: atmBersama, inset: "14.29% 25% 14.29% 23.21%" },
      { name: "Prima", src: prima, inset: "14.29% 25%" },
      { name: "Alto", src: alto, inset: "14.29% 23.21%" },
    ],
  },
  {
    title: "Transfers",
    logos: [
      { name: "BCA", src: bca, inset: "28.57% 14.29%" },
      { name: "Mandiri", src: mandiri, inset: "28.57% 16.07%" },
      { name: "Briva", src: briva, inset: "25% 14.29%" },
      { name: "BNI", src: bni, inset: "28.57% 14.29%" },
    ],
    detail: {
      intro: "Bayar dengan transfer lewat ATM, Internet Banking, atau Mobile Banking.",
      switchCard: {
        text: "Make your payment smoother with Virtual Account.",
        cta: "Switch to Virtual Account",
        badge: "Instant Confirmation",
        to: "Virtual Account",
      },
    },
  },
  {
    title: "Retail Outlets",
    logos: [
      { name: "Indomaret", src: indomaret, inset: "28.57% 16.07% 28.57% 17.86%" },
      { name: "Alfamart", src: alfamart, inset: "28.57% 17.86% 25% 19.64%" },
      { name: "Alfamidi", src: alfamidi, inset: "28.57% 10.71% 28.57% 12.5%" },
      { name: "Lawson", src: lawson, inset: "39.29% 12.5%" },
      { name: "Dan+Dan", src: dandan, inset: "28.57% 26.79% 28.57% 28.57%" },
    ],
  },
  {
    title: "Instant Payment",
    logos: [
      { name: "KlikBCA", src: klikbca, inset: "3.57% 23.21%" },
      { name: "OCTO Clicks", src: octo, inset: "28.57% 14.29% 28.57% 12.5%" },
      { name: "Sakuku", src: sakuku, inset: "14.29% 32.14%" },
      { name: "OneKlik", src: oneklik, inset: "35.71% 14.29%" },
      { name: "Mandiri Clickpay", src: mandiriClickpay, inset: "10.71% 14.29%" },
      { name: "BCA KlikPay", src: bcaKlikpay, inset: "35.71% 14.29%" },
    ],
  },
  {
    title: "Paylater / Cicilan Tanpa Kartu",
    logos: [
      { name: "Indodana", src: indodana, inset: "14.29% 32.14%" },
      { name: "Kredivo", src: kredivo, inset: "25% 16.07% 21.43%" },
      { name: "Akulaku PayLater", src: akulaku, inset: "14.29%", img: CONTAIN },
    ],
  },
  {
    title: "E-Wallet",
    logos: [
      {
        name: "GoPay",
        src: gopay,
        inset: "32.14% 14.29%",
        img: { position: "absolute", width: "125%", height: "250%", left: "-12.5%", top: "-75%" },
      },
      { name: "ShopeePay", src: shopeepay, inset: "14.29%", img: CONTAIN },
      { name: "LinkAja", src: linkaja, inset: "14.29% 32.14%" },
      { name: "Sakuku", src: sakuku, inset: "14.29% 32.14%" },
      // Figma nests the visible mark inside a centred 48 × 12.57 box; flattened to the tile.
      { name: "blipay", src: blipay, inset: "9.42px 5.06px 8.76px 4.81px" },
    ],
  },
];

function Tile({ logo }: { logo: Logo }) {
  return (
    <span className="payd-logo" title={logo.name}>
      <span style={{ inset: logo.inset }}>
        <img src={logo.src} alt={logo.name} style={logo.img} />
      </span>
    </span>
  );
}

/** How long a sheet takes to leave. MethodSheet waits this long before unmounting; the CSS reads it as `--pay-exit`. */
const EXIT_MS = 250;
const EXIT_VAR = { "--pay-exit": `${EXIT_MS}ms` } as CSSProperties;

/** Figma "Payment Group" (11957:6927): the category's own sheet, stacked over the full list. */
function CategorySheet({
  section,
  closing,
  onBack,
  onOpen,
}: {
  section: Section;
  closing: boolean;
  onBack: () => void;
  onOpen: (title: string) => void;
}) {
  const { detail } = section;
  return (
    <div
      className="pay-sheet pay-sheet--detail"
      data-state={closing ? "closing" : undefined}
      style={EXIT_VAR}
      onClick={(event) => event.target === event.currentTarget && onBack()}
    >
      <div className="pay-sheet__stack">
        <span className="pay-sheet__handle" aria-hidden="true" />
        <div className="pay-sheet__panel pay-sheet__panel--detail" role="dialog" aria-modal="true" aria-labelledby="pay-detail-title">
          <div className="pay-sheet__header">
            <button type="button" className="pay-link" aria-label="Close" onClick={onBack} autoFocus>
              <img src={crossSrc} alt="" width={24} height={24} />
            </button>
            <Text as="h2" variant="body1Bold" id="pay-detail-title">
              {section.title}
            </Text>
          </div>
          <div className="pay-sheet__body">
            {detail ? (
              <div className="pay-detail__intro">
                <Text as="p" variant="body3" color="lowEmphasis">
                  {detail.intro}
                </Text>
                <div className="pay-switchcard">
                  <Text as="p" variant="body3" color="lowEmphasis" className="pay-switchcard__text">
                    {detail.switchCard.text}
                  </Text>
                  <button type="button" className="pay-link pay-switchcard__cta" onClick={() => onOpen(detail.switchCard.to)}>
                    <Text variant="body3Bold" color="active">
                      {detail.switchCard.cta}
                    </Text>
                    <img src={arrowCircleSrc} alt="" width={16} height={16} />
                  </button>
                  <span className="pay-switchcard__ribbon">
                    <Text variant="smallRegular" color="staticWhite">
                      {detail.switchCard.badge}
                    </Text>
                  </span>
                </div>
              </div>
            ) : null}
            <ul className="pay-banks">
              {section.logos.map((logo) => (
                <li key={logo.name}>
                  <button type="button" className="pay-bank">
                    <Tile logo={logo} />
                    <Text variant="body3Bold">{logo.name}</Text>
                    <LibraryIcon name="chevronRight" size={24} color="lowEmphasis" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Figma "Select Payment Method" (11987:5505): every method group. Tapping a group's title opens its own sheet. */
export function MethodSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [category, setCategory] = useState<string | null>(null);
  // Which sheet is playing its exit animation, if any.
  const [leaving, setLeaving] = useState<"list" | "category" | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const section = SECTIONS.find((s) => s.title === category);

  // Plays the exit animation, then does the real close. Closing the list also forgets the category.
  const leave = (which: "list" | "category") => {
    if (leaving) return;
    const done = () => {
      setLeaving(null);
      setCategory(null);
      if (which === "list") onClose();
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
    setLeaving(which);
    timer.current = window.setTimeout(done, EXIT_MS);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Escape peels one sheet at a time: the category first, then the list.
  const onEscape = useEffectEvent(() => leave(category ? "category" : "list"));
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onEscape();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="pay-sheet"
        data-state={leaving === "list" ? "closing" : undefined}
        style={EXIT_VAR}
        onClick={(event) => event.target === event.currentTarget && leave("list")}
      >
        <div className="pay-sheet__stack" data-under={category && leaving !== "category" ? "" : undefined}>
          <span className="pay-sheet__handle" aria-hidden="true" />
          <div className="pay-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="pay-sheet-title">
            <div className="pay-sheet__header">
              <button type="button" className="pay-link" aria-label="Close" onClick={() => leave("list")} autoFocus>
                <img src={crossSrc} alt="" width={24} height={24} />
              </button>
              <Text as="h2" variant="body1Bold" id="pay-sheet-title">
                Select Payment Method
              </Text>
            </div>
            <div className="pay-sheet__body">
              {SECTIONS.map((s) => (
                <section key={s.title} className="pay-sheet__group">
                  <button type="button" className="pay-sheet__title" onClick={() => setCategory(s.title)}>
                    <Text variant="body3Bold">{s.title}</Text>
                    <img src={chevronRightSrc} alt="" width={24} height={24} />
                  </button>
                  <div className="pay-sheet__logos">
                    {s.logos.map((logo) => (
                      <Tile key={logo.name} logo={logo} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
      {section ? (
        <CategorySheet
          section={section}
          closing={leaving !== null}
          onBack={() => leave("category")}
          onOpen={setCategory}
        />
      ) : null}
    </>
  );
}
