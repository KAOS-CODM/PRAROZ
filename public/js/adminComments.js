(function () {
  const state = {
    pending: {},
    approved: {},
    activeTab: "pending",
    searchQuery: "",
  };

  function formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently added";
    return date.toLocaleString();
  }

  function renderComments() {
    const pendingContainer = document.getElementById("pending-comments-container");
    const approvedContainer = document.getElementById("approved-comments-container");
    if (!pendingContainer || !approvedContainer) return;

    const pendingEntries = Object.entries(state.pending).map(([recipeSlug, comments]) => ({
      recipeSlug,
      comments: comments.filter((comment) => {
        if (!state.searchQuery) return true;
        const haystack = `${recipeSlug} ${comment.name || ""} ${comment.comment || ""}`.toLowerCase();
        return haystack.includes(state.searchQuery.toLowerCase());
      }),
    }));
    const approvedEntries = Object.entries(state.approved).map(([recipeSlug, comments]) => ({
      recipeSlug,
      comments: comments.filter((comment) => {
        if (!state.searchQuery) return true;
        const haystack = `${recipeSlug} ${comment.name || ""} ${comment.comment || ""}`.toLowerCase();
        return haystack.includes(state.searchQuery.toLowerCase());
      }),
    }));
    const pendingCount = pendingEntries.reduce((total, entry) => total + entry.comments.length, 0);
    const approvedCount = approvedEntries.reduce((total, entry) => total + entry.comments.length, 0);

    const pendingTotal = document.getElementById("stat-pending-comments");
    const approvedTotal = document.getElementById("stat-approved-comments");
    if (pendingTotal) pendingTotal.textContent = pendingCount;
    if (approvedTotal) approvedTotal.textContent = approvedCount;

    pendingContainer.innerHTML = pendingEntries.some((entry) => entry.comments.length)
      ? `
        <div class="space-y-6">
          ${pendingEntries.filter((entry) => entry.comments.length).map(({ recipeSlug, comments }) => `
            <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Recipe</p>
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">${recipeSlug}</h3>
                </div>
                <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">${comments.length} pending</span>
              </div>
              <div class="grid gap-4 lg:grid-cols-2">
                ${comments.map((comment) => `
                  <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="font-semibold text-slate-900 dark:text-slate-100">${comment.name || "Anonymous"}</p>
                        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">${formatTime(comment.created_at)}</p>
                      </div>
                      <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">Pending</span>
                    </div>
                    <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">${comment.comment || "No comment provided."}</p>
                    <div class="mt-4 flex flex-wrap gap-2">
                      <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500" data-action="approve" data-id="${comment.id}" data-recipe="${recipeSlug}">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                        Approve
                      </button>
                      <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30" data-action="delete" data-id="${comment.id}" data-recipe="${recipeSlug}">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path></svg>
                        Delete
                      </button>
                      <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700" data-action="ignore" data-id="${comment.id}" data-recipe="${recipeSlug}">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"></path></svg>
                        Ignore
                      </button>
                    </div>
                  </article>
                `).join("")}
              </div>
            </section>
          `).join("")}
          <div class="flex justify-end">
            <button type="button" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-emerald-500 dark:hover:bg-emerald-400" id="batch-pending-actions">Process selected actions</button>
          </div>
        </div>
      `
      : `
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">No pending comments</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">New feedback will appear here automatically.</p>
        </div>
      `;

    approvedContainer.innerHTML = approvedEntries.some((entry) => entry.comments.length)
      ? `
        <div class="space-y-6">
          ${approvedEntries.filter((entry) => entry.comments.length).map(({ recipeSlug, comments }) => `
            <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Recipe</p>
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">${recipeSlug}</h3>
                </div>
                <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">${comments.length} approved</span>
              </div>
              <div class="grid gap-4 lg:grid-cols-2">
                ${comments.map((comment) => `
                  <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="font-semibold text-slate-900 dark:text-slate-100">${comment.name || "Anonymous"}</p>
                        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">${formatTime(comment.created_at)}</p>
                      </div>
                      <span class="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Approved</span>
                    </div>
                    <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">${comment.comment || "No comment provided."}</p>
                    <div class="mt-4 flex flex-wrap gap-2">
                      <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50 dark:border-amber-900/60 dark:text-amber-300 dark:hover:bg-amber-950/30" data-action="disapprove" data-id="${comment.id}" data-recipe="${recipeSlug}">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                        Disapprove
                      </button>
                      <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30" data-action="delete" data-id="${comment.id}" data-recipe="${recipeSlug}">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path></svg>
                        Delete
                      </button>
                      <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700" data-action="ignore" data-id="${comment.id}" data-recipe="${recipeSlug}">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"></path></svg>
                        Ignore
                      </button>
                    </div>
                  </article>
                `).join("")}
              </div>
            </section>
          `).join("")}
        </div>
      `
      : `
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">No approved comments</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Approved feedback will be shown here.</p>
        </div>
      `;

    pendingContainer.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => handleCommentAction(button.dataset.action, button.dataset.id, button.dataset.recipe, "pending"));
    });

    approvedContainer.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => handleCommentAction(button.dataset.action, button.dataset.id, button.dataset.recipe, "approved"));
    });

    const batchPendingButton = document.getElementById("batch-pending-actions");
    if (batchPendingButton) {
      batchPendingButton.addEventListener("click", () => handleBatchPendingActions());
    }
  }

  async function fetchComments() {
    try {
      const [pending, approved] = await Promise.all([apiCall("/comments-pending"), apiCall("/comments-approved")]);
      state.pending = pending || {};
      state.approved = approved || {};
      renderComments();
    } catch (error) {
      showToast(error.message || "Unable to load comments", "error");
    }
  }

  async function handleCommentAction(action, id, recipeSlug, section) {
    if (action === "ignore") {
      return;
    }

    const confirmed = await confirmModal({
      title: action === "approve" ? "Approve comment" : action === "disapprove" ? "Disapprove comment" : "Delete comment",
      message: action === "approve" ? "Approve this comment?" : action === "disapprove" ? "Move this comment back to pending?" : "Delete this comment permanently?",
      confirmLabel: action === "delete" ? "Delete" : action === "approve" ? "Approve" : "Disapprove",
      confirmClass: action === "delete" ? "bg-rose-600 text-white hover:bg-rose-500" : "bg-emerald-600 text-white hover:bg-emerald-500",
    });

    if (!confirmed) return;

    try {
      if (action === "approve") {
        await apiCall("/approve-comment", "POST", { id, recipeSlug });
      } else if (action === "disapprove") {
        await apiCall("/disapprove-comment", "POST", { id, recipeSlug });
      } else {
        await apiCall("/delete-comment", "POST", { id, recipeSlug });
      }
      showToast(action === "approve" ? "Comment approved" : action === "disapprove" ? "Comment disapproved" : "Comment deleted", "success");
      fetchComments();
    } catch (error) {
      showToast(error.message || "Unable to update comment", "error");
    }
  }

  async function handleBatchPendingActions() {
    const pendingEntries = Object.entries(state.pending);
    const batch = [];

    pendingEntries.forEach(([recipeSlug, comments]) => {
      comments.forEach((comment) => {
        batch.push({ id: comment.id, recipeSlug, action: "ignore" });
      });
    });

    if (!batch.length) {
      showToast("No pending actions to process", "warning");
      return;
    }

    try {
      await apiCall("/batch-comments", "POST", { comments: batch });
      showToast("Batch actions completed", "success");
      fetchComments();
    } catch (error) {
      showToast(error.message || "Batch processing failed", "error");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/adminLogin";
      return;
    }

    document.addEventListener("admin:search", (event) => {
      state.searchQuery = event.detail || "";
      renderComments();
    });

    fetchComments();
  });
})();
