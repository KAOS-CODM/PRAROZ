document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll("#newsletter-form");

    forms.forEach(form => {
        const emailInput = form.querySelector("#newsletter-email");
        const submitBtn = form.querySelector('button[type="submit"]');
        const messageEl = form.querySelector("#newsletter-message");

        // Store original button HTML to restore after submission
        const originalBtnHtml = submitBtn.innerHTML;

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();

            // Validate email before sending
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage(messageEl, "Please enter a valid email address.", false);
                return;
            }

            // Prevent duplicate clicks while submitting
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                Subscribing...
            `;

            try {
                const response = await fetch("/api/subscribe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(messageEl, data.message || "Successfully subscribed!", true);
                    form.reset();
                } else if (response.status === 409) {
                    showMessage(messageEl, data.error || "You're already subscribed.", false);
                } else {
                    showMessage(messageEl, data.error || "Unable to subscribe right now.", false);
                }
            } catch (err) {
                showMessage(messageEl, "Unable to subscribe right now.", false);
            } finally {
                // Re-enable button and restore original text
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    });

    function showMessage(el, message, success) {
        if (!el) return;

        el.textContent = message;
        el.classList.remove("hidden", "text-green-600", "text-red-600", "dark:text-green-400", "dark:text-red-400");

        if (success) {
            el.classList.add("text-green-600", "dark:text-green-400");
        } else {
            el.classList.add("text-red-600", "dark:text-red-400");
        }
    }
});

