import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../../shared/portal.css";

import { ResearchPage } from "../../shared/ResearchPage.js";
import { SideMenu } from "../../shared/SideMenu.js";

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

createRoot(container).render(
  <StrictMode>
    <SideMenu />
    <ResearchPage />
  </StrictMode>,
);
