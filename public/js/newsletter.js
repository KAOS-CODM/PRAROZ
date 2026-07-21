document.addEventListener("DOMContentLoaded", () => {

    const forms = document.querySelectorAll(".newsletter-form");

    forms.forEach(form => {

        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            const emailInput = form.querySelector('input[type="email"]');

            const email = emailInput.value.trim();

            const source = form.dataset.source || "unknown";

            if (!email) return;

            try {

                const response = await fetch(
                    `${window.API_BASE_URL}/newsletter`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email,
                            source,
                        }),
                    }
                );

                const data = await response.json();

                if (response.ok) {

                    emailInput.value = "";

                    showNewsletterMessage(
                        form,
                        data.message,
                        true
                    );

                } else {

                    showNewsletterMessage(
                        form,
                        data.message,
                        false
                    );

                }

            } catch (err) {

                showNewsletterMessage(
                    form,
                    "Unable to subscribe right now.",
                    false
                );

            }

        });

    });

});


function showNewsletterMessage(
    form,
    message,
    success
) {

    let messageBox =
        form.querySelector(".newsletter-message");

    if (!messageBox) {

        messageBox = document.createElement("p");

        messageBox.className =
            "newsletter-message mt-3 text-sm";

        form.appendChild(messageBox);

    }

    messageBox.textContent = message;

    messageBox.className =
        `newsletter-message mt-3 text-sm ${
            success
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
        }`;

}