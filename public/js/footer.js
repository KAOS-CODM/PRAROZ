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
                    <div class="container">
                        <div class="footer-content">
                            <h3>${data.footer.contact.title}</h3>
                            <p>${data.footer.contact.email}</p>
                            <p>${data.footer.contact.phone}</p>
                            <p>${data.footer.contact.address}</p>
                        </div>

                        <div class="footer-content">
                            <h3>${data.footer.quickLinks.title}</h3>
                            <ul class="list">
                                ${data.footer.quickLinks.links.map(link => `
                                    <li><a href="${link.url}">${link.name}</a></li>
                                `).join("")}
                            </ul>
                        </div>

                        <div class="footer-content">
                            <h3>${data.footer.social.title}</h3>
                            <ul class="social-icons">
                                ${data.footer.social.links.map(social => `
                                    <li>
                                        <a href="${social.url}" target="_blank">
                                            <i class="fab fa-${social.platform}"></i>
                                        </a>
                                    </li>
                                `).join("")}
                            </ul>
                        </div>
                    </div>

                    <div class="bottom-bar">
                        <p>${data.footer.bottomBar}</p>
                    </div>
                `;
            }
        }
    })
    .catch(error => console.error("❌ ERROR Fetching Footer:", error));

});