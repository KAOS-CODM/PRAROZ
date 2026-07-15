const password = document.getElementById("password");
const toggle = document.getElementById("togglePassword");

const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");

toggle.addEventListener("click", () => {
    const hidden = password.type === "password";

    password.type = hidden ? "text" : "password";

    eyeOpen.classList.toggle("hidden");
    eyeClosed.classList.toggle("hidden");
});

const toast = document.getElementById("toast");

function showToast(message, type = "error") {
    toast.textContent = message;

    toast.classList.remove("hidden");
    toast.classList.remove("bg-red-600", "bg-emerald-600");

    if (type === "success") {
        toast.classList.add("bg-emerald-600");
    } else {
        toast.classList.add("bg-red-600");
    }

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("loginBtn");

    btn.disabled = true;

    btn.innerHTML = `
        <svg class="animate-spin mx-auto h-5 w-5"
             xmlns="http://www.w3.org/2000/svg"
             fill="none"
             viewBox="0 0 24 24">

            <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"/>

            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"/>

        </svg>
    `;

    try {

        const res = await fetch(`${window.API_BASE_URL}/validate-admin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: password.value
            })
        });

        const data = await res.json();

        if (res.ok && data.valid && data.token) {

            localStorage.setItem("adminToken", data.token);

            showToast("Login successful", "success");

            setTimeout(() => {
                window.location.href = "/admin";
            }, 800);

            return;
        }

        showToast("Invalid password");

    } catch (err) {

        console.error(err);

        showToast("Unable to connect to server");

    }

    btn.disabled = false;
    btn.textContent = "Login";
});