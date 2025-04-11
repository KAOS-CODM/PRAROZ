document.addEventListener("DOMContentLoaded", function () {
    const popupContainer = document.getElementById("popupContainer");

    fetch(`${window.API_BASE_URL}/api/data/popup`, {
        headers: {
            "x-api-key": "yemite01",
        }
    })
    .then(response => response.json())
    .then(data => {
        const popupData = data.popupForm;
        if (!popupData) return;

        // Inject the popup HTML structure
        popupContainer.innerHTML = `
            <div id="popupForm" class="popup">
                <div class="popup-content">
                    <span class="close-btn">&times;</span>
                    <div id="mailchimpFormContainer"></div>
                </div>
            </div>
        `;

        // Inject Mailchimp's provided embed code directly
        const script = document.createElement("script");
        script.id = "mcjs";
        script.async = true;
        script.src = "https://chimpstatic.com/mcjs-connected/js/users/009f188a1a12df7ffcb87edbc/e28ef9941f38ab0c9c1852cb0.js";
        document.head.appendChild(script);

        // Reference the popup and close button
        const popup = document.getElementById("popupForm");
        const closeBtn = document.querySelector(".close-btn");
        const popupDelay = 5000;

        function showPopup() {
            console.log("Mailchimp popup triggered");
            popup.style.display = "flex";
        }

        // Delay popup display based on sessionStorage (only shows once per session)
        if (!sessionStorage.getItem("popupShown")) {
            setTimeout(() => {
                showPopup();
                sessionStorage.setItem("popupShown", "true");
            }, popupDelay);
        }

        // Close button functionality
        closeBtn.addEventListener("click", function () {
            popup.style.display = "none";
        });

        window.addEventListener("click", function (event) {
            if (event.target === popup) {
                popup.style.display = "none";
            }
        });
    })
    .catch(error => console.error("Error fetching JSON:", error));

    // Landing page redirect logic remains unchanged
    const landingTimeout = 24 * 60 * 60 * 1000;
    const lastVisit = localStorage.getItem("lastLandingTime");

    if (!lastVisit || Date.now() - lastVisit > landingTimeout) {
        window.location.href = "index.html";
    }
});
