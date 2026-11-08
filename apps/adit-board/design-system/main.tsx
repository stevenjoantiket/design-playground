import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@tiket-ds/fonts/fonts.css";
import "@tiket-ds/tokens/tokens.css";
import "@tiket-ds/ui/styles.css";
import "./kitchen-sink.css";

import { SideMenu } from "../shared/SideMenu.js";
import { App } from "./App.js";

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

createRoot(container).render(
  <StrictMode>
    <SideMenu />
    <App />
  </StrictMode>,
);
