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
  root.style.backgroundColor = theme === "dark" ? "#111215" : "#fbfbfd";

  // Cross-page view transitions reject their promises when a navigation is
  // interrupted (e.g. a hash jump mid-transition); that is expected, not an error.
  var quiet = function (event) {
    var vt = event && event.viewTransition;
    if (!vt) return;
    ["ready", "finished", "updateCallbackDone"].forEach(function (key) {
      if (vt[key] && vt[key].catch) vt[key].catch(function () {});
    });
  };
  window.addEventListener("pagereveal", quiet);
  window.addEventListener("pageswap", quiet);
})();
