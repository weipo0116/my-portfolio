import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import "./links.css";
import LinksPage from "./LinksPage.jsx";
import { applyInitialPrefs } from "../prefs.js";

applyInitialPrefs();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LinksPage />
  </StrictMode>,
);
