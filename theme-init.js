// Runs before CSS/JS load so the first paint already uses the visitor's theme
// and language (prevents a light flash for dark-mode visitors).
(function () {
  var root = document.documentElement;
  var theme, lang;
  try {
    theme = localStorage.getItem("webber.theme");
    lang = localStorage.getItem("webber.lang");
  } catch (e) {}
  if (theme !== "dark" && theme !== "light") {
    theme =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  }
  if (lang !== "en" && lang !== "zh") {
    lang = (navigator.language || "").toLowerCase().indexOf("zh") === 0 ? "zh" : "en";
  }
  root.setAttribute("data-theme", theme);
  root.lang = lang === "zh" ? "zh-Hant-TW" : "en";
  root.style.backgroundColor = theme === "dark" ? "#07090f" : "#f2f7ff";
})();
