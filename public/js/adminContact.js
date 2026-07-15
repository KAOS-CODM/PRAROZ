(async function () {

    async function fetchContacts() {

        showLoader("contact-list");

        try {

            const contacts = await apiCall("/contacts");

            renderContacts(contacts);

            document.getElementById("stat-contacts").textContent =
                contacts.length;

        }

        catch (err) {

            showToast(err.message, "error");

        }

    }

    function renderContacts(contacts) {

        const container =
            document.getElementById("contact-list");

        if (!contacts.length) {

            container.innerHTML = `
                <div
                    class="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">

                    <h3
                        class="text-lg font-semibold">
                        No contact messages
                    </h3>

                </div>
            `;

            return;

        }

        container.innerHTML = contacts.map(contact => `

            <article
                class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">

                <div
                    class="flex items-center justify-between">

                    <div>

                        <h3
                            class="text-lg font-semibold">
                            ${contact.subject}
                        </h3>

                        <p
                            class="text-sm text-slate-500">

                            ${contact.name}

                            •

                            ${contact.email}

                        </p>

                    </div>

                    <span
                        class="rounded-full px-3 py-1 text-xs font-semibold

                        ${contact.status === "read"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"}">

                        ${contact.status}

                    </span>

                </div>

                <p
                    class="mt-5 whitespace-pre-wrap leading-7">

                    ${contact.message}

                </p>

                <div
                    class="mt-6 flex gap-3">

                    <button

                        data-id="${contact.id}"

                        class="mark-read rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">

                        Mark Read

                    </button>

                    <button

                        data-id="${contact.id}"

                        class="delete-contact rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-500">

                        Delete

                    </button>

                </div>

            </article>

        `).join("");

        container
            .querySelectorAll(".mark-read")
            .forEach(button => {

                button.onclick = () =>
                    markRead(button.dataset.id);

            });

        container
            .querySelectorAll(".delete-contact")
            .forEach(button => {

                button.onclick = () =>
                    deleteContact(button.dataset.id);

            });

    }

    async function markRead(id) {

        await apiCall(
            `/contacts/${id}/read`,
            "PATCH"
        );

        showToast(
            "Marked as read",
            "success"
        );

        fetchContacts();

    }

    async function deleteContact(id) {

        const confirmed =
            await confirmModal({

                title:
                    "Delete Message",

                message:
                    "Delete this contact message?",

                confirmLabel:
                    "Delete",

                confirmClass:
                    "bg-rose-600 text-white"

            });

        if (!confirmed) return;

        await apiCall(
            `/contacts/${id}`,
            "DELETE"
        );

        showToast(
            "Message deleted",
            "success"
        );

        fetchContacts();

    }

    document.addEventListener(
        "DOMContentLoaded",
        fetchContacts
    );

})();