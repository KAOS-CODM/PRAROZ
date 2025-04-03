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
                    <form id="popupFormContent" action="https://gmail.us4.list-manage.com/subscribe/post?u=009f188a1a12df7ffcb87edbc&id=f3cd6a5107" 
                        method="POST" target="_blank" novalidate>
                        
                        <input type="hidden" name="u" value="${popupData.mailchimpUser}">
                        <input type="hidden" name="id" value="${popupData.mailchimpListId}">
                        
                        ${popupData.fields.map(field => `
                        <label for="${field.id}">${field.label}</label>
                        <input type="${field.type}" id="${field.id}" name="${field.name}" ${field.required ? "required" : ""}>
                        `).join("")}

                        <div id="recaptcha-container">
                            <div id="g-recaptcha" class="g-recaptcha" data-sitekey="${popupData.recaptchaSiteKey}"></div>
                        </div>

                        <button type="submit">${popupData.submitText}</button>
                    </form>
                    
                    <iframe id="mailchimp-iframe" name="mailchimp-iframe" style="display:none;"></iframe>
                    <p id="g-recaptcha-response"></p>
                </div>
            </div>
        `;

        const popup = document.getElementById("popupForm");
        const closeBtn = document.querySelector(".close-btn");

        const popupDelay = 5000;

        function loadRecaptcha(callback) {
            if (typeof grecaptcha === "undefined") {
                setTimeout(() => loadRecaptcha(callback), 500);
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
    })
    .catch(error => console.error("Error fetching JSON:", error));
});

document.addEventListener("DOMContentLoaded", function(){
    const landingTimeout = 24 * 60 * 60 * 1000;
    const lastVisit = localStorage.getItem("lastLandingTime");

    if (!lastVisit || Date.now() - lastVisit > landingTimeout){
        window.location.href = "landing.html";
    }
});
