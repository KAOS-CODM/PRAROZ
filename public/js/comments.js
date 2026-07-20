document.addEventListener("DOMContentLoaded", () => {
    const ui = renderCommentsSection();
    
    if (!ui) return;
    
    const {
        list,
        form,
        nameInput,
        textarea,
        sendBtn,
        count
    } = ui;

    // Extract slug from URL
    const recipeSlug = window.location.pathname
        .split("/")
        .pop()
        .replace(".html", "");

    /*const nameInput = document.getElementById("comment-name");
    const textarea = document.getElementById("comment-text");
    const sendBtn = document.getElementById("send-comment");*/
    const counter =
    document.getElementById("comment-counter");
    
    textarea.addEventListener("input", () => {
    
        const length = textarea.value.length;
    
        counter.textContent = `${length}/500`;
    
        counter.classList.remove(
            "text-slate-500",
            "text-yellow-500",
            "text-red-500"
        );
    
        if (length > 450) {
    
            counter.classList.add("text-red-500");
    
        }
    
        else if (length > 350) {
    
            counter.classList.add("text-yellow-500");
    
        }
    
        else {
    
            counter.classList.add("text-slate-500");
    
        }
    
    });

    function escapeHTML(text) {
    
        const div = document.createElement("div");
    
        div.textContent = text;
    
        return div.innerHTML;
    
    }

    function showToast(message, type = "success") {
    
        let toast = document.getElementById("comment-toast");
    
        if (!toast) {
    
            toast = document.createElement("div");
    
            toast.id = "comment-toast";
    
            toast.className = `
                fixed
                top-6
                right-6
                z-[99999]
                rounded-2xl
                px-6
                py-4
                shadow-2xl
                text-white
                font-semibold
                translate-x-120
                opacity-0
                transition-all
                duration-500
            `;
    
            document.body.appendChild(toast);
        }
    
        toast.classList.remove(
            "bg-green-600",
            "bg-red-600",
            "translate-x-120",
            "opacity-0"
        );
    
        toast.classList.add(
            type === "success"
                ? "bg-green-600"
                : "bg-red-600"
        );
    
        toast.innerHTML = `
            <div class="flex items-center gap-3">
    
                <i class="fas ${
                    type === "success"
                        ? "fa-check-circle"
                        : "fa-circle-xmark"
                }"></i>
    
                <span>${message}</span>
    
            </div>
        `;
    
        requestAnimationFrame(() => {
    
            toast.classList.add(
                "translate-x-0",
                "opacity-100"
            );
    
        });
    
        setTimeout(() => {
    
            toast.classList.remove(
                "translate-x-0",
                "opacity-100"
            );
    
            toast.classList.add(
                "translate-x-120",
                "opacity-0"
            );
    
        }, 3000);
    }

    function formatTime(date) {
    
        const now = new Date();
    
        const diff = Math.floor(
            (now - new Date(date)) / 1000
        );
    
        if (diff < 60)
            return "Just now";
    
        if (diff < 3600)
            return `${Math.floor(diff / 60)} min ago`;
    
        if (diff < 86400)
            return `${Math.floor(diff / 3600)} hrs ago`;
    
        if (diff < 172800)
            return "Yesterday";
    
        if (diff < 604800)
            return `${Math.floor(diff / 86400)} days ago`;
    
        return new Date(date).toLocaleDateString();
    }

    function renderCommentsSection() {
        const container = document.getElementById("comments-section");
    
        if (!container) return null;
    
        container.innerHTML = `
            <section
                class="
                    mt-20
                    max-w-5xl
                    mx-auto
                    rounded-3xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-900
                    shadow-xl
                    overflow-hidden
                " data-reveal="up"
            >
    
                <!-- Header -->
    
                <div
                    class="
                        px-8
                        py-10
                        border-b
                        border-slate-200
                        dark:border-slate-700
                        text-center
                    "
                >
    
                    <div
                        class="
                            inline-flex
                            items-center
                            justify-center
                            w-16
                            h-16
                            rounded-full
                            bg-orange-100
                            dark:bg-orange-900/30
                            text-orange-500
                            text-3xl
                            mb-5
                        "
                    >
                        <i class="fas fa-comments"></i>
                    </div>
    
                    <h2
                        class="
                            text-4xl
                            font-bold
                            text-slate-900
                            dark:text-white
                        "
                    >
                        Community Reviews
                    </h2>
    
                    <p
                        class="
                            mt-3
                            text-slate-600
                            dark:text-slate-400
                            max-w-2xl
                            mx-auto
                            leading-8
                        "
                    >
                        Share your experience with this recipe,
                        leave helpful tips, or let others know
                        how yours turned out.
                    </p>
    
                    <div
                        id="comment-count"
                        class="
                            mt-6
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-orange-100
                            dark:bg-orange-900/30
                            text-orange-600
                            dark:text-orange-300
                            px-5
                            py-2
                            font-semibold
                        "
                    >
                        No Comments Yet
                    </div>
    
                </div>
    
                <!-- Form -->
    
                <div class="p-8">
    
                    <form
                        id="comment-form"
                        class="space-y-5"
                    >
    
                        <input
                            id="comment-name"
                            type="text"
                            placeholder="Your name"
                            required
                            class="
                                hidden
                                opacity-0
                                -translate-y-3
                                max-h-0
                                overflow-hidden
                                w-full
                                rounded-2xl
                                border
                                border-slate-300
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-800
                                px-5
                                py-4
                                outline-none
                                transition-all
                                duration-300
                            "
                        >
    
                        <textarea
                            id="comment-text"
                            rows="4"
                            maxlength="500"
                            placeholder="Share your thoughts..."
                            required
                            class="
                                w-full
                                rounded-2xl
                                border
                                border-slate-300
                                dark:border-slate-700
                                bg-white
                                dark:bg-slate-800
                                px-5
                                py-4
                                resize-none
                                outline-none
                                transition-all
                                duration-300
                                focus:border-orange-500
                                focus:ring-4
                                focus:ring-orange-500/20
                            "
                        ></textarea>
                            
                        <div class="flex items-center justify-between">
                        
                            <span
                                id="comment-counter"
                                class="
                                    text-sm
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >
                                0 / 500
                            </span>
    
                            <button
                                id="send-comment"
                                disabled
                                type="submit"
                                class="
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    bg-orange-500
                                    px-6
                                    py-3
                                    font-semibold
                                    text-white
                                    shadow-lg
                                    transition-all
                                    duration-300
                                    hover:bg-orange-600
                                    hover:-translate-y-1
                                    disabled:opacity-50
                                    disabled:pointer-events-none
                                "
                            >
    
                                <i class="fas fa-paper-plane"></i>
    
                                Submit Comment
    
                            </button>
    
                        </div>
    
                    </form>
    
                </div>
    
                <!-- Comments -->
    
                <div
                    id="comments-list"
                    class="
                        border-t
                        border-slate-200
                        dark:border-slate-700
                        p-8
                        space-y-6
                    "
                >
    
                </div>
    
            </section>
        `;
    
        return {
            form: document.getElementById("comment-form"),
            list: document.getElementById("comments-list"),
            nameInput: document.getElementById("comment-name"),
            textarea: document.getElementById("comment-text"),
            sendBtn: document.getElementById("send-comment"),
            count: document.getElementById("comment-count")
        };
    }

    function createAvatar(name = "User") {
        const initials = name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(word => word[0].toUpperCase())
            .join("");
    
        return `
            <div
                class="
                    flex
                    items-center
                    justify-center
                    w-14
                    h-14
                    rounded-full
                    bg-orange-500
                    text-white
                    font-bold
                    text-lg
                    shadow-md
                    shrink-0
                "
            >
                ${initials}
            </div>
        `;
    }

    function showSkeleton() {
    
        list.innerHTML = Array(3)
            .fill("")
            .map(() => `
                <div
                    class="
                        animate-pulse
                        rounded-3xl
                        border
                        border-slate-200
                        dark:border-slate-700
                        p-6
                        flex
                        gap-5
                    "
                >
    
                    <div
                        class="
                            w-14
                            h-14
                            rounded-full
                            bg-slate-300
                            dark:bg-slate-700
                        "
                    ></div>
    
                    <div class="flex-1">
    
                        <div
                            class="
                                h-5
                                w-40
                                rounded
                                bg-slate-300
                                dark:bg-slate-700
                                mb-4
                            "
                        ></div>
    
                        <div
                            class="
                                h-4
                                rounded
                                bg-slate-300
                                dark:bg-slate-700
                                mb-2
                            "
                        ></div>
    
                        <div
                            class="
                                h-4
                                w-4/5
                                rounded
                                bg-slate-300
                                dark:bg-slate-700
                            "
                        ></div>
    
                    </div>
    
                </div>
            `)
            .join("");
    }

    function showEmptyState() {
    
        list.innerHTML = `
    
            <div
                class="
                    py-16
                    text-center
                "
            >
        
                <h3
                    class="
                        text-2xl
                        font-bold
                        text-slate-800
                        dark:text-white
                    "
                >
                    <i class="fas fa-comments text-6xl text-orange-400 animate-bounce"></i>
                </h3>
    
                <p
                    class="
                        mt-3
                        text-slate-500
                        dark:text-slate-400
                    "
                >
                    Be the first to share your cooking experience.
                </p>
    
            </div>
    
        `;
    }


    function loadComments() {
    
        showSkeleton();
    
        fetch(`/api/comments/${recipeSlug}`)
            .then(res => res.json())
            .then(data => {
    
                count.textContent =
                    `${data.length} ${data.length === 1 ? "Comment" : "Comments"}`;
    
                if (!data.length) {
    
                    showEmptyState();
    
                    return;
                }
    
                list.innerHTML = "";
                
                data.forEach((comment, index) => {
                
                    setTimeout(() => {
                
                        list.insertAdjacentHTML(
                            "beforeend",
                            renderComment(comment)
                        );
                
                    }, index * 120);
                
                });
    
            })
            .catch(() => {
            
                list.innerHTML = `
                    <div class="
                        py-16
                        text-center
                        text-red-500
                    ">
                        Failed to load comments.
                    </div>
                `;
            
            });
            // setTimeout(() => {
            // 
            //     list.firstElementChild?.scrollIntoView({
            //         behavior:"smooth",
            //         block:"nearest"
            //     });
            // 
            // },500);
    
    }


    function renderComment(comment) {
    
        return `
    
            <article
                class="
                    group
                    rounded-3xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-900
                    shadow-lg
                    p-6
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                "
            >
    
                <div class="flex gap-5">
    
                    ${createAvatar(comment.name)}
    
                    <div class="flex-1">
    
                        <div
                            class="
                                flex
                                flex-wrap
                                items-center
                                gap-3
                                mb-3
                            "
                        >
    
                            <h3
                                class="
                                    font-bold
                                    text-lg
                                    text-slate-900
                                    dark:text-white
                                "
                            >
                                ${escapeHTML(comment.name)}
                            </h3>
    
                            <span
                                class="
                                    text-sm
                                    text-slate-400
                                "
                            >
                                •
                            </span>
    
                            <time
                                class="
                                    text-sm
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >
                                ${formatTime(comment.created_at)}
                            </time>
    
                        </div>
    
                        <p
                            class="
                                leading-8
                                text-slate-700
                                dark:text-slate-300
                            "
                        >
                            ${escapeHTML(comment.comment)}
                        </p>
    
                    </div>
    
                </div>
    
            </article>
    
        `;
    }

    // -------------------------
    // Show Name Input
    // -------------------------
    function showNameInput() {
    
        nameInput.classList.remove("hidden");
    
        requestAnimationFrame(() => {
    
            nameInput.classList.remove(
                "opacity-0",
                "-translate-y-3",
                "max-h-0"
            );
    
            nameInput.classList.add(
                "opacity-100",
                "translate-y-0",
                "max-h-20"
            );
    
        });
    
    }

    // -------------------------
    // Hide Name Input
    // -------------------------
    function hideNameInput() {
    
        nameInput.classList.remove(
            "opacity-100",
            "translate-y-0",
            "max-h-20"
        );
    
        nameInput.classList.add(
            "opacity-0",
            "-translate-y-3",
            "max-h-0"
        );
    
        setTimeout(() => {
    
            nameInput.classList.add("hidden");
    
        },300);
    
    }

    textarea.addEventListener("focus", showNameInput);

    textarea.addEventListener("blur", () => {
        setTimeout(() => {
            if (
                !textarea.value.trim() &&
                !nameInput.value.trim()
            ) {
                hideNameInput();
            }
        }, 200);
    });

    // -------------------------
    // Enable / Disable Send Button
    // -------------------------
    function toggleSendButton() {
        sendBtn.disabled = !(
            textarea.value.trim() &&
            nameInput.value.trim()
        );
        
    }

    textarea.addEventListener("input", toggleSendButton);
    nameInput.addEventListener("input", toggleSendButton);
    
    // Initial button state
    sendBtn.disabled = true;
    
    sendBtn.innerHTML = `
        <i class="fas fa-paper-plane"></i>
        Submit Comment
    `;
    
    // -------------------------
    // Submit Comment
    // -------------------------
    form.addEventListener("submit", e => {
        e.preventDefault();
    
        const name = nameInput.value.trim();
        const comment = textarea.value.trim();
    
        // Prevent double submissions
        sendBtn.disabled = true;
    
        sendBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Posting...
        `;

        textarea.disabled = true;
        nameInput.disabled = true;
    
        fetch("/api/comments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                slug: recipeSlug,
                name,
                comment
            })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Failed to post");
            }
            return res.json();
        })
        .then(() => {
    
            showToast(
                "🎉 Thanks for sharing your recipe experience!"
            );
    
            form.reset();
    
            hideNameInput();
    
            counter.textContent = "0 / 500";
            counter.className = "text-sm text-slate-500 dark:text-slate-400";
    
            sendBtn.innerHTML = `
                <i class="fas fa-paper-plane"></i>
                Submit Comment
            `;

            textarea.disabled = false;
            nameInput.disabled = false;
    
            sendBtn.disabled = true;
    
            loadComments();
    
            textarea.focus();
        })
        .catch(() => {
    
            showToast(
                "Unable to post comment.",
                "error"
            );
            textarea.disabled = false;
            nameInput.disabled = false;
    
            sendBtn.disabled = false;
    
            sendBtn.innerHTML = `
                <i class="fas fa-paper-plane"></i>
                Submit Comment
            `;
        });
    });
    
    loadComments();
});