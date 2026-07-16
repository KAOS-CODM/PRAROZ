(function () {
  function getAuthHeaders() {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function apiCall(endpoint, method = "GET", body = null) {
    const options = {
      method,
      headers: getAuthHeaders(),
    };

    if (body !== null && body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${window.API_BASE_URL}${endpoint}`, options);

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);

    if (!response.ok) {
      const message =
        (data && typeof data === "object" && data.message) ||
        (typeof data === "string" && data) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data;
  }

  function showLoader(target) {
    const container =
      typeof target === "string" ? document.getElementById(target) : target;
    if (!container) return;

    container.innerHTML = `
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        ${Array.from({ length: 3 }, () => `
          <div class="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div class="h-40 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
            <div class="mt-4 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div class="mt-3 h-4 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
            <div class="mt-2 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div class="mt-6 flex gap-3">
              <div class="h-10 flex-1 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
              <div class="h-10 flex-1 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function hideLoader(target) {
    const container =
      typeof target === "string" ? document.getElementById(target) : target;
    if (container) container.innerHTML = "";
  }

  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toneMap = {
      success: {
        classes:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200",
      },
      error: {
        classes:
          "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-200",
      },
      warning: {
        classes:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-rose-950/70 dark:text-amber-200",
      },
      info: {
        classes:
          "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
      },
    };

    const tone = toneMap[type] || toneMap.info;

    const toast = document.createElement("div");
    toast.className = `pointer-events-auto rounded-2xl border p-4 shadow-lg backdrop-blur ${tone.classes}`;
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 2v6"></path>
            <path d="M12 16v6"></path>
            <path d="M4.93 4.93l4.24 4.24"></path>
            <path d="M14.83 14.83l4.24 4.24"></path>
            <path d="M2 12h6"></path>
            <path d="M16 12h6"></path>
            <path d="M4.93 19.07l4.24-4.24"></path>
            <path d="M14.83 9.17l4.24-4.24"></path>
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold">${message}</p>
        </div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 220);
    }, 3600);
  }

  function confirmModal({
    title = "Confirm action",
    message = "Are you sure you want to continue?",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmClass =
      "bg-slate-900 text-white hover:bg-slate-700 dark:bg-emerald-500 dark:hover:bg-emerald-400",
  }) {
    return new Promise((resolve) => {
      const root = document.getElementById("modal-root");
      if (!root) return resolve(false);

      const backdrop = document.createElement("div");
      backdrop.className =
        "modal-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm";
      backdrop.innerHTML = `
        <div class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">${title}</h3>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">${message}</p>
          <div class="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" class="cancel-btn rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">${cancelLabel}</button>
            <button type="button" class="confirm-btn rounded-xl px-4 py-2 text-sm font-medium transition ${confirmClass}">${confirmLabel}</button>
          </div>
        </div>
      `;

      root.innerHTML = "";
      root.appendChild(backdrop);

      const cleanup = () => {
        backdrop.remove();
        root.innerHTML = "";
      };

      backdrop.querySelector(".cancel-btn").addEventListener("click", () => {
        cleanup();
        resolve(false);
      });

      backdrop.querySelector(".confirm-btn").addEventListener("click", () => {
        cleanup();
        resolve(true);
      });
    });
  }

  window.adminApi = {
    apiCall,
    showLoader,
    hideLoader,
    showToast,
    confirmModal,
  };
})();

