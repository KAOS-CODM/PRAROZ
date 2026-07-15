document.addEventListener("navbarLoaded", () => {

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const menuIcon = document.getElementById("menuIcon");

    if (!menuBtn || !sidebar) return;

    menuBtn.addEventListener("click", () => {

        const open = sidebar.classList.contains("translate-x-0");

        if (open) {
            sidebar.classList.remove("translate-x-0");
            sidebar.classList.add("translate-x-full");

            menuIcon.classList.remove("fa-times");
            menuIcon.classList.add("fa-bars");
        } else {
            sidebar.classList.remove("translate-x-full");
            sidebar.classList.add("translate-x-0");

            menuIcon.classList.remove("fa-bars");
            menuIcon.classList.add("fa-times");
        }
    });

});

/*document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Sidebar script loaded");

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");
    const menuIcon = document.getElementById("menuIcon");

    if (!menuBtn || !sidebar) {
        console.warn("⚠️ Sidebar elements (#menuBtn, #sidebar) not found. Skipping sidebar setup.");
        return;
    }

    menuBtn.addEventListener("click", (event) => {
        sidebar.classList.toggle("translate-x-full");
        sidebar.classList.toggle("translate-x-0");
    
        if (sidebar.classList.contains("translate-x-0")) {
            menuIcon.classList.remove("fa-bars");
            menuIcon.classList.add("fa-times");
        } else {
            menuIcon.classList.remove("fa-times");
            menuIcon.classList.add("fa-bars");
        }
    
        event.stopPropagation();
    });

    document.addEventListener("click", (event) => {
        if (!sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
    
            sidebar.classList.remove("translate-x-0");
            sidebar.classList.add("translate-x-full");
    
            menuIcon.classList.remove("fa-times");
            menuIcon.classList.add("fa-bars");
        }
    });
});
*/