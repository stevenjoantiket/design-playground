/** Each project's pages, in menu order. A page opens at `<project>/#<value>`. */
export const PAYMENT_PAGES = [
  { value: "landing", label: "Landing page" },
  { value: "instruction", label: "Instruction" },
  { value: "success", label: "Success" },
] as const;

/** FDS is the built screen (its amount detail and T&C open as sheets over it); the rest are blank until designed. */
export const INSURANCE_PAGES = [
  { value: "fds", label: "FDS" },
  { value: "delay-popup", label: "Flight Delay Popup" },
  { value: "claim", label: "Claim center" },
  { value: "booking-flight", label: "Booking form Flight" },
  { value: "booking-hotel", label: "Booking form Hotel" },
  { value: "booking-bus", label: "Booking form Bus & Shuttle" },
] as const;

/** Refund's flow, each page a shareable module in `projects/refund/pages/`: Fill in details, and the email sent once it's submitted. */
export const REFUND_PAGES = [
  { value: "fill-details", label: "Fill in details" },
  { value: "email", label: "Email" },
] as const;

/** Promo's pages; each is an empty mockup until its code is uploaded. */
export const PROMO_PAGES = [
  { value: "landing", label: "Promo Landing Page" },
] as const;

export const DESIGN_SYSTEM_PAGES = [
  { value: "style", label: "Style" },
  { value: "components", label: "Components" },
  { value: "icons", label: "Icons" },
] as const;

/**
 * Pages of the project, not screens of its flow, so they are not in its `*_PAGES`: the Experiments page, which the side menu opens out into one link per experiment.
 */
const PROJECT_PAGES = [
  { value: "experiments", label: "Experimentation" },
] as const;

/** A page of the project itself (Experimentation), where no prototype version applies. */
export const isProjectPage = (page: string) => PROJECT_PAGES.some((p) => p.value === page);

/**
 * Every project Krakatoa's board links to, in order: the board page lists them, and the side menu
 * on each project lists them with their pages. `id` is the project's key (API routes, briefs);
 * `path` is its folder and URL under the app, `projects/<id>/`; `emoji` is its icon in the side menu. A new project gets a line here
 * (see "Adding a project" in AGENTS.md).
 */
export const PROJECTS = [
  {
    id: "payment", emoji: "💳",
    path: "projects/payment/",
    title: "Payment",
    note: "Payment page prototype and its experiments",
    pages: [...PAYMENT_PAGES, ...PROJECT_PAGES],
  },
] as const;

/**
 * The product projects, everything but the design system, as `{id, title}`.
 * The pages that cover every project (Research bank, Mixpanel) list these, in this order, and only
 * these take research uploads and Mixpanel charts on the dev server.
 */
export const PRODUCT_PROJECTS = PROJECTS.filter((p) => (p.id as string) !== "design-system").map((p) => ({ id: p.id, title: p.title }));

export const isProductProject = (id: string) => PRODUCT_PROJECTS.some((p) => p.id === id);
