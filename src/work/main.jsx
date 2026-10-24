import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../tokens.css";
import "../index.css";
import App from "../App.jsx";
import { applyInitialPrefs } from "../prefs.js";

applyInitialPrefs();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App page="work" />
  </StrictMode>,
);
