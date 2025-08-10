document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Navbar script loaded");

    const navbarContainer = document.getElementById("nav-links");
    if (!navbarContainer) {
        console.warn("⚠️ Navbar container (#nav-links) not found. Skipping navbar setup.");
        return;
    }

    let currentPage = window.location.pathname.split('/').pop().split('?')[0].split('#')[0];

    fetch(`${window.API_BASE_URL}/data/contents`, {
        headers: { "x-api-key": "yemite01" }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.navbar || !data.navbar.links) {
            console.error("❌ Navbar data not found in API response");
            return;
        }

        console.log("📂 Navbar Data:", data.navbar);
        navbarContainer.innerHTML = "";

        data.navbar.links.forEach(link => {
            const li = document.createElement("li");

            if (link.url === currentPage) {
                li.innerHTML = `<a href="${link.url}" class="active"><i class="${link.icon}"></i>${link.name}</a>`;
            } else {
                li.innerHTML = `<a href="${link.url}"><i class="${link.icon}"></i>${link.name}</a>`;
            }

            navbarContainer.appendChild(li);
        });
    })
    .catch(error => console.error("❌ ERROR Fetching Navbar:", error));
});
