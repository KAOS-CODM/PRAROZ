document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Navbar script loaded");

    const footer = document.getElementById("dynamic-footer");
    if (!footer) {
        console.warn("⚠️ Navbar container (#dynamic-footer) not found. Skipping footer setup.");
        return;
    }

    fetch(`${window.API_BASE_URL}/data/contents`, {
        headers: { "x-api-key": "yemite01" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.footer) {
            const footer = document.getElementById("dynamic-footer");
            if (footer) {
                footer.innerHTML = `
                    <p>${data.footer.text}</p>
                    <p class="social-icons">
                        <a href="${data.footer.social.facebook}" target="_blank"><i class="fab fa-facebook"></i></a>
                        <a href="${data.footer.social.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>
                        <a href="${data.footer.social.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>
                    </p>
                `;
            }
        }
    })
    .catch(error => console.error("❌ ERROR Fetching Navbar:", error));
});