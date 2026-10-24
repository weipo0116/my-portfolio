// src/PrefsToggles.jsx — language + light/dark switches for the top-right corner.
import { ui } from "./i18n.js";
import "./prefs.css";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" />
  </svg>
);

export default function PrefsToggles({ lang, theme, onToggleLang, onToggleTheme }) {
  const t = ui[lang];
  const isDark = theme === "dark";
  return (
    <div className="prefs-toggles">
      <button
        type="button"
        className="prefs-button prefs-lang"
        onClick={onToggleLang}
        aria-label={t.langToggle}
        title={t.langToggle}
      >
        <span className="prefs-lang-label" key={lang}>
          {t.langShort}
        </span>
      </button>
      <button
        type="button"
        className="prefs-button prefs-theme"
        onClick={onToggleTheme}
        aria-label={isDark ? t.themeToLight : t.themeToDark}
        title={isDark ? t.themeToLight : t.themeToDark}
        aria-pressed={isDark}
      >
        <span className={`prefs-icon ${isDark ? "" : "is-shown"}`}>
          <MoonIcon />
        </span>
        <span className={`prefs-icon ${isDark ? "is-shown" : ""}`}>
          <SunIcon />
        </span>
      </button>
    </div>
  );
}
