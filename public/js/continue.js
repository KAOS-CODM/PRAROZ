document.addEventListener("DOMContentLoaded", () => {
    const continueBtn = document.getElementById("continue-btn");
    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            localStorage.setItem("lastLandingTime", Date.now());
            window.location.href = "/explore";
        });
    }
});
