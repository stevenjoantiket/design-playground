import { useEffect, useRef } from "react";
import { Dropdown, TextField } from "@tiket-ds/ui";

import { LibraryIcon } from "../../../../design-system/icons.js";
import { TENORS, tenorLabel, type Tenor } from "./DownPay.js";

/**
 * What opens under a chosen credit card: the installment tenor and the CVV/CVC.
 * Figma ShfdpRBPz0jMNPynprlfbM, ".Payment Method - Credit Card" 4510:38194 (its "Cicilan List").
 */
export function CardFields({
  total,
  tenor,
  onTenor,
  cvv,
  onCvv,
  highlight = false,
}: {
  /** What the order costs; the tenors split it. */
  total: number;
  tenor: Tenor;
  onTenor: (tenor: Tenor) => void;
  cvv: string;
  onCvv: (cvv: string) => void;
  /** Alternative C: whenever the CVV is required, focus the field so it is highlighted. */
  highlight?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (highlight) wrap.current?.querySelector("input")?.focus({ preventScroll: false });
  }, [highlight]);
  return (
    <>
      <Dropdown label="Full payment/Installment" value={String(tenor)} onChange={(e) => onTenor(Number(e.target.value) as Tenor)}>
        {TENORS.map((t) => (
          <option key={t} value={t}>
            {tenorLabel(t, total)}
          </option>
        ))}
      </Dropdown>
      <div ref={wrap}>
      <TextField
        label="CVV/CVC"
        type="password"
        inputMode="numeric"
        autoComplete="cc-csc"
        maxLength={3}
        value={cvv}
        onChange={(e) => onCvv(e.target.value.replace(/\D/g, ""))}
        endIcon={
          <span className="tds-field__chevron" aria-hidden="true">
            <LibraryIcon name="information" size={20} color="highEmphasis" />
          </span>
        }
      />
      </div>
    </>
  );
}
