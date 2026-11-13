import { useState } from "react";
import { Accordion, Button, Divider, StatusBar, Text, TopBar } from "@tiket-ds/ui";

import { Countdown } from "../landing/Countdown.js";
import { Glyph } from "./icons.js";
import bcaLogo from "./assets/bca-logo.png";
import flightIcon from "./assets/product-flight.png";
import ovalSrc from "./assets/oval.svg";
import "./instruction.css";

const HOW_TO_PAY = [
  { id: "mbca", title: "m-BCA (BCA Mobile)" },
  { id: "ibanking", title: "Internet Banking BCA" },
  { id: "atm", title: "ATM BCA" },
];

/** Figma: Payment Instruction (Payment Design System, 585:3847), BCA Virtual Account, 360 wide. */
export function Instruction({ time, orderId = "12345678", onBack }: { time: string; orderId?: string; onBack?: () => void }) {
  const [copied, setCopied] = useState(false);
  const va = "97799 081223449451";
  const copy = () => {
    void navigator.clipboard?.writeText(va.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <TopBar
        statusBar={<StatusBar platform="ios" />}
        leading={
          <button type="button" className="pay-icon-button" aria-label="Back" onClick={onBack}>
            <Glyph name="back" />
          </button>
        }
        title="BCA Virtual Account"
        subtitle={`Order ID : ${orderId}`}
      />

      <main className="ins">
        <section className="ins-card ins-card--order">
          <div className="ins-row">
            <Text variant="body3Bold">Complete payment in</Text>
            <Countdown time={time} />
          </div>
          <Text variant="smallRegular">Sen, 17 Des 2020, 14.25 WIB</Text>
          <div className="ins-dash" role="separator" />
          <div className="ins-trip">
            <img className="ins-trip__icon" src={flightIcon} alt="" />
            <div className="ins-trip__text">
              <span className="ins-route">
                <Text variant="body3Bold">CGK</Text>
                <Glyph name="arrowRight" size={16} />
                <Text variant="body3Bold">DPS</Text>
              </span>
              <span className="ins-when">
                <Text variant="smallRegular" color="lowEmphasis">Fri, 04 Oct 2019</Text>
                <img src={ovalSrc} alt="" />
                <Text variant="smallRegular" color="lowEmphasis">12:40</Text>
              </span>
            </div>
            <span className="ins-trip__chevron">
              <Glyph name="chevronDown" size={16} />
            </span>
          </div>
        </section>

        <section className="ins-card ins-card--transfer">
          <div className="ins-block">
            <Text variant="body3Bold">Transfer to</Text>
            <div className="ins-bank">
              <span className="ins-logo">
                <img src={bcaLogo} alt="BCA" />
              </span>
              <Text variant="body3">BCA Virtual Account</Text>
            </div>
            <div className="ins-field">
              <Text variant="body1Bold">{va}</Text>
              <button type="button" className="pay-icon-button" aria-label={copied ? "Copied" : "Copy number"} onClick={copy}>
                <Glyph name="copy" size={20} color={copied ? "active" : "highEmphasis"} />
              </button>
            </div>
          </div>
          <div className="ins-block">
            <Text variant="body3Bold">Total Payment</Text>
            <div className="ins-field ins-field--total">
              <Text variant="body3Bold">IDR 17.450.000</Text>
            </div>
          </div>
          <div className="ins-attention">
            <Glyph name="information" size={24} color="alert" />
            <Text variant="smallRegular">Complete this payment before choosing a Virtual Account for your next transaction.</Text>
          </div>
          <div className="ins-check">
            <Text variant="smallRegular" color="lowEmphasis">
              Please click the button below only if you have made the payment.
            </Text>
            <Button variant="secondary" size="medium" fullWidth startIcon={<Glyph name="register" size={16} color="active" />}>
              Check the payment status
            </Button>
          </div>
        </section>

        <section className="ins-how">
          <Text as="h2" variant="body3Bold">How to Pay</Text>
          <div className="ins-how__box">
            {HOW_TO_PAY.map((item, i) => (
              <div key={item.id}>
                {i > 0 ? <Divider /> : null}
                <Accordion type="flat" title={item.title}>
                  <Text variant="smallRegular" color="lowEmphasis">
                    Steps for {item.title} are not designed yet.
                  </Text>
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        <footer className="ins-footer">
          <Text variant="smallRegular" color="lowEmphasis">
            Once your payment is verified, your e-ticket and receipt will be sent to the registered email address.
          </Text>
          <Button variant="primary" fullWidth>See order list</Button>
          <Button variant="tertiary" fullWidth>Change payment method</Button>
        </footer>
      </main>
    </>
  );
}
