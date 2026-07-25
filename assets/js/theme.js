(() => {
  const root = document.documentElement;
  const STORAGE_KEY = "theme";

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function systemPrefersDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function isDarkActive() {
    const stored = root.getAttribute("data-theme");
    return stored ? stored === "dark" : systemPrefersDark();
  }

  function syncToggleState() {
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.setAttribute("aria-pressed", String(isDarkActive()));
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  applyTheme(stored);

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      root.removeAttribute("data-theme");
    }
    syncToggleState();
  });

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    syncToggleState();

    toggle.addEventListener("click", () => {
      const next = isDarkActive() ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      syncToggleState();
    });
  });
})();
