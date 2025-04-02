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

            popupContainer.innerHTML = `
                <div id="popupForm" class="popup">
                    <div class="popup-content">
                        <span class="close-btn">&times;</span>
                        <h2>${popupData.title}</h2>
                        <p>${popupData.message}</p>
                        <form id="popupFormContent" action="https://formspree.io/f/${popupData.formspreeid}" method="POST">
                            ${popupData.fields.map(field => `
                            <label for="${field.id}">${field.label}</label>
                            <input type="${field.type}" id="${field.id}" name="${field.name}" ${field.required ? "required" : ""}>
                            `).join("")}
                            <div id="recaptcha-container">
                                <div id="g-recaptcha" class="g-recaptcha" data-sitekey="${popupData.recaptchaSiteKey}"></div>
                            </div>
                            <button type="submit">${popupData.submitText}</button>
                        </form>
                        <p id="g-recaptcha-response"></p>
                    </div>
                </div>
            `;

            const popup = document.getElementById("popupForm");
            const closeBtn = document.querySelector(".close-btn");
            const form = document.getElementById("popupFormContent");

            const popupDelay = 5000; // Show popup after 5 seconds

            function loadRecaptcha(callback) {
                if (typeof grecaptcha === "undefined") {
                    setTimeout(() => loadRecaptcha(callback), 500); // Wait and retry
                } else {
                    callback();
                }
            }

            function showPopup() {
                console.log("popup found");
                popupContainer.classList.add("active");
                popup.style.display = "flex";

                loadRecaptcha(() => {
                    grecaptcha.render("g-recaptcha", {
                        sitekey: popupData.recaptchaSiteKey
                    });
                });
            }

            // Show popup after 5 seconds if not shown before
            if (!sessionStorage.getItem("popupShown")) {
                setTimeout(() => {
                    showPopup();
                    sessionStorage.setItem("popupShown", "true");
                }, popupDelay);
            }

            closeBtn.addEventListener("click", function () {
                popup.style.display = "none";
            });

            window.addEventListener("click", function (event) {
                if (event.target === popup) {
                    popup.style.display = "none";
                }
            });

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                const recaptchaResponse = grecaptcha.getResponse();

                if (!recaptchaResponse) {
                    alert("Please complete the reCAPTCHA");
                    return;
                }

                const formData = new FormData(form);
                formData.append("g-recaptcha-response", recaptchaResponse);

                fetch(form.action, {
                    method: "POST",
                    body: formData,
                    headers: { "Accept": "application/json" }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        alert("Thanks for subscribing!!!");
                        popup.style.display = "none";
                        form.reset();
                        grecaptcha.reset();
                    } else {
                        alert("Error submitting form. Please try again!");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Something went wrong. Please try again.");
                });
            });
        })
        .catch(error => console.error("Error fetching JSON:", error));
});
document.addEventListener("DOMContentLoaded", function(){
    const landingTimeout = 24*60*60*1000;
    const lastVist = localStorage.getItem("lastLandingTime");

    if (!lastVist || Date.now() - lastVist > landingTimeout){
        window.location.href = "landing.html";
    }
});
