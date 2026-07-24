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

  const stored = localStorage.getItem(STORAGE_KEY);
  applyTheme(stored);

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      root.removeAttribute("data-theme");
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const currentlyDark = root.getAttribute("data-theme")
        ? root.getAttribute("data-theme") === "dark"
        : systemPrefersDark();
      const next = currentlyDark ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
    });
  });
})();
