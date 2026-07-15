(function () {
  function initTheme() {
    const storedTheme = localStorage.getItem("admin-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = storedTheme ? storedTheme === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", isDark);
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.innerHTML = isDark
        ? '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2"></path><path d="M12 19v2"></path><path d="M4.22 4.22l1.42 1.42"></path><path d="M18.36 18.36l1.42 1.42"></path><path d="M3 12h2"></path><path d="M19 12h2"></path><path d="M4.22 19.78l1.42-1.42"></path><path d="M18.36 5.64l1.42-1.42"></path><circle cx="12" cy="12" r="4.5"></circle></svg>'
        : '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg>';
    }
  }

  function bindThemeToggle() {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("admin-theme", isDark ? "dark" : "light");
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.innerHTML = isDark
        ? '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2"></path><path d="M12 19v2"></path><path d="M4.22 4.22l1.42 1.42"></path><path d="M18.36 18.36l1.42 1.42"></path><path d="M3 12h2"></path><path d="M19 12h2"></path><path d="M4.22 19.78l1.42-1.42"></path><path d="M18.36 5.64l1.42-1.42"></path><circle cx="12" cy="12" r="4.5"></circle></svg>'
        : '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg>';
    });
  }

  function initSearch() {
    const searchInput = document.getElementById("dashboard-search");
    if (!searchInput) return;

    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.trim().toLowerCase();
      document.dispatchEvent(new CustomEvent("admin:search", { detail: query }));
    });
  }

  function initLogout() {
    const logoutButton = document.getElementById("logout-button");
    if (!logoutButton) return;

    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("adminToken");
      window.location.href = "/adminLogin";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    bindThemeToggle();
    initSearch();
    initLogout();
  });
})();
