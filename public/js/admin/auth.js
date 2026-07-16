(function () {
  function requireAdminOrRedirect() {
    const token = localStorage.getItem("adminToken");
    if (token) return true;
    window.location.href = "/adminLogin";
    return false;
  }

  window.adminAuth = {
    requireAdminOrRedirect,
  };
})();

