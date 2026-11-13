import { useRef, useState } from "react";
import { Dropdown, Radio, Text, TextField } from "@tiket-ds/ui";

import { CardFields } from "./CardFields.js";
import type { DpMethod, Tenor } from "./DownPay.js";
import paylaterSrc from "../../../../../../tds library/tds icon/tds_ic_bt_paylater.svg";
// Not in `tds library/tds icon`; downloaded from the payment Figma file with the method sheet's logos.
import kredivoSrc from "./assets/methods/kredivo.png";
import klikbcaSrc from "./assets/methods/klikbca.png";
import ovoSrc from "./assets/ovo.png";
import mastercardSrc from "./assets/mastercard.png";

/**
 * Version M, "Pay buttons stay active, the field says what's missing".
 * Figma ShfdpRBPz0jMNPynprlfbM 24152:127016 (the methods and their copy) and 24184:116821 (the error
 * on the selected method). Both pay buttons are always active. A tap checks the selected method; if it
 * still needs something, nothing is paid: the page scrolls that field to the middle, focuses it, and the
 * field takes the design system's error state (red border, red helper text) saying what to do. No shake
 * and no message in the bottom bar. The error goes as soon as the field is valid or another method is picked.
 */

export type CheckMethodId = "card" | "paylater" | "kredivo" | "klikbca" | "ovo";
type Field = "method" | "cvv" | "installment" | "userId" | "balance";
export type PayKind = "upfront" | "full";

/** The demo e-wallet balance: short of both the down payment and the full amount. */
const OVO_BALANCE = 5_000_000;
const idr = (amount: number) => `IDR ${amount.toLocaleString("en-US")}`;

export const CHECK_METHODS: { id: CheckMethodId; label: string; note: string }[] = [
  { id: "card", label: "Card", note: "Saved card picked, CVV empty: a pay tap asks for the CVV" },
  { id: "paylater", label: "PayLater", note: "PayLater picked, no installment: a pay tap asks for one" },
  { id: "kredivo", label: "Kredivo", note: "Kredivo picked, no installment: a pay tap asks for one" },
  { id: "klikbca", label: "KlikBCA", note: "KlikBCA picked, User ID empty: a pay tap asks for it" },
  { id: "ovo", label: "OVO (low)", note: "Last used OVO can't pay, so nothing is picked: a pay tap asks to select a method" },
];

/** The page lists three methods (the rest are under See all): the case's own first, then the next in this order. */
const ORDER: CheckMethodId[] = ["card", "paylater", "klikbca", "kredivo"];
const listFor = (preset: CheckMethodId) => [preset, ...ORDER.filter((id) => id !== preset)].slice(0, 3);

const MESSAGES: Record<Field, string> = {
  method: "Select a payment method to continue.",
  cvv: "Enter your card’s CVV/CVC to pay.",
  installment: "Choose an installment plan to continue.",
  userId: "Enter your KlikBCA User ID to pay.",
  balance: `Your OVO balance isn’t enough. Top up or choose another method.`,
};

/** PayLater and Kredivo's plans, split from the amount paid in full. */
const PLANS = [1, 3, 6, 12] as const;
const planLabel = (months: number, total: number) =>
  months === 1 ? `Pay in 30 days · ${idr(total)}` : `${months} months · ${idr(Math.round(total / months / 1000) * 1000)}/month`;

/** The method a case opens on: the last-used OVO can't pay this order, so none is picked for it. */
const preselect = (preset: CheckMethodId) => (preset === "ovo" ? null : preset);

export function usePayCheck(preset: CheckMethodId) {
  const [method, setMethodState] = useState<CheckMethodId | null>(preselect(preset));
  const [cvv, setCvv] = useState("");
  const [tenor, setTenor] = useState<Tenor>(0);
  const [plan, setPlan] = useState("");
  const [userId, setUserId] = useState("");
  // The field the last tap stopped on; it shows as an error only while it is still missing.
  const [tried, setTried] = useState<Field | null>(null);
  const [lastPreset, setLastPreset] = useState(preset);
  const fields = useRef(new Map<Field, HTMLElement>());

  const reset = (next: CheckMethodId) => {
    setMethodState(preselect(next));
    setCvv("");
    setPlan("");
    setUserId("");
    setTried(null);
  };
  // The panel's "Pre-selected" picks the method the page opens on; a new pick starts it clean.
  if (preset !== lastPreset) {
    setLastPreset(preset);
    reset(preset);
  }

  const setMethod = (next: CheckMethodId) => {
    setMethodState(next);
    setTried(null);
  };

  /** What the selected method still needs before it can pay, if anything. Pay 25% upfront and Pay in full ask the same. */
  const missing = (): Field | null => {
    if (!method) return "method";
    if (method === "card") return cvv.length < 3 ? "cvv" : null;
    if (method === "paylater" || method === "kredivo") return plan ? null : "installment";
    if (method === "klikbca") return userId.trim() ? null : "userId";
    return "balance";
  };

  const stillMissing = (field: Field) =>
    field === "method"
      ? !method
      : field === "cvv"
        ? cvv.length < 3
        : field === "installment"
          ? !plan
          : field === "userId"
            ? !userId.trim()
            : method === "ovo";
  const error = (field: Field) => (tried === field && stillMissing(field) ? MESSAGES[field] : undefined);

  /** A pay button's tap: true when it can go on; otherwise marks the field and anchors to it. */
  // `kind` stays for the blocked-tap event the experiment asks to track; both buttons check the same.
  const attempt = (_kind: PayKind): boolean => {
    const field = missing();
    setTried(field);
    if (!field) return true;
    const el = fields.current.get(field);
    if (el) anchorTo(el);
    return false;
  };

  const register = (field: Field) => (el: HTMLElement | null) => {
    if (el) fields.current.set(field, el);
    else fields.current.delete(field);
  };

  return { methods: listFor(preset), method, setMethod, cvv, setCvv, tenor, setTenor, plan, setPlan, userId, setUserId, error, attempt, register };
}

export type PayCheck = ReturnType<typeof usePayCheck>;

/**
 * Scrolls the nearest scrolling box (the frame, not the board around it) so `el` sits in its middle, then
 * focuses it. A frame later, so the field already has its error state and its helper is read with it.
 */
function anchorTo(el: HTMLElement) {
  requestAnimationFrame(() => scrollAndFocus(el));
}

function scrollAndFocus(el: HTMLElement) {
  let box = el.parentElement;
  while (box && !(/(auto|scroll)/.test(getComputedStyle(box).overflowY) && box.scrollHeight > box.clientHeight)) {
    box = box.parentElement;
  }
  const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (box) {
    const r = el.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    box.scrollTo({ top: box.scrollTop + r.top - b.top - (box.clientHeight - r.height) / 2, behavior: smooth ? "smooth" : "auto" });
  }
  el.querySelector<HTMLElement>("input, select")?.focus({ preventScroll: true });
}

function Logo({ src, inset, desktop }: { src: string; inset: string; desktop: boolean }) {
  return (
    <span className={desktop ? "payd-logo" : "pay-logo"}>
      <span style={{ inset }}>
        <img src={src} alt="" />
      </span>
    </span>
  );
}

const LOGOS: Record<CheckMethodId, { src: string; inset: string }> = {
  card: { src: mastercardSrc, inset: "14.29% 26.83%" },
  paylater: { src: paylaterSrc, inset: "14.29% 32.14%" },
  kredivo: { src: kredivoSrc, inset: "25% 16.07% 21.43%" },
  klikbca: { src: klikbcaSrc, inset: "3.57% 23.21%" },
  ovo: { src: ovoSrc, inset: "6px 11px 7px 10px" },
};
const NAMES: Record<CheckMethodId, string> = {
  card: "BCA •••• 1098",
  paylater: "Blibli Tiket PayLater",
  kredivo: "Kredivo",
  klikbca: "KlikBCA",
  ovo: "OVO",
};

/** The method the DownPay page and price details name. */
export function checkDpMethod(check: PayCheck, desktop: boolean): DpMethod {
  // Nothing picked never reaches the DownPay page (the tap stops first); the card stands in until then.
  const id = check.method ?? "card";
  const logo = LOGOS[id];
  return {
    name: <Text variant="body3Bold">{NAMES[id]}</Text>,
    logo: <Logo src={logo.src} inset={logo.inset} desktop={desktop} />,
    card: id === "card",
  };
}

/** The selected method's own fields, under its row. */
function Below({ id, check, total }: { id: CheckMethodId; check: PayCheck; total: number }) {
  if (id === "card") {
    return (
      <CardFields
        total={total}
        tenor={check.tenor}
        onTenor={check.setTenor}
        cvv={check.cvv}
        onCvv={check.setCvv}
        cvvError={check.error("cvv")}
        cvvRef={check.register("cvv")}
      />
    );
  }
  if (id === "paylater" || id === "kredivo") {
    const err = check.error("installment");
    return (
      <div ref={check.register("installment")}>
        <Dropdown
          label="Installment"
          placeholder="Select installment"
          value={check.plan}
          onChange={(e) => check.setPlan(e.target.value)}
          error={Boolean(err)}
          helperText={err}
        >
          {PLANS.map((m) => (
            <option key={m} value={m}>
              {planLabel(m, total)}
            </option>
          ))}
        </Dropdown>
      </div>
    );
  }
  if (id === "klikbca") {
    const err = check.error("userId");
    return (
      <div ref={check.register("userId")}>
        <TextField
          label="User ID KlikBCA"
          autoComplete="username"
          value={check.userId}
          onChange={(e) => check.setUserId(e.target.value)}
          error={Boolean(err)}
          helperText={err}
        />
      </div>
    );
  }
  return null;
}

function Detail({ id, desktop }: { id: CheckMethodId; desktop: boolean }) {
  const small = desktop ? "body3" : "smallRegular";
  if (id === "card") {
    return (
      <>
        <span className="pay-row pay-row--start pay-gap-4">
          <Text variant="body3Bold">BCA •••• 1098</Text>
          <Text variant={small} color="lowEmphasis">
            (02/24)
          </Text>
        </span>
        <Text variant={small} color="lowEmphasis" lineClamp={1}>
          Credit · BCA Mastercard Tiket.com
        </Text>
      </>
    );
  }
  if (id === "paylater") {
    return (
      <>
        <Text variant="body3Bold">Blibli Tiket PayLater</Text>
        <Text variant={small} color="lowEmphasis">
          Current limit: IDR 150,000,000
        </Text>
      </>
    );
  }
  if (id === "ovo") {
    // Figma 24174:108470: the balance, then "Insufficient Balance" in red, always shown.
    return (
      <>
        <Text variant="body3Bold">OVO</Text>
        <Text variant={small} color="lowEmphasis">
          OVO Cash: {idr(OVO_BALANCE)}
        </Text>
        <Text variant={small} color="alert">
          Insufficient Balance
        </Text>
      </>
    );
  }
  return <Text variant="body3Bold">{NAMES[id]}</Text>;
}

/**
 * Version M's three payment methods, mobile or desktop: each row opens its fields once picked. With
 * nothing picked, a pay tap gives every row the error border and says to select one under the list
 * (Figma 24184:116821, "Unselected Error"), in place of that frame's bottom-bar message.
 */
export function CheckMethods({ check, total, desktop = false }: { check: PayCheck; total: number; desktop?: boolean }) {
  const balanceError = check.error("balance");
  const methodError = check.error("method");
  return (
    <div ref={check.register("method")} className={desktop ? "payd-methods" : "pay-methods"}>
      {check.methods.map((id) => {
        const selected = check.method === id;
        const inputId = `${desktop ? "d" : "m"}-check-${id}`;
        const logo = <Logo {...LOGOS[id]} desktop={desktop} />;
        const radio = <Radio id={inputId} name={`${desktop ? "d" : "m"}-check`} checked={selected} onChange={() => check.setMethod(id)} />;
        const body = (
          <label className={desktop ? "payd-method__body" : "pay-method__body"} htmlFor={inputId}>
            {logo}
            <span className="pay-method__text">
              <Detail id={id} desktop={desktop} />
            </span>
          </label>
        );
        const rowError = selected && id === "ovo" ? balanceError : undefined;
        return (
          <div
            key={id}
            ref={id === "ovo" ? check.register("balance") : undefined}
            className="pay-check"
            data-desktop={desktop || undefined}
            data-selected={selected || undefined}
            data-error={rowError || methodError ? "true" : undefined}
          >
            <div className={desktop ? "payd-method" : "pay-method"}>
              {desktop ? (
                <>
                  {radio}
                  {body}
                </>
              ) : (
                <>
                  {body}
                  {radio}
                </>
              )}
            </div>
            {selected && id !== "ovo" ? (
              <div className="pay-check__below">
                <Below id={id} check={check} total={total} />
              </div>
            ) : null}
            {rowError ? (
              <Text as="p" variant={desktop ? "body3" : "smallRegular"} color="alert" className="pay-check__helper" role="alert">
                {rowError}
              </Text>
            ) : null}
          </div>
        );
      })}
      {methodError ? (
        <Text as="p" variant={desktop ? "body3" : "smallRegular"} color="alert" role="alert">
          {methodError}
        </Text>
      ) : null}
    </div>
  );
}
