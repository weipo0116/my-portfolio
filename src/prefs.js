// src/prefs.js
// Language + theme preferences shared by every page. Stored per browser;
// storage can be unavailable (private mode), so every access is guarded.
import { useCallback, useEffect, useState } from "react";

const LANG_KEY = "webber.lang";
const THEME_KEY = "webber.theme";

const readStored = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStored = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — preference just won't persist */
  }
};

const systemTheme = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const initialLang = () => {
  const stored = readStored(LANG_KEY);
  if (stored === "en" || stored === "zh") return stored;
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
};

const initialTheme = () => {
  const stored = readStored(THEME_KEY);
  return stored === "dark" || stored === "light" ? stored : systemTheme();
};

// Apply before React mounts so the first paint already has the right theme.
export const applyInitialPrefs = () => {
  const root = document.documentElement;
  root.dataset.theme = initialTheme();
  root.lang = initialLang() === "zh" ? "zh-Hant-TW" : "en";
};

export const usePrefs = () => {
  const [lang, setLang] = useState(initialLang);
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant-TW" : "en";
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    // theme-init.js paints <html> before CSS loads; hand control back to CSS.
    root.style.backgroundColor = "";
  }, [theme]);

  // Follow the OS until the visitor picks a theme themselves.
  useEffect(() => {
    if (readStored(THEME_KEY)) return undefined;
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!query) return undefined;
    const onChange = (event) => setTheme(event.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((current) => {
      const next = current === "zh" ? "en" : "zh";
      writeStored(LANG_KEY, next);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    // Animate colours only while switching, so normal page loads stay instant.
    const root = document.documentElement;
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 450);
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      writeStored(THEME_KEY, next);
      return next;
    });
  }, []);

  return { lang, theme, toggleLang, toggleTheme };
};
