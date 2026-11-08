import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./portal.css";

import { PROJECTS } from "./projects.js";
import { SideMenu } from "./SideMenu.js";

/**
 * The page of a project with no pages yet (Pricing, Promo, Paylater, Refund): the side menu and
 * its name. Each project's `index.html` loads this; it finds the project from the URL. Once the
 * project gets screens, it gets its own `App.tsx` (see "Adding a project" in AGENTS.md).
 */
const project = PROJECTS.find((p) => location.pathname.startsWith(`${import.meta.env.BASE_URL}${p.path}`));

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

createRoot(container).render(
  <StrictMode>
    <SideMenu />
    <main className="p-main portal">
      <section className="p-card">
        <h1 className="p-h1">{project?.title ?? "Project"}</h1>
        <p className="p-muted">No pages yet.</p>
      </section>
    </main>
  </StrictMode>,
);
