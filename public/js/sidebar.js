document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Sidebar script loaded");

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    if (!menuBtn || !sidebar) {
        console.warn("⚠️ Sidebar elements (#menuBtn, #sidebar) not found. Skipping sidebar setup.");
        return;
    }

    menuBtn.addEventListener("click", function (event) {
        sidebar.classList.toggle("open");
        menuBtn.textContent = sidebar.classList.contains("open") ? "X" : "☰";
        event.stopPropagation();
    });

    document.addEventListener("click", function (event) {
        if (!sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
            sidebar.classList.remove("open");
            menuBtn.textContent = "☰";
        }
    });

    sidebar.addEventListener("click", function (event) {
        event.stopPropagation();
    });
});
