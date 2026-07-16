(function () {
  function setThemeFromStorage() {
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  function bindThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      const isDark = document.documentElement.classList.contains("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");

      // update aria-pressed
      btn.innerHTML = isDark
        ? '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v2"></path><path d="M12 19v2"></path><path d="M4.22 4.22l1.42 1.42"></path><path d="M18.36 18.36l1.42 1.42"></path><path d="M3 12h2"></path><path d="M19 12h2"></path><path d="M4.22 19.78l1.42-1.42"></path><path d="M18.36 5.64l1.42-1.42"></path><circle cx="12" cy="12" r="4.5"></circle></svg>'
        : '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg>';
    });
  }

  function highlightActiveNav() {
    const active = document.body?.getAttribute("data-active-page");
    if (!active) return;

    document.querySelectorAll("[data-nav]").forEach((a) => {
      const nav = a.getAttribute("data-nav");
      const isActive = nav === active;

      const icon = a.querySelector("span.inline-flex");
      if (icon) {
        icon.classList.toggle("bg-emerald-600", isActive);
        icon.classList.toggle("text-white", isActive);
        icon.classList.toggle("bg-slate-100", !isActive);
        icon.classList.toggle("text-slate-600", !isActive);
      }

      a.classList.toggle("bg-slate-50", isActive);
      a.classList.toggle("text-emerald-700", isActive);
      a.classList.toggle("dark:bg-slate-800", isActive);
    });
  }

  function bindGlobalSearchDispatch() {
    const search = document.getElementById("admin-global-search");
    if (!search) return;

    search.addEventListener("input", () => {
      document.dispatchEvent(
        new CustomEvent("admin:search", { detail: search.value || "" })
      );
    });
  }

  function bindLogout() {
    const btn = document.getElementById("logout-button");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      localStorage.removeItem("adminToken");
      window.location.href = "/adminLogin";
    });
  }

  window.adminUi = {
    setThemeFromStorage,
    bindThemeToggle,
    highlightActiveNav,
    bindGlobalSearchDispatch,
    bindLogout,
  };
})();

