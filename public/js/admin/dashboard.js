(function () {
  const state = {
    recent: [],
  };

  function formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently";
    return date.toLocaleString();
  }

  function renderRecentActivity(items) {
    const container = document.getElementById("recent-activity");
    if (!container) return;

    container.innerHTML = items.length
      ? `\n        <div class="space-y-3">\n          ${items
            .map(
              (it) => `\n            <div class="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-800">\n              <div>\n                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">${it.title}</p>\n                <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">${it.subtitle}</p>\n              </div>\n              <div class="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">${it.time}</div>\n            </div>\n          `
            )
            .join("")}\n        </div>\n      `
      : `\n        <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/40">\n          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">No recent activity</h3>\n          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">New submissions and messages will appear here.</p>\n        </div>\n      `;
  }

  async function loadDashboardStats() {
    // Reuse existing admin endpoints; keep it lightweight.
    const api = window.adminApi;
    const [pendingRecipes, approvedRecipes, pendingComments, approvedComments, contacts] =
      await Promise.all([
        api.apiCall("/unapproved-recipes"),
        api.apiCall("/approved-recipes"),
        api.apiCall("/comments-pending"),
        api.apiCall("/comments-approved"),
        api.apiCall("/contacts"),
      ]);

    const pendingRecipeCount = Array.isArray(pendingRecipes)
      ? pendingRecipes.length
      : 0;
    const approvedRecipeCount = Array.isArray(approvedRecipes)
      ? approvedRecipes.length
      : 0;

    const countGrouped = (grouped) =>
      Object.values(grouped || {}).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);

    const pendingCommentCount = countGrouped(pendingComments);
    const approvedCommentCount = countGrouped(approvedComments);

    const unreadContacts = Array.isArray(contacts)
      ? contacts.filter((c) => c.status !== "read").length
      : 0;

    document.getElementById("stat-pending-recipes").textContent = pendingRecipeCount;
    document.getElementById("stat-approved-recipes").textContent = approvedRecipeCount;
    document.getElementById("stat-pending-comments").textContent = pendingCommentCount;
    document.getElementById("stat-approved-comments").textContent = approvedCommentCount;
    document.getElementById("stat-contacts").textContent = unreadContacts;

    // Recent activity: newest first (best effort from existing data)
    const recent = [];

    if (Array.isArray(pendingRecipes)) {
      pendingRecipes
        .slice(0, 10)
        .forEach((r) =>
          recent.push({
            title: "Recipe submitted",
            subtitle: r.name || r.description || "New recipe",
            time: formatTime(r.created_at || r.createdAt || r.created || Date.now()),
            _t: new Date(r.created_at || r.createdAt || Date.now()).getTime(),
          })
        );
    }

    // comments-pending/approved are grouped by recipeSlug. flatten with created_at
    const flattenComments = (grouped, label, statusTone) => {
      const list = [];
      for (const [recipeSlug, arr] of Object.entries(grouped || {})) {
        (arr || []).forEach((c) =>
          list.push({
            title: label,
            subtitle: `${c.name || "Anonymous"} on ${recipeSlug}`,
            time: formatTime(c.created_at || c.createdAt || Date.now()),
            _t: new Date(c.created_at || c.createdAt || Date.now()).getTime(),
          })
        );
      }
      return list;
    };

    recent.push(...flattenComments(pendingComments, "Comment awaiting review"));
    recent.push(...flattenComments(approvedComments, "Comment published"));

    if (Array.isArray(contacts)) {
      contacts.forEach((m) =>
        recent.push({
          title: "Contact message",
          subtitle: `${m.subject || "Message"} — ${m.name || "Unknown"}`,
          time: formatTime(m.created_at || m.createdAt || Date.now()),
          _t: new Date(m.created_at || m.createdAt || Date.now()).getTime(),
        })
      );
    }

    recent.sort((a, b) => (b._t || 0) - (a._t || 0));
    renderRecentActivity(recent.slice(0, 6).map(({ _t, ...rest }) => rest));
  }

  async function loadAll() {
    try {
      await loadDashboardStats();
    } catch (err) {
      window.adminApi?.showToast?.(err.message || "Unable to load dashboard", "error");
    }
  }

  document.addEventListener("DOMContentLoaded", loadAll);
})();

