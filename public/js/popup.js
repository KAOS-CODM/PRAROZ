document.addEventListener("DOMContentLoaded", function () {
    const popupContainer = document.getElementById("popupContainer");
    if (!popupContainer) {
        console.warn("⚠️ #popupContainer not found. Skipping popup setup.");
        return;
    }

    // Inject the popup HTML directly
    popupContainer.innerHTML = `
        <div id="popupForm" class="popup" style="display:none;">
            <div class="popup-content">
                <span class="close-btn">&times;</span>
                <div id="g-recaptcha" 
                     class="g-recaptcha" 
                     data-sitekey="6LcU5_wqAAAAAN2OhinShvAfOcNAZRzBduC8kqbY">
                </div>
            </div>
        </div>
    `;

    // Load reCAPTCHA script if not already loaded
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
        const recaptchaScript = document.createElement("script");
        recaptchaScript.src = "https://www.google.com/recaptcha/api.js";
        recaptchaScript.async = true;
        recaptchaScript.defer = true;
        document.head.appendChild(recaptchaScript);
    }

    const popup = document.getElementById("popupForm");
    const closeBtn = popup.querySelector(".close-btn");
    const popupDelay = 5000; // 5 seconds

    function showPopup() {
        console.log("✅ Human verification popup triggered");
        popup.style.display = "flex";
    }

    // Show only once per session
    if (!sessionStorage.getItem("popupShown")) {
        setTimeout(() => {
            showPopup();
            sessionStorage.setItem("popupShown", "true");
        }, popupDelay);
    }

    // Close events
    closeBtn.addEventListener("click", () => popup.style.display = "none");
    window.addEventListener("click", (event) => {
        if (event.target === popup) popup.style.display = "none";
    });
});
