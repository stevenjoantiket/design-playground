import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../../shared/portal.css";

import { MixpanelPage, type MixpanelSource } from "../../shared/MixpanelPage.js";
import { SideMenu } from "../../shared/SideMenu.js";
import { MIXPANEL, MIXPANEL_SYNC_BRIEF } from "../../projects/payment/data/mixpanel.js";
import { PRODUCT_PROJECTS } from "../../shared/projects.js";

/** The projects with a snapshot, by id. */
const SNAPSHOTS: Record<string, MixpanelSource> = {
  payment: {
    project: "payment",
    title: "Payment",
    data: MIXPANEL,
    labels: [
      { id: "returning", label: "Returning" },
      { id: "new", label: "New user" },
      { id: "savings", label: "Savings" },
    ],
    syncBrief: MIXPANEL_SYNC_BRIEF,
  },
};

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

createRoot(container).render(
  <StrictMode>
    <SideMenu />
    {/* A tab per product project; one gets its numbers once it keeps a `mixpanel-cases.json` and a sync brief. */}
    <MixpanelPage sources={PRODUCT_PROJECTS.map(({ id, title }) => SNAPSHOTS[id] ?? { project: id, title })} />
  </StrictMode>,
);
