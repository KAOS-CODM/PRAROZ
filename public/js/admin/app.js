(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // init shared chrome
    window.adminUi?.setThemeFromStorage?.();
    window.adminUi?.bindThemeToggle?.();
    window.adminUi?.highlightActiveNav?.();
    window.adminUi?.bindGlobalSearchDispatch?.();
    window.adminUi?.bindLogout?.();

    window.adminAuth?.requireAdminOrRedirect?.();
  });
})();

