document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contact-form");

    const button = document.getElementById("sendBtn");

    const status = document.getElementById("form-status");

    const fields = [
        "name",
        "email",
        "subject",
        "message"
    ].map(id => document.getElementById(id));

    function validate() {

        button.disabled = !fields.every(field =>
            field.value.trim()
        );

    }

    fields.forEach(field =>
        field.addEventListener("input", validate)
    );

    validate();

    form.addEventListener("submit", async e => {

        e.preventDefault();

        button.disabled = true;

        button.textContent = "Sending...";

        status.textContent = "";

        const payload = {
            name: fields[0].value.trim(),
            email: fields[1].value.trim(),
            subject: fields[2].value.trim(),
            message: fields[3].value.trim()
        };

        try {

            const res = await fetch("/api/contact", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)

            });

            const data = await res.json();

            status.textContent = data.message;

            status.className =
                "mt-6 text-center text-green-600";

            form.reset();

            validate();

        } catch {

            status.textContent =
                "Something went wrong. Please try again.";

            status.className =
                "mt-6 text-center text-red-500";

        }

        button.textContent = "Send Message";

    });

});