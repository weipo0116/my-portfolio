import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { applyInitialPrefs } from "./prefs.js";

applyInitialPrefs();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App page="profile" />
  </StrictMode>,
);
