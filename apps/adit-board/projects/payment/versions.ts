import { buildBrief as sharedBrief, type Experiment } from "../../shared/experiments.js";
import { ORDER_CASES } from "./pages/landing/OrderCases.js";
import { DEFAULT_CASE, type Switch, type UxCase } from "./panel/UxPanel.js";

/** One screen state: the control, or a copy of it that an experiment changed. */
export interface Version {
  id: string;
  label: string;
  ux: UxCase;
  experiment?: Experiment;
  /** The version this one was copied from, as it was at that moment. */
  from?: { label: string; ux: UxCase };
}

export const CONTROL: Version = { id: "control", label: "Control", ux: DEFAULT_CASE };

/** The numbers a payment experiment can be judged on. */
export const METRICS = ["Payment conversion", "Time to pay", "Promo & points usage", "Drop-off at payment step"];

type Option = { key: Switch; label: string };


/**
 * Versions an agent has built from a brief. They are part of the code, so they are always in
 * the Versions list: they don't depend on what this browser has saved, and they come back
 * fresh from here on every load.
 *
 * When you finish building a brief, add its version here with the same label and answers the
 * brief carries (`from` is the version it builds on top of), and gate the change with
 * `builtOn(versions, active.id, label)` (from `../shared/experiments.tsx`) in `App.tsx`, so versions built on top of it get it too.
 */
export const BUILT_VERSIONS: Version[] = [
  {
    id: "B",
    label: "B",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Button ribbon",
      hypothesis: "by adding button nudges as rebon it will adding urgency to purchase",
      request: "add ribbon near the button saying thing like only x item left",
      metric: "Payment conversion",
      designer: "Adit Septian",
      detail: {
        why: "We want to add urgency at the moment of paying. Today nothing near Pay now says that availability is limited.",
        before: "Pay now stands alone in the bottom bar, beside the total.",
        after:
          "A red ribbon sits half over Pay now's top edge: “Only 3 seats left” (rooms, tickets and so on, by product). It is decoration; taps go through to the button.",
        desktop: "On desktop the same ribbon sits half over the top edge of Pay now, in the price panel on the right.",
        facts: [
          {
            claim: "The page has no urgency or availability cue near Pay now today.",
            status: "confirmed",
            evidence: "Control's bottom bar holds the total, Pay now and the points line only (Figma 11957:6925).",
          },
          {
            claim: "Remaining availability is known when the payment page loads.",
            status: "needs-data",
            evidence: "Ask the booking API team whether the order carries remaining stock per product. Without a real number the ribbon cannot ship.",
          },
          {
            claim: "People drop off between landing on this page and paying.",
            status: "needs-data",
            evidence: "Funnel from payment landing to the Pay now tap, by product. This is the baseline for payment conversion.",
          },
          {
            claim: "A scarcity message here is accurate and allowed.",
            status: "needs-data",
            evidence: "Policy or legal check. The count must be true stock; the 3 on screen is a demo value.",
          },
          {
            claim: "The ribbon does not cause payment errors or mis-taps.",
            status: "needs-data",
            evidence: "Baseline payment error rate to compare against. The ribbon is decorative and passes taps through to the button.",
          },
        ],
      },
    },
  },
  {
    id: "B2",
    label: "B2",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Button ribbon (alt 2)",
      alternativeOf: "B",
      hypothesis: "by adding button nudges as rebon it will adding urgency to purchase",
      request: "add ribbon near the button saying thing like only x item left",
      metric: "Payment conversion",
      designer: "Adit Septian",
      detail: {
        why: "Same urgency nudge as B, in blue: blue is the brand's own colour and reads as information, where red next to a payment button can read as an alarm or an error.",
        before: "Pay now stands alone in the bottom bar, beside the total.",
        after:
          "A blue ribbon sits half over Pay now's top edge: “Only 3 seats left” (rooms, tickets and so on, by product), its folded tail a darker blue. It is decoration; taps go through to the button.",
        desktop: "On desktop the same blue ribbon sits half over the top edge of Pay now, in the price panel on the right.",
        facts: [
          {
            claim: "The page has no urgency or availability cue near Pay now today.",
            status: "confirmed",
            evidence: "Control's bottom bar holds the total, Pay now and the points line only (Figma 11957:6925).",
          },
          {
            claim: "A blue ribbon exists in the design system.",
            status: "confirmed",
            evidence: "TDS Labels / 03 Ribbon ships Red, Green, Blue, Orange and Violet; Blue fills with blue/b400, the same blue as Pay now.",
          },
          {
            claim: "A blue ribbon still reads as urgent, not as a plain label.",
            status: "needs-data",
            evidence: "Payment conversion against B (red) and Control. Blue on the blue Pay now may blend in rather than stand out.",
          },
          {
            claim: "Remaining availability is known when the payment page loads.",
            status: "needs-data",
            evidence: "Ask the booking API team whether the order carries remaining stock per product. Without a real number the ribbon cannot ship.",
          },
          {
            claim: "A scarcity message here is accurate and allowed.",
            status: "needs-data",
            evidence: "Policy or legal check. The count must be true stock; the 3 on screen is a demo value.",
          },
        ],
      },
    },
  },
  {
    id: "C",
    label: "C",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Promo nudge banner shimer effect",
      hypothesis: "increase attractiveness",
      request: "the green banner should be animated",
      metric: "Payment conversion",
      designer: "Adit Septian",
      figmaDesign: "https://www.figma.com/design/rgfPtatuwpwcNHgjhdX36P/Payment-%25E2%2580%2593-Button-ribbon--Version-B-?node-id=56-2906",
      detail: {
        why: "The green refund banner carries a strong benefit, free refund and reschedule, but it is still. We want it to be noticed.",
        before: "A still green strip above the order card.",
        after: "A soft highlight sweeps across the strip, then rests, and repeats. It stays still for people who turn motion off.",
        desktop: "Desktop is unchanged: the refund strip is a mobile element, so before and after look the same.",
        facts: [
          {
            claim: "The refund and reschedule strip is the one green banner on the page, above the order card.",
            status: "confirmed",
            evidence: "Control shows “FREE refund! Reschedule allowed until 13 Dec 2023” there (Figma “Refund Reschedule Nudge”).",
          },
          {
            claim: "People do not notice the banner today.",
            status: "needs-data",
            evidence: "Viewport and tap or heatmap data on the banner, or a short usability test.",
          },
          {
            claim: "Refund and reschedule terms influence the decision to pay.",
            status: "needs-data",
            evidence: "Survey, or a funnel split between orders with and without a refundable policy.",
          },
          {
            claim: "The motion is safe for people who avoid animation.",
            status: "confirmed",
            evidence: "The sweep switches off under the system's reduced-motion setting, and the strip stays still.",
          },
          {
            claim: "The animation neither slows the page nor distracts from paying.",
            status: "needs-data",
            evidence: "Payment conversion and time to pay against Control.",
          },
        ],
      },
    },
  },
  {
    id: "D",
    label: "D",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Savings at Pay now",
      hypothesis:
        "If we show the saving from promo and points right beside Pay now, more people will pay, because they see the deal at the moment they decide.",
      request:
        "On the mobile bottom bar, show the original price crossed out above the total and a green “You save IDR …” line under it, adding up promo and points. Both update as promo and points are switched.",
      metric: "Payment conversion",
      designer: "Adit Septian",
      detail: {
        why: "The “You Can Save More!” card says “Yay! You save IDR 1,000,000”, but it sits mid-page. By the time people reach Pay now, the bottom bar shows only the total, so the saving is out of sight when they decide.",
        before: "The bottom bar shows the total and Pay now. The saving appears only inside the “You Can Save More!” card.",
        after:
          "Above the total, the original price is crossed out. Under it, a green line says “You save IDR 1,000,000”, adding IDR 100,000 more when points are on. Switching promo or points updates the total and the line; with neither on, both are gone.",
        desktop: "Desktop is unchanged: it already shows a crossed-out price and a “Save” line beside Pay now, which is what this version brings to mobile.",
        facts: [
          {
            claim: "On mobile, nothing near Pay now shows the saving today.",
            status: "confirmed",
            evidence: "Control's bottom bar holds the total, Pay now and the points line only (Figma 11957:6925).",
          },
          {
            claim: "Desktop already shows a crossed-out price and a “Save” line beside Pay now.",
            status: "confirmed",
            evidence: "Desktop design (Figma 12044:20454). So this version changes mobile only, and brings mobile in line with desktop.",
          },
          {
            claim: "The price breakdown can give the original price and each discount to the bottom bar.",
            status: "needs-data",
            evidence: "Check with the payment API team that the order carries the pre-discount price, the promo amount and the points value. The amounts on screen are demo values.",
          },
          {
            claim: "One point is worth IDR 1.",
            status: "needs-data",
            evidence: "The prototype counts 100,000 points as IDR 100,000. Confirm the conversion rate with the loyalty team.",
          },
          {
            claim: "People with a promo or points applied still drop off before paying.",
            status: "needs-data",
            evidence: "Mobile funnel from payment landing to the Pay now tap, split by orders with and without a discount applied. This is the baseline for payment conversion.",
          },
        ],
      },
    },
  },
  {
    id: "E",
    label: "E",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Import blibli card",
      hypothesis:
        "right now user need to type manually their card detail in tiket app although they already saved it in blibli app (those apps sit in same card management in server)",
      request: "allow user to fetch/import their saved card in other app to tike app",
      metric: "Time to pay",
      link: "https://borobudur.atlassian.net/browse/PRFT-264",
      figmaDesign: "https://www.figma.com/design/rgfPtatuwpwcNHgjhdX36P/Payment-%25E2%2580%2593-Button-ribbon--Version-B-?node-id=29-877",
      pic: "Radityo Shaddiqa",
      squad: "Payment",
      ticket: { status: "To Do", priority: "High", asOf: "2026-10-06" },
      detail: {
        why: "Cards saved in the Blibli app sit in the same card vault as tiket's, but on tiket people still type their card details again. Typing a 16-digit number, expiry and CVV is the slowest part of paying by card.",
        before: "The payment methods list only cards saved on tiket (BCA •••• 1098). A Blibli card has to be typed in from scratch.",
        after:
          "Under the methods, a blue “Import your Blibli saved cards” row. Tapping it opens a one-time consent sheet: what is shared, that cards sync both ways, that Blibli's token service keeps the card numbers, and the T&C. “Agree & import cards” adds the Blibli cards to the list (“Saved on Blibli”), picks the first one, and the row goes away.",
        desktop:
          "Desktop gets the same row under its payment methods; the consent opens as a centred dialog, and the imported cards join the method list, the first one picked.",
        facts: [
          {
            claim: "tiket and Blibli can share one card token, so a card saved on either app can show on both.",
            status: "needs-data",
            evidence: "PRFT-264: Blibli already has a token service; feasibility of reading it from tiket is being checked with the Blibli team (comment of 24 Sep 2026).",
          },
          {
            claim: "The entry point is an in-context CTA on the payment page, with active consent and T&C, not a prompt at app open.",
            status: "confirmed",
            evidence: "Proposed UX flow in PRFT-264's comment (24 Sep 2026); the ticket also asks for the customer's active consent before cards show at ecosystem level.",
          },
          {
            claim: "A meaningful share of tiket card payers have a card saved on Blibli.",
            status: "needs-data",
            evidence: "Overlap of tiket accounts that pay by card with accounts holding a Blibli saved card. Without that overlap the CTA reaches few people.",
          },
          {
            claim: "Typing card details is what makes card payment slow.",
            status: "needs-data",
            evidence: "Time to pay for new-card vs saved-card payments on tiket. This is the baseline for the primary metric.",
          },
          {
            claim: "Cards already saved on both apps don't show twice.",
            status: "needs-data",
            evidence: "Whether Blibli's API dedupes at import time, or tiket must match cards itself (open question in PRFT-264).",
          },
          {
            claim: "The flow stays within PCI DSS scope, since tiket keeps no copy of the token.",
            status: "needs-data",
            evidence: "PCI DSS scope review, listed as a to-do in PRFT-264.",
          },
        ],
      },
    },
  },
  {
    id: "F",
    label: "F",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Animated CTA button",
      hypothesis: "More attractive CTA brings more conversion",
      request: "CTA blue button",
      metric: "Payment conversion",
      designer: "Adit Septian",
      link: "https://borobudur.atlassian.net/browse/PDO-661",
      figmaDesign: "https://www.figma.com/design/rgfPtatuwpwcNHgjhdX36P/Payment-%25E2%2580%2593-Button-ribbon--Version-B-?node-id=39-1419",
      detail: {
        why: "The blue pay button is the last step before paying, but it is still. We want it to draw the eye so more people tap it.",
        before: "A still blue button in the bottom bar: “Pay in full” beside “Pay 25% upfront” on a tiketDP flight, “Pay now” otherwise.",
        after:
          "A soft highlight sweeps across the blue button, rests, and repeats. Only the blue button moves; it stays still when disabled (payment expired) and for people who turn motion off.",
        desktop: "Desktop gets the same sweep on the blue button in the price panel on the right.",
        facts: [
          {
            claim: "The pay button is already blue (primary) in Control.",
            status: "confirmed",
            evidence: "It is the design system's primary Button, background --tds-bg-high-blue. So this version animates it rather than recolouring it.",
          },
          {
            claim: "People who reach the bottom bar hesitate before tapping the pay button.",
            status: "needs-data",
            evidence: "Funnel from payment landing to the pay button tap, and time between landing and the tap. This is the baseline for payment conversion.",
          },
          {
            claim: "The motion is safe for people who avoid animation.",
            status: "confirmed",
            evidence: "The sweep switches off under the system's reduced-motion setting, and on a disabled button.",
          },
          {
            claim: "The animation does not cause mis-taps or payment errors.",
            status: "needs-data",
            evidence: "Payment error rate and accidental taps on “Pay in full” vs “Pay 25% upfront” against Control.",
          },
        ],
      },
    },
  },
  {
    id: "G",
    label: "G",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "change button color",
      hypothesis: "if we change the button color to gradient it will increase the CTR",
      request: "CTA button",
      metric: "Payment conversion",
      designer: "Adit Septian",
      link: "https://borobudur.atlassian.net/sample",
      figmaDesign: "https://www.figma.com/design/rgfPtatuwpwcNHgjhdX36P/Payment-%25E2%2580%2593-Button-ribbon--Version-B-?node-id=44-2161",
      detail: {
        why: "The pay button is the last step before paying, and it is a flat blue like every other primary button. We want it to stand out so more people tap it.",
        before: "A flat blue button in the bottom bar: “Pay in full” beside “Pay 25% upfront” on a tiketDP flight, “Pay now” otherwise.",
        after:
          "The same button in the design system's Blue gradient, blue on the left to cyan on the right. Pressed, it turns the usual pressed blue; disabled (payment expired) it stays grey. Only the blue pay button changes.",
        desktop: "Desktop gets the same gradient on the blue pay button in the price panel on the right.",
        facts: [
          {
            claim: "The gradient is one the design system already has.",
            status: "confirmed",
            evidence: "Gradient GB “Blue”, #007BFF to #00C1EB, in docs/DESIGN-SYSTEM.md; the button uses --tds-gradient-blue, no new value.",
          },
          {
            claim: "White text on the gradient is harder to read than on Control's blue.",
            status: "confirmed",
            evidence: "White on Control's blue (#007CFF) is 3.9:1. On the gradient it falls to about 2.9:1 at the centre, where the label sits, and 2.1:1 at the right edge. Ask design whether that is acceptable before shipping.",
          },
          {
            claim: "People who reach the bottom bar hesitate before tapping the pay button.",
            status: "needs-data",
            evidence: "Funnel from payment landing to the pay button tap. This is the baseline for the CTR and payment conversion.",
          },
          {
            claim: "A gradient pay button raises taps elsewhere in tiket.",
            status: "needs-data",
            evidence: "Results of past button colour tests, if any. The Atlassian link on the brief (borobudur.atlassian.net/sample) points at no issue or page.",
          },
        ],
      },
    },
  },
  {
    id: "H",
    label: "H",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Cheapest Fare Banner in Price Detail",
      hypothesis:
        "We hypothesize that showing a “cheapest fare” banner in the flight price detail breakdown will increase price detail to purchase conversion rate, because users who see proof that their fare is the cheapest are more confident to finish the booking.",
      request:
        "B: Treatment (cheapest fare banner). The price detail breakdown shows a “cheapest fare” banner, for example “This is the cheapest fare for your route and date”. The banner shows only when the selected flight is the cheapest result in the user's search; otherwise the user sees the same view as control.",
      metric: "Payment conversion",
      designer: "Adit Septian",
      link: "https://borobudur.atlassian.net/wiki/spaces/AE/pages/4971627033/TESTING+EDD+FLIGHT+Cheapest+Fare+Banner+in+Price+Detail",
      figmaDesign: "https://www.figma.com/design/rgfPtatuwpwcNHgjhdX36P/Payment-%25E2%2580%2593-Button-ribbon--Version-B-?node-id=60-3471",
      detail: {
        why: "About 37.5k flight users opened the price detail breakdown in 4 weeks, and only about 19.9% purchased within a day. The breakdown shows the numbers only; it doesn't say how this fare compares with the rest of the search, so people go back to compare.",
        before: "Price Details lists the route, the fare, deductions, fees and the total, with no word on how the fare compares.",
        after:
          "Under the route, a green banner with the best-price icon: “This is the cheapest fare for your route and date”. It shows on flight orders only, standing in for “the picked flight is the cheapest result”; any other order sees Control's sheet.",
        desktop: "Desktop gets the same banner in the Price Details dialog, opened from the total in the price panel.",
        facts: [
          {
            claim: "Price detail today shows no comparison with other results in the search.",
            status: "confirmed",
            evidence: "Control's Price Details sheet holds the route, fare, deductions, fees and total only. The EDD says the same of production.",
          },
          {
            claim: "Baseline price detail to purchase conversion is 19.92%.",
            status: "confirmed",
            evidence: "EDD pre-analysis: Mixpanel funnel viewPriceDetail → purchase, flight, 1-day window, 06 Sep to 03 Oct 2026.",
          },
          {
            claim: "The payment flow knows whether the picked flight is the cheapest result of the user's search, after sorts, filters and price changes.",
            status: "needs-data",
            evidence: "Ask the flight search team whether the cheapest-result flag can travel with the booking to price detail. A wrong “cheapest” claim hurts trust (EDD notes). The prototype assumes it is true for every flight order.",
          },
          {
            claim: "A large enough share of price detail viewers picked the cheapest result for the banner to move the metric.",
            status: "needs-data",
            evidence: "Share of viewPriceDetail (flight) where the selected flight was the cheapest result. Only they see the banner, so the MDE of 5.8% applies to a smaller group.",
          },
          {
            claim: "Doubt about the price is why people leave price detail.",
            status: "needs-data",
            evidence: "Share of users who go back to search results after price detail, or a short survey. The EDD states it as the problem but cites no data.",
          },
          {
            claim: "The banner doesn't clash with other banners on the page.",
            status: "confirmed",
            evidence: "It sits inside the Price Details sheet, apart from the tiketDP and refund banners on the page behind it. Insurance banners are not in this prototype.",
          },
        ],
      },
      plan: {
        summary:
          "Some flight users open the price detail breakdown and then leave before they pay. We'd like to show a “cheapest fare” banner inside the price detail breakdown, only when the selected flight is the cheapest result for that search. Half of users see the banner and half do not; we compare how many of them go on to purchase. The goal is to raise price detail to purchase conversion.",
        period: "4 weeks",
        objective:
          "We'd like to show a “cheapest fare” banner in the flight price detail breakdown when the selected flight is the cheapest result in the user's search. This experiment aims to validate whether that message helps more users who open price detail go on to purchase.",
        type: "A/B Test (User-based Splitting, using Mixpanel)",
        problem: "Users who open the flight price detail breakdown drop off before purchase because they are not sure the price is good.",
        because: "Users who see proof that their fare is the cheapest are more confident to finish the booking.",
        metrics: [
          {
            name: "Price detail to purchase conversion rate",
            definition:
              "Unique users who trigger purchase (vertical = flight) within 1 day, divided by unique users who trigger viewPriceDetail (vertical = flight)",
            events: "viewPriceDetail, purchase (vertical)",
          },
        ],
        targeting: {
          where: [
            "B2C only, on app (Android and iOS) and web. B2B Corporate, B2B API, and B2B Online Non-API (including Metasearch) are excluded.",
            "All flight routes: domestic and international, one-way and round-trip.",
          ],
          who: "All B2C flight users who open the price detail breakdown. The banner only shows when the selected flight is the cheapest result in their search.",
          traffic: "100% traffic, split by user, 50% control vs 50% treatment.",
        },
        split: { control: "50%", treatment: "50%" },
        timeline: [
          {
            phase: "Preparation Phase",
            when: "Week 0",
            items: ["Explore experiment design: A/B splitting logic, metrics, experiments schema", "Banner setup and testing on app and web"],
          },
          { phase: "Execution Phase", when: "Week 1 to Week 4: TBD" },
          { phase: "Analysis Phase", when: "TBD" },
        ],
        preAnalysis: {
          mde: "5.8%",
          sampleSize: "18,884 per variant (Evan Miller calculator)",
          sampleSizeLink: "https://www.evanmiller.org/ab-testing/sample-size.html#!19.91633;80;5;5.8;1",
          baseline:
            "19.92% (Mixpanel, viewPriceDetail to purchase, flight, 1-day window, 06 Sep 2026 to 03 Oct 2026)",
          baselineLink: "https://mixpanel.com/project/3965186/view/4460945/app/insights#smVGndg4n3xA",
          alpha: "5% (significance 95%)",
          power: "80% (β = 20%)",
        },
        notes: [
          "The banner must not show when the selected flight is not the cheapest result, including after the user sorts, filters, or the price changes. A wrong “cheapest” claim hurts user trust.",
          "Check that the banner does not clash with other banners on the same page, such as the insurance and downpay banners.",
          "The 4-week sample needs all eligible traffic (100%), so no other experiment should take users out of this page during the test.",
        ],
      },
    },
  },
  {
    id: "I",
    label: "I",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Split Payment (Blipay + Any payment method)",
      hypothesis:
        "some user got their money refunded instantly to their Blipay account, but if the user wants to purchase higher product amount they cant use Blipay due to insulficient balance",
      request: "allow user to select Blipay method eventhough their balance is insulfficient and alow user to combine with other method",
      metric: "Payment conversion",
      designer: "Adit Septian",
      figmaDesign: "https://www.figma.com/design/rgfPtatuwpwcNHgjhdX36P/Payment-%25E2%2580%2593-Button-ribbon--Version-B-?node-id=69-3705",
      detail: {
        why: "Instant refunds land in Blipay, so many people hold a Blipay balance. When the order costs more than that balance, Blipay can't be picked, so the refunded money sits unused and the whole amount has to come from another method.",
        before: "The payment methods list has no usable Blipay: with a balance short of the total, it can't be picked or combined with anything.",
        after:
          "Blipay sits first in the payment methods with its balance (IDR 2,500,000), a radio button and a hint: “Not enough for this order? Use it and pay the rest with another method.” The list shows three methods in all (Blipay, Mandiri Transfer, the saved BCA card; the rest under See all). Picked, Blipay stays on top with a small yellow note, “Not enough balance, combine with another method.”, then a divider and “Combine with: Pays the remaining IDR 97,500,000” over the other two methods, whose pick pays the rest. Tapping Blipay's radio again unpicks it.",
        desktop:
          "Desktop gets the same Blipay row and section at the top of its payment methods, splitting its IDR 120,000,000 total with the method picked (OVO by default).",
        facts: [
          {
            claim: "Instant refunds are paid into Blipay.",
            status: "needs-data",
            evidence: "Share of refunds paid out to Blipay, and how many of those people hold that balance when they next book. The brief states it; no data is linked.",
          },
          {
            claim: "Today Blipay can't be picked when its balance is short of the total.",
            status: "needs-data",
            evidence: "The brief states it. Confirm with the payment team how production shows Blipay then (hidden or disabled); this prototype's Control has no Blipay row on the landing page.",
          },
          {
            claim: "Many Blipay holders have a balance below their order total.",
            status: "needs-data",
            evidence: "Distribution of Blipay balance against order total at the payment page. Only they see the split, so this sizes the experiment.",
          },
          {
            claim: "The payment backend can charge one order to Blipay and a second method, and refund both.",
            status: "needs-data",
            evidence: "Ask the payment API team whether split charges exist, which methods can pair with Blipay (VA, cards, other e-wallets), and what happens if the second payment fails or expires.",
          },
          {
            claim: "The balance and amounts shown are real.",
            status: "needs-data",
            evidence: "The prototype's balance (IDR 2,500,000) is a demo value; the real one comes from the Blipay wallet API.",
          },
        ],
      },
    },
  },
  {
    id: "J",
    label: "J",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Hide order summary",
      hypothesis: "if we hide order sumary CVR more likely to be higer",
      request: "no order summary but keep the countdown",
      metric: "Payment conversion",
      designer: "Adit Septian",
      detail: {
        why: "By the payment page the order is already chosen. Repeating it in a card at the top pushes the payment methods down and gives one more thing to read before paying.",
        before: "The first card shows “Complete payment in” with the countdown, then the order card under it (for a one-way flight: Jakarta → Hong Kong, Sun, 10 Oct 2022 · 12:40).",
        after:
          "The first card keeps only “Complete payment in” and the countdown; the order card is gone, so Payment Method moves up. The order ID stays in the top bar.",
        desktop:
          "Desktop drops the order ID, the order card and the divider under them from the top of the summary column, which now starts at “You Can Save More!”. The countdown card on the left stays.",
        facts: [
          {
            claim: "Users don't need the order details on the payment page to pay.",
            status: "needs-data",
            evidence: "Taps on the order card or back from the payment page, and replays of people checking the order before paying. The brief states the hypothesis; no data is linked.",
          },
          {
            claim: "A shorter page before the payment methods lifts payment conversion.",
            status: "needs-data",
            evidence: "Payment conversion split by whether the payment methods are above the fold on arrival; the experiment itself answers this.",
          },
          {
            claim: "The countdown alone still tells people how long they have.",
            status: "confirmed",
            evidence: "The countdown card is unchanged in this version, on mobile and desktop.",
          },
        ],
      },
    },
  },
  {
    id: "K",
    label: "K",
    ux: DEFAULT_CASE,
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Turqois color nudge",
      hypothesis: "cgange nudges color for new standarization",
      request: "all nudges color Turqois color nudge",
      metric: "Time to pay",
      detail: {
        why: "The payment page's nudges each use their own colour (green for refund, light blue for switching method, blue for the method sheet's flag, violet for the price guarantee). One turquoise for all of them makes a nudge read as a nudge, in line with the design system's USP colour.",
        before:
          "The FREE refund strip and the order card's border are green, the “Switch to Mandiri Virtual Account” nudge sits on light blue with its benefit line in green, and the method sheet's switch card has a blue flag.",
        after:
          "The refund strip is soft turquoise (T100 with turquoise text, no outline on the order card), the switch-method nudge sits on light turquoise (T100) with its benefit line in turquoise, and the method sheet's flag is turquoise. Links and the pay button stay blue; the green promo and savings lines stay green.",
        desktop: "The “Lowest Price Guarantee! Claim 2x the price gap*” label above the price turns from the violet gradient to solid turquoise (T500).",
        facts: [
          {
            claim: "Turquoise is the design system's colour for USPs and nudges.",
            status: "confirmed",
            evidence: "The tokens give `bg-high-turquoise`/`bg-low-turquoise` (T500/T100) for buttons and labels, and the `usp` text, icon and stroke tokens are T500.",
          },
          {
            claim: "One nudge colour makes nudges quicker to recognise, so people pay sooner.",
            status: "needs-data",
            evidence: "Time to pay, Control against K; the brief states the hypothesis and links no data.",
          },
          {
            claim: "The turquoise nudges are as readable as the ones they replace.",
            status: "needs-data",
            evidence: "White 12px text on T500 and T500 text on T100 come in under 4.5:1 contrast; worth a check with design before launch.",
          },
        ],
      },
    },
  },
  {
    id: "L",
    label: "L",
    ux: { ...DEFAULT_CASE, tiketDP: true },
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Both pay buttons wait for the CVV",
      hypothesis:
        "Greying out both Pay 25% upfront and Pay in full until the card's CVV is typed, and saying what is missing, shows that the form comes first, so people stop reading a single active button as the only way to pay.",
      request:
        "On a tiketDP flight with a card chosen and the CVV empty, grey out both buttons with the design system's disabled state and say “Enter your card's CVV to pay” under them. They turn blue as soon as a 3-digit CVV is typed.",
      metric: "Payment conversion",
      link: "https://github.com/aditseptian-tiket/Design-Exp/issues/5",
      detail: {
        why: "A public post says tiket.com offered only a 25% DP: with a card chosen and no CVV typed, Pay in full was greyed out beside an active DP button, and the customer took DP to be the only option. If both wait for the CVV, and the screen says why, neither looks like the one allowed choice.",
        before: "With a card chosen and the CVV empty, Pay in full is greyed out and Pay 25% upfront looks like the only way to pay.",
        after:
          "Both buttons use the disabled state until a 3-digit CVV is typed, with “Enter your card's CVV to pay” under them. To see it: turn on tiketDP and Saved credit card, then pick the saved card and leave its CVV empty.",
        facts: [
          {
            claim: "Control greys out Pay in full only, while Pay 25% upfront stays active.",
            status: "needs-data",
            evidence: "Taken from the post and the team's account of production. Confirm on production.",
          },
          {
            claim: "The post's customer left because Pay in full looked unavailable.",
            status: "needs-data",
            evidence: "One public post. Check support tickets and drop-off of tiketDP flight orders on card with an empty CVV.",
          },
          {
            claim: "The down payment is 25%.",
            status: "confirmed",
            evidence: "The post and the OPRP-151 PRD both say 25%; the prototype takes 25% of the total (DP_PERCENT in DownPay.tsx).",
          },
        ],
      },
    },
  },
  {
    id: "M",
    label: "M",
    ux: { ...DEFAULT_CASE, tiketDP: true },
    from: { label: "Control", ux: DEFAULT_CASE },
    experiment: {
      name: "Pay buttons stay active, the field says what's missing",
      hypothesis:
        "If both pay buttons are always active and a tap points to the one field still missing (CVV, installment, KlikBCA User ID) or to the selected method that can't pay, people see they can pay either way and what to do next, instead of reading a greyed-out button, or a red line in the bottom bar, as an error they already made.",
      request:
        "Keep Pay 25% upfront and Pay in full active, both checking the same rules. On tap, if the selected method needs something, don't pay: scroll to that field, focus it and give it the design system's error state with helper text that says what to do; if nothing is missing, Pay 25% upfront opens the DownPay page. No shake, no message in the bottom bar. Covers the saved card's CVV, Blibli Tiket PayLater and Kredivo's installment, KlikBCA's User ID, and a last-used e-wallet whose balance is too low, which is listed first but not picked, so the tap asks to select a method. Three methods on the page. Mobile and desktop.",
      metric: "Payment conversion",
      designer: "Steven Joan",
      figmaDesign: "https://www.figma.com/design/8D12Psjg8yoYDgKTa8iJm9/branch/ShfdpRBPz0jMNPynprlfbM/-SSOT--Tiket-DownPayment?node-id=24152-127016",
      detail: {
        why: "Version L greys out both buttons until the CVV is typed and says so in the bottom bar. Stakeholders found that a red line in the bar reads as an error the user has already made, and a greyed-out button still hides that both ways to pay exist. Leaving the buttons active and pointing at the field only when it matters keeps both choices visible and puts the instruction where the fix is.",
        before:
          "With a card chosen and the CVV empty, Pay in full is greyed out (Control) or both are greyed out with “Enter your card's CVV/CVC to pay.” in the bottom bar (L). The Other cases frame does the same for PayLater, Kredivo and KlikBCA.",
        after:
          "The Payment Method card lists three methods, the case's own first (the rest under See all), and both pay buttons stay blue. Either tap runs the same check. If something is missing, it scrolls the field to the middle of the screen, focuses it and turns it red with its helper: “Enter your card's CVV/CVC to pay.”, “Choose an installment plan to continue.” (PayLater, Kredivo) or “Enter your KlikBCA User ID to pay.”; otherwise Pay 25% upfront opens the DownPay page. When the last-used method is OVO and its IDR 5,000,000 can't pay, OVO sits first with “Insufficient Balance” in red under its balance and nothing is picked: a tap puts the error border on every method and says “Select a payment method to continue.” under them. The error goes once the field is valid or a method is picked. In the side panel, “Pre-selected” switches between the cases.",
        desktop:
          "Desktop's Payment Method card lists the same three methods with the radio first, the picked one's field under it, and the same check on Pay 25% upfront and Pay in full in the summary column.",
        facts: [
          {
            claim: "An error shown in the bottom bar before any tap reads as a mistake already made.",
            status: "needs-data",
            evidence: "Stakeholder review of version L's design. Worth a quick usability check against L.",
          },
          {
            claim: "A last-used e-wallet whose balance is short of the order can't be pre-selected, so the page opens with nothing picked.",
            status: "needs-data",
            evidence: "The designer's example (Figma 24174:108470). Check how often the last-used method can't pay this order.",
          },
          {
            claim: "Active buttons raise pay taps that are then blocked.",
            status: "needs-data",
            evidence: "Track a blocked-tap event with its reason (cvv, installment, klikbca_id, balance) so conversion compares fairly with Control and L.",
          },
        ],
      },
    },
  },
];

/** Payment's brief: the shared skeleton, with the payment switches as the starting point. */
export function buildBrief(version: Version, options: Option[]): string {
  const ux = version.from?.ux ?? version.ux;
  return sharedBrief(version, {
    screen: "Payment screen",
    scenario: [
      ...options.map((o) => `- ${o.label}: ${ux[o.key] ? "on" : "off"}`),
      `- Order card: ${ORDER_CASES.find((c) => c.id === ux.orderCase)?.label ?? ux.orderCase}`,
    ],
    where: [
      "- Code lives in `apps/adit-board/projects/payment/`: `App.tsx` (mobile), `Desktop.tsx` (desktop, 840px and up), `OrderCases.tsx` (order card), `UxPanel.tsx` (switches), `versions.ts` (versions and this brief).",
    ],
    cover: "- Cover mobile (412, 839) and desktop (840, 1440) unless the request says otherwise.",
    check: "412 and 1440",
  });
}
