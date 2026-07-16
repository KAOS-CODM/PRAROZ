(function () {
  const state = {
    contacts: [],
    searchQuery: "",
  };

  function renderContacts() {
    const container = document.getElementById("contact-list");
    if (!container) return;

    const q = (state.searchQuery || "").toLowerCase();
    const visible = (state.contacts || []).filter((c) => {
      if (!q) return true;
      const haystack = `${c.subject || ""} ${c.name || ""} ${c.email || ""} ${c.message || ""}`.toLowerCase();
      return haystack.includes(q);
    });

    if (!visible.length) {
      container.innerHTML = `
        <div class="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">No contact messages</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Try a different search term.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = visible
      .map(
        (contact) => `
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">${contact.subject || "Untitled"}</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              ${contact.name || "Unknown"} • ${contact.email || ""}
            </p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-semibold ${contact.status === "read" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"}">
            ${contact.status}
          </span>
        </div>
        <p class="mt-5 whitespace-pre-wrap leading-7 text-sm text-slate-700 dark:text-slate-200">${contact.message || ""}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <button data-id="${contact.id}" class="mark-read rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500" type="button">Mark as Read</button>
          <button data-id="${contact.id}" class="delete-contact rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-500" type="button">Delete</button>
        </div>
      </article>
    `
      )
      .join("");

    container.querySelectorAll(".mark-read").forEach((btn) => {
      btn.addEventListener("click", () => markRead(btn.dataset.id));
    });

    container.querySelectorAll(".delete-contact").forEach((btn) => {
      btn.addEventListener("click", () => deleteContact(btn.dataset.id));
    });
  }

  async function fetchContacts() {
    window.adminApi.showLoader("contact-list");
    try {
      const contacts = await window.adminApi.apiCall("/contacts");
      state.contacts = Array.isArray(contacts) ? contacts : [];
      const stat = document.getElementById("stat-contacts");
      if (stat) stat.textContent = state.contacts.length;
      window.adminApi.hideLoader("contact-list");
      renderContacts();
    } catch (err) {
      window.adminApi.hideLoader("contact-list");
      window.adminApi.showToast(err.message || "Unable to load contacts", "error");
    }
  }

  async function markRead(id) {
    await window.adminApi.apiCall(`/contacts/${id}/read`, "PATCH");
    window.adminApi.showToast("Marked as read", "success");
    fetchContacts();
  }

  async function deleteContact(id) {
    const confirmed = await window.adminApi.confirmModal({
      title: "Delete Message",
      message: "Delete this contact message?",
      confirmLabel: "Delete",
      confirmClass: "bg-rose-600 text-white hover:bg-rose-500",
    });

    if (!confirmed) return;

    await window.adminApi.apiCall(`/contacts/${id}`, "DELETE");
    window.adminApi.showToast("Message deleted", "success");
    fetchContacts();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("admin:search", (event) => {
      state.searchQuery = event.detail || "";
      renderContacts();
    });

    fetchContacts();
  });
})();

