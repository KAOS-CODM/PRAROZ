document.addEventListener("DOMContentLoaded", function () {
    const popupContainer = document.getElementById("popupContainer");
    if (!popupContainer) {
        console.warn("⚠️ #popupContainer not found. Skipping popup setup.");
        return;
    }

    // Inject the popup HTML directly
    popupContainer.innerHTML = `
    <div
        id="popupForm"
        class="
            fixed
            inset-0
            hidden
            items-center
            justify-center
            bg-black/60
            backdrop-blur-md
            z-9999
            px-5
            transition-opacity
            duration-300
        "
    >
    
        <div
            class="
                relative
                w-full
                max-w-md
                rounded-3xl
                bg-white
                dark:bg-slate-900
                shadow-2xl
                border
                border-slate-200
                dark:border-slate-700
                p-8
                animate-[popup_.35s_ease]
            "
        >
    
            <button
                class="
                    close-btn
                    absolute
                    top-5
                    right-5
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                    dark:bg-slate-800
                    text-xl
                    text-slate-600
                    dark:text-slate-300
                    transition-all
                    duration-300
                    hover:bg-orange-500
                    hover:text-white
                "
            >
                &times;
            </button>
    
            <div class="flex justify-center mb-5">
    
                <div
                    class="
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-full
                        bg-orange-100
                        dark:bg-orange-900/30
                        text-orange-500
                        text-4xl
                    "
                >
                    <i class="fas fa-shield-alt"></i>
                </div>
    
            </div>
    
            <h2
                class="
                    text-2xl
                    font-bold
                    text-center
                    text-slate-800
                    dark:text-white
                "
            >
                Human Verification
            </h2>
    
            <p
                class="
                    mt-3
                    mb-7
                    text-center
                    text-slate-600
                    dark:text-slate-400
                    leading-7
                "
            >
                Please complete the verification below to continue browsing PraRoz
                safely and help us prevent spam and automated traffic.
            </p>
    
            <div class="flex justify-center">
    
                <div
                    id="g-recaptcha"
                    class="g-recaptcha"
                    data-sitekey="6LcU5_wqAAAAAN2OhinShvAfOcNAZRzBduC8kqbY"
                    data-callback="onHumanVerified">
                </div>
    
            </div>
    
        </div>
    
    </div>
    `;

    const popup = document.getElementById("popupForm");
    const closeBtn = popup.querySelector(".close-btn");
    const popupDelay = 5000; // 5 seconds
    window.onHumanVerified = function () {
        console.log("✅ Human verified");
        console.log(popup);
        console.log(getComputedStyle(popup).display);
    
        sessionStorage.setItem("humanVerified", "true");
    
        popup.classList.add("opacity-0");
    
        setTimeout(() => {
            popup.classList.remove("flex");
            popup.classList.add("hidden");
            popup.classList.remove("opacity-0");
        }, 300);
    };

    function showPopup() {
        popup.classList.remove("hidden");
        popup.classList.add("flex");
        popup.classList.remove("opacity-0");
    }

    // Show only once per session
    if (!sessionStorage.getItem("humanVerified")) {
        setTimeout(showPopup, popupDelay);
    }

    // Close events
    closeBtn.addEventListener("click", () => {
        popup.style.display = "none";
    });
    
    window.addEventListener("click", (event) => {
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });
});
