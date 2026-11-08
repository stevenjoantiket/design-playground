import { Button, Text } from "@tiket-ds/ui";

import { LibraryIcon } from "../../../../design-system/icons.js";
import { Sheet } from "./DownPay.js";
import creditCardSrc from "../../../../../../tds library/tds icon/tds_ic_credit_card.svg";
import mastercardSrc from "./assets/mastercard.png";
import visaSrc from "./assets/methods/visa.png";

/**
 * Version E, "Import blibli card" (PRFT-264): an in-context CTA under the payment methods
 * imports the cards saved in the Blibli app, after the customer agrees once. Blibli's token
 * service stays the source of truth, so tiket shows them without a copy of its own.
 */

/** Demo cards; the real list comes from Blibli's token service. */
export const BLIBLI_CARDS = [
  { id: "blibli-1", bank: "BRI", last4: "4421", expiry: "08/28", type: "Credit", name: "BRI Visa Infinite", logo: visaSrc, inset: "28.57% 19.64%" },
  { id: "blibli-2", bank: "Mandiri", last4: "7730", expiry: "11/27", type: "Debit", name: "Mandiri Debit Mastercard", logo: mastercardSrc, inset: "14.29% 26.83%" },
] as const;

export type BlibliCardId = (typeof BLIBLI_CARDS)[number]["id"];

/** The row that starts the import. `desktop` swaps the sunken fill for the desktop card's outline. */
export function ImportCta({ desktop, onOpen }: { desktop?: boolean; onOpen: () => void }) {
  return (
    <button type="button" className="blibli-cta" data-desktop={desktop || undefined} onClick={onOpen}>
      <img src={creditCardSrc} alt="" width={24} height={24} />
      <span className="blibli-cta__text">
        <Text variant={desktop ? "body2Bold" : "body3Bold"} color="active">
          Import your Blibli saved cards
        </Text>
        <Text variant={desktop ? "body3" : "smallRegular"} color="lowEmphasis">
          Pay with a card you saved on Blibli, no typing needed
        </Text>
      </span>
      <LibraryIcon name="chevronRight" size={24} color="active" />
    </button>
  );
}

/** The one-time consent: what is shared and where, then the cards appear on both apps. */
export function ImportSheet({ desktop, onClose, onAgree }: { desktop: boolean; onClose: () => void; onAgree: () => void }) {
  return (
    <Sheet
      title="Use your Blibli saved cards on tiket.com"
      desktop={desktop}
      onClose={onClose}
      footer={
        <Button variant="primary" size="large" className="blibli-agree" onClick={onAgree}>
          Agree &amp; import cards
        </Button>
      }
    >
      <div className="dp-sheet__content">
        <Text as="p" variant="body3" color="lowEmphasis">
          tiket.com and Blibli share one card vault. Once you agree:
        </Text>
        <ul className="blibli-points">
          <li>
            <Text variant="body3">Cards saved on Blibli show up here, ready to pay.</Text>
          </li>
          <li>
            <Text variant="body3">Cards you save or remove on either app update on both.</Text>
          </li>
          <li>
            <Text variant="body3">Card numbers stay with Blibli&rsquo;s secure token service. tiket.com never stores them.</Text>
          </li>
        </ul>
        <Text as="p" variant="smallRegular" color="lowEmphasis">
          By agreeing, you accept the <a href="#terms">Saved Card Terms &amp; Conditions</a>. You can stop sharing any time in Account
          &gt; Saved Cards.
        </Text>
      </div>
    </Sheet>
  );
}
