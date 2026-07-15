document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("navbar-container");

    if (!container) return;

    try {
        const res = await fetch(`${window.API_BASE_URL}/data/contents`, {
            headers: {
                "x-api-key": "yemite01"
            }
        });

        const activeClasses = `
        relative
        text-orange-500
        font-semibold
        transition-all
        duration-300
        after:absolute
        after:left-0
        after:-bottom-2
        after:h-[2px]
        after:w-full
        after:bg-orange-500
        `;
        
        const normalClasses = `
        relative
        text-slate-700
        dark:text-slate-200
        font-medium
        transition-all
        duration-300
        hover:text-orange-500
        hover:-translate-y-0.5
        `;

        const data = await res.json();

        const currentPage = window.location.pathname;

        const navLinks = data.navbar.links
            .map(link => {
        
                const normalizedCurrent =
                    currentPage !== "/" && currentPage.endsWith("/")
                        ? currentPage.slice(0, -1)
                        : currentPage;
        
                const normalizedLink =
                    link.url !== "/" && link.url.endsWith("/")
                        ? link.url.slice(0, -1)
                        : link.url;
        
                const active = normalizedCurrent === normalizedLink;
        
                return `
                    <li>
                        <a
                            href="${link.url}"
                            class="${
                                active
                                    ? activeClasses
                                    : normalClasses
                            }"
                        >
                            ${
                                active
                                    ? `<i class="${link.icon} mr-2"></i>`
                                    : ""
                            }
                            ${link.name}
                        </a>
                    </li>
                `;
            })
            .join("");

            const sidebarLinks = data.navbar.links
                .map(link => {
            
                    const normalizedCurrent =
                        currentPage !== "/" && currentPage.endsWith("/")
                            ? currentPage.slice(0, -1)
                            : currentPage;
            
                    const normalizedLink =
                        link.url !== "/" && link.url.endsWith("/")
                            ? link.url.slice(0, -1)
                            : link.url;
            
                    const active = normalizedCurrent === normalizedLink;
            
                    return `
                        <a
                            href="${link.url}"
                            class="
                                flex
                                items-center
                                gap-4
                                rounded-xl
                                px-4
                                py-4
                                transition-all
                                duration-300
                                ${
                                    active
                                        ? "bg-orange-500 text-white"
                                        : "text-slate-700 dark:text-slate-200 hover:bg-orange-500 hover:text-white hover:translate-x-2"
                                }
                            "
                        >
                            <i class="${link.icon} w-5"></i>
                            ${link.name}
                        </a>
                    `;
                })
                .join("");

        container.innerHTML = `

            <nav
                class="
                max-w-screen
                relative
                flex
                items-start
                justify-center
                flex-wrap

                z-1002

                bg-white/90
                dark:bg-slate-900/90

                border-b
                border-slate-200
                dark:border-slate-700

                shadow-lg

                transition-all
                duration-300

                h-fit
                max-h-fit

                lg:flex-col
                lg:p-10
                lg:justify-center

                md:flex-col
                md:p-2
            ">

                <div
                    class="
                    max-w-7xl
                    mx-auto
                    h-20
                    px-6
                    flex
                    items-center
                    justify-between
                ">

                    <a
                        href="/"
                        class="
                        flex
                        items-center
                        gap-3
                        group
                    ">

                        <img
                            id="nav-logo"
                            src="/images/logo.webp"
                            alt="PraRoz™ Logo"
                            class="
                            w-14
                            transition-transform
                            duration-300
                            group-hover:scale-110

                            bg-slate-900/90
                        ">

                        <div>

                            <h2
                                class="
                                text-2xl
                                font-bold
                                tracking-wide
                                text-orange-500
                            ">
                                PraRoz
                            </h2>

                            <p
                                class="
                                text-xs
                                text-slate-500
                                dark:text-slate-400
                                tracking-wider
                                uppercase
                            ">
                                Recipes Made Simple
                            </p>

                        </div>

                    </a>

                    <ul
                        id="nav-links"
                        class="
                        hidden
                        lg:flex
                        items-center
                        gap-8
                    ">

                        ${navLinks}

                    </ul>

                    <button
                        id="menuBtn"
                        class="
                        absolute
                        top-5
                        right-5

                        z-50

                        h-11
                        w-11

                        flex
                        items-center
                        justify-center

                        rounded-xl

                        bg-white
                        dark:bg-slate-800

                        border
                        border-slate-300
                        dark:border-slate-700

                        shadow-md

                        transition-all
                        duration-300

                        hover:bg-orange-500
                        hover:text-white
                        hover:scale-105

                        cursor-pointer
                        "
                        aria-label="Toggle Menu"
                    >

                        <i
                            id="menuIcon"
                            class="fas fa-bars text-lg">
                        </i>

                    </button>

                </div>

<aside
id="sidebar"
class="
fixed
top-0
right-0

h-screen
w-72

translate-x-full

transition-transform
duration-300

bg-white
dark:bg-slate-900

border-l
border-slate-700/20

shadow-2xl

overflow-y-auto

">

<div
class="
flex
justify-center
items-center
py-8
border-b
border-slate-200
dark:border-slate-700
bg-linear-to-r
from-orange-500
to-orange-600
">

<img

id="sidebar-logo"

src="/images/logo.webp"

alt="PraRoz™ Logo"

class="w-24">

</div>

<div class="p-5 space-y-2">

${sidebarLinks}

<hr class="my-4 border-slate-200 dark:border-slate-700">

<a
href="#"
class="
flex
items-center
gap-4
rounded-xl
px-4
py-4
font-medium
text-slate-700
dark:text-slate-200
transition-all
duration-300
hover:bg-orange-500
hover:text-white
hover:translate-x-2
">
<i class="fas fa-circle-play w-5"></i>
WATCH VIDEO

</a>

<a
href="#"
class="
flex
items-center
gap-4
rounded-xl
px-4
py-4
font-medium
text-slate-700
dark:text-slate-200
transition-all
duration-300
hover:bg-orange-500
hover:text-white
hover:translate-x-2
">

<i class="fas fa-utensils w-5"></i>

BASIC SKILLS

</a>

<a
href="#"
class="
flex
items-center
gap-4
rounded-xl
px-4
py-4
font-medium
text-slate-700
dark:text-slate-200
transition-all
duration-300
hover:bg-orange-500
hover:text-white
hover:translate-x-2
">

<i class="fas fa-book-open w-5"></i>

LEARN MORE

</a>

<a
href="/submit"
class="
flex
items-center
gap-4
rounded-xl
px-4
py-4
font-medium
text-white
bg-orange-500
transition-all
duration-300
hover:bg-orange-600
hover:translate-x-2
">

<i class="fas fa-plus-circle w-5"></i>

SUBMIT YOUR RECIPE

</a>

</div>

</aside>

</nav>
`;
        /*
            sidebar.js already waits for DOMContentLoaded,
            so we manually dispatch another event after
            inserting the navbar.
        */
        document.dispatchEvent(new Event("navbarLoaded"));

    } catch (err) {

        console.error("Navbar failed:", err);

    }
});