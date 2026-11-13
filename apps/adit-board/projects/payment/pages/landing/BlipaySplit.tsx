import { Radio, Text } from "@tiket-ds/ui";

// Downloaded from the payment Figma file, "Select Payment Method" (11987:5505), as in MethodSheet.
import blipaySrc from "./assets/methods/blipay.svg";

/**
 * Version I, "Split Payment": Blipay stays usable when its balance is short of the total. Picked
 * (its radio, which a second tap unpicks, like the points one), it stays on top with a short note
 * that the balance falls short, then a divider and "Combine with": the methods listed below it,
 * whose pick pays the rest. The list keeps its own pick and, with Blipay, shows three methods in all.
 */

/** Demo balance, short of every total the prototype shows. */
export const BLIPAY_BALANCE = 2_500_000;

const idr = (amount: number) => `IDR ${amount.toLocaleString("en-US")}`;

export function BlipaySplit({
  desktop,
  on,
  onChange,
  total,
}: {
  desktop?: boolean;
  on: boolean;
  onChange: (on: boolean) => void;
  total: number;
}) {
  const id = desktop ? "d-blipay" : "blipay";
  const small = desktop ? "body3" : "smallRegular";
  const radio = <Radio id={id} name={id} checked={on} onChange={() => {}} onClick={() => onChange(!on)} />;
  return (
    <>
      <div className="blipay" data-desktop={desktop || undefined}>
        <div className="blipay__row">
          {desktop ? radio : null}
          <label className={desktop ? "payd-method__body" : "pay-method__body"} htmlFor={id}>
            {/* Figma's 56 × 28 tile insets (MethodSheet), as percentages so the mobile 41 × 21 tile scales them. */}
            <span className={desktop ? "payd-logo" : "pay-logo"}>
              <span style={{ inset: "33.64% 9.04% 31.29% 8.59%" }}>
                <img src={blipaySrc} alt="" />
              </span>
            </span>
            <span className="pay-method__text">
              <Text variant={desktop ? "body1Bold" : "body3Bold"}>Blipay</Text>
              <Text variant={small} color="lowEmphasis">
                Balance: {idr(BLIPAY_BALANCE)}
              </Text>
            </span>
          </label>
          {desktop ? null : radio}
        </div>
        {on ? (
          <Text as="p" variant={small} className="blipay__note" role="status">
            Not enough balance, combine with another method.
          </Text>
        ) : (
          <Text as="p" variant={small} color="lowEmphasis">
            Not enough for this order? Use it and pay the rest with another method.
          </Text>
        )}
      </div>
      {on ? (
        <>
          <hr className="blipay__divider" />
          <div className="blipay__combine">
            <Text variant={desktop ? "body2Bold" : "body3Bold"}>Combine with</Text>
            <Text variant={small} color="lowEmphasis">
              Pays the remaining {idr(total - BLIPAY_BALANCE)}
            </Text>
          </div>
        </>
      ) : null}
    </>
  );
}
