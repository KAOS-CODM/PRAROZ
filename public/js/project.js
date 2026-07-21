function normalizeImageUrlMaybe(imageUrl) {
    if (!imageUrl) return imageUrl;
    if (!/^https?:\/\//i.test(imageUrl)) {
        return `${window.API_BASE_URL}/${imageUrl}`;
    }
    return imageUrl;
}

function slugFromRecipeName(name) {
    return (name || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
}

function getRecipeSkeletonHtml(count) {
    const skeletonCards = Array.from({ length: count }).map((_, i) => {
        const delay = i * 70;
        return `
            <div
                class="group"
                data-reveal="up"
                style="transition-delay:${delay}ms"
                aria-hidden="true"
            >
                <article
                    class="overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-sm transition-all duration-500 dark:border-slate-800 dark:bg-slate-900"
                >
                    <div class="relative">
                        <div class="h-56 w-full bg-slate-100 dark:bg-slate-800"></div>
                        <div class="absolute inset-0 bg-linear-to-t from-slate-900/20 to-transparent" style="opacity:0.35"></div>
                    </div>
                    <div class="p-5">
                        <div class="mb-3 h-5 w-32 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                        <div class="mb-2 h-6 w-4/5 rounded bg-slate-100 dark:bg-slate-800"></div>
                        <div class="mb-5 h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800"></div>
                        <div class="mt-auto flex items-center justify-between">
                            <div class="h-4 w-28 rounded bg-slate-100 dark:bg-slate-800"></div>
                            <div class="h-4 w-8 rounded bg-slate-100 dark:bg-slate-800"></div>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }).join("");

    return `
        <div class="space-y-10">
            <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div class="flex items-center gap-3">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Recipes</h2>
                    <span class="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600 dark:bg-orange-500 dark:text-orange-300">Loading</span>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                ${skeletonCards}
            </div>
        </div>
    `;
}

function renderRecipeSectionHtml({ recipes, page, revealBaseDelayMs }) {
    if (!recipes.length) {
        return `
            <div class="py-16">
                ${renderEmptyStateHtml({
                    message: `No recipes found for ${formatCategoryName(page)} yet.`,
                    buttonText: "Back to home",
                    buttonHref: "/"
                })}
            </div>
        `;
    }

    const categorySlug = (page || "").toLowerCase();

    const cards = recipes.map((recipe, idx) => {
        let imageUrl = recipe.image;
        imageUrl = normalizeImageUrlMaybe(imageUrl);

        const recipeSlug = slugFromRecipeName(recipe.name);
        const url = `/recipes/${encodeURIComponent(categorySlug)}/${encodeURIComponent(recipeSlug)}`;

        const delay = revealBaseDelayMs + idx * 70;
        const safeName = recipe.name || "Recipe";

        return `
            <a href="${url}" class="group" data-reveal="up" style="transition-delay:${delay}ms">
                <article
                    class="h-full overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                    <div class="relative">
                        <div class="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90"></div>

                        <img
                            src="${imageUrl}"
                            alt="PraRoz - ${escapeHtmlAttr(safeName)}"
                            loading="lazy"
                            class="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            data-fallback="true"
                        />

                        <div class="absolute left-4 top-4">
                            <span class="inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
                                ${inferCategoryChipText(page)}
                            </span>
                        </div>
                    </div>

                    <div class="p-6">
                        <h3 class="text-xl font-semibold leading-7 text-slate-900 transition-colors duration-300 group-hover:text-orange-600 dark:text-white">
                            ${escapeHtml(safeName)}
                        </h3>

                        <div class="mt-3 flex items-center justify-between gap-3">
                            <span class="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 transition-colors duration-300 group-hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-300">
                                View recipe
                                <i class="fas fa-arrow-right"></i>
                            </span>

                            <span class="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                <span class="inline-flex items-center gap-2">
                                    <i class="fa-solid fa-star text-amber-500"></i>
                                    <span>Popular</span>
                                </span>
                            </span>
                        </div>
                    </div>
                </article>
            </a>
        `;
    }).join("");

    return `
        <div class="space-y-10">
            <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div class="flex items-center gap-3">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Recipes</h2>
                    <span class="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600 dark:bg-orange-500 dark:text-orange-300">
                        ${recipes.length} ${recipes.length === 1 ? 'Recipe' : 'Recipes'}
                    </span>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                ${cards}
            </div>
        </div>
    `;
}

function renderEmptyStateHtml({ message, buttonText, buttonHref }) {
    return `
        <div class="mx-auto flex max-w-xl flex-col items-center rounded-[1.25rem] border border-stone-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div class="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                <i class="fa-solid fa-bowl-food text-2xl"></i>
            </div>

            <h3 class="text-2xl font-semibold text-slate-900 dark:text-white">Nothing here yet</h3>
            <p class="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">${escapeHtml(message)}</p>

            <a
                href="${buttonHref}"
                class="mt-6 inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-500/30"
            >
                ${escapeHtml(buttonText)}
            </a>

            <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Try exploring other categories or check back soon.
            </p>
        </div>
    `;
}

function renderCategoryHeroHtml({ page, title, description, image }) {
    const categoryName = formatCategoryName(page);
    const heroImageUrl = normalizeImageUrlMaybe(image);

    return `
        <section
            class="relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900"
            data-reveal="up"
        >
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_40%)]"></div>
            <div class="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl dark:bg-orange-500/10"></div>

            <div class="relative grid gap-10 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-14">
                <div class="space-y-7">
                    <div class="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 dark:border-orange-500 dark:bg-orange-500 dark:text-gray-300">
                        <i class="fa-solid fa-fire"></i>
                        ${escapeHtml(categoryName)} • Premium recipes
                    </div>

                    <div class="space-y-4">
                        <h1 class="text-4xl font-black leading-[0.95] text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                            ${escapeHtml(title || categoryName)}
                        </h1>

                        <p class="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                            ${escapeHtml(description || '')}
                        </p>
                    </div>

                    <div class="flex flex-wrap gap-2 text-sm">
                        <span class="rounded-full border border-stone-200 bg-white px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            Step-by-step clarity
                        </span>
                        <span class="rounded-full border border-stone-200 bg-white px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            Cozy, everyday flavors
                        </span>
                        <span class="rounded-full border border-stone-200 bg-white px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            Built to impress
                        </span>
                    </div>
                </div>

                <div class="relative overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 h-fit">
                    <div class="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-70"></div>
                    <img
                        src="${heroImageUrl}"
                        alt="${escapeHtml(title || categoryName)}"
                        class="h-72 w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                        loading="eager"
                        data-fallback="true"
                    />

                    <div class="relative p-6">
                        <div class="flex items-center justify-between gap-3">
                            <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700 dark:bg-orange-500 dark:text-orange-300">
                                Explore ${escapeHtml(categoryName)}
                            </span>
                            <span class="text-sm font-semibold text-slate-500 dark:text-slate-300">
                                Curated selection
                            </span>
                        </div>

                        <h2 class="mt-4 text-2xl font-semibold text-white">
                            <span class="text-white">Find</span> your next favorite.
                        </h2>

                        <p class="mt-2 text-sm leading-7 text-slate-200">
                            Browse the recipes below—premium flavors, modern presentation.
                        </p>

                        <a
                            href="/explore"
                            class="mt-5 inline-flex items-center justify-center rounded-full border border-white/30 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                            Browse all recipes
                            <i class="fa-solid fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <div
            class="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900"
            data-reveal="up"
        >
            <div class="flex items-end justify-between gap-4">
                <div>
                    <p class="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600 dark:text-orange-400">
                        Discover
                    </p>
        
                    <h2 class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                        Browse & save your next meal
                    </h2>
        
                    <p class="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
                        Explore delicious recipes from every category, save your favourites,
                        and discover your next family meal.
                    </p>
                </div>
        
                <a
                    href="/explore"
                    class="rounded-xl bg-gray-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                    See all
                </a>
            </div>
        </div>
    `;
}

function formatCategoryName(page) {
    if (!page) return '';
    return page.charAt(0).toUpperCase() + page.slice(1);
}

function inferCategoryChipText(page) {
    const p = (page || '').toLowerCase();
    const map = {
        desserts: 'Dessert',
        pizza: 'Pizza',
        pasta: 'Pasta',
        salad: 'Salad',
        burger: 'Burger',
        appetizers: 'Appetizers'
    };
    return map[p] || formatCategoryName(page);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#039;');
}

function escapeHtmlAttr(str) {
    return escapeHtml(str);
}

function renderPagination(pagination) {
    const container = document.getElementById("pagination");
    if (!container) return;
    
    // Handle both possible property names
    const current = pagination.page || 1;
    const total = pagination.totalPages;
    const hasPrev = pagination.hasPrev !== undefined ? pagination.hasPrev : pagination.hasPrevPage;
    const hasNext = pagination.hasNext !== undefined ? pagination.hasNext : pagination.hasNextPage;
    
    if (total <= 1) {
        container.innerHTML = "";
        return;
    }

    const pages = [];

    // Always show first page
    pages.push(1);

    // Calculate the range around current page
    let startPage = Math.max(2, current - 2);
    let endPage = Math.min(total - 1, current + 2);
    
    // Add left dots if there's a gap between page 1 and startPage
    //Only add if startPage > 2 (meaning there are pages between 1 and startPage)
    if (startPage > 2) {
        pages.push("...");
    }

    // Add pages in the range
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    // Add right dots if there's a gap between endPage and startPage
    //Only add if endPage < total - 1 (meaning there are pages between endPage and total)
    if (endPage < total - 1) {
        pages.push("...");
    }

    // Always show last page if total > 1 and not already included
    if (total > 1 && pages[pages.length - 1] !== total) {
        pages.push(total);
    }

    // Remove duplicates if first page is also in the range
    const uniquePages = [];
    for (let i = 0; i < pages.length; i++) {
        if (pages[i] !== pages[i-1]) {
            uniquePages.push(pages[i]);
        }
    }

    const pageLink = (page, active = false) => `
        <a href="?page=${page}" 
           class="h-11 min-w-11 px-4 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 ${
               active 
               ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105" 
               : "border border-stone-200 bg-white text-slate-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
           }">
            ${page}
        </a>
    `;

    const disabledBtn = `opacity-40 pointer-events-none`;

    let html = `
        <nav class="mt-12 flex justify-center" aria-label="Pagination">
            <div class="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    `;

    // Previous button
    const prevDisabled = !hasPrev ? disabledBtn : "";
    html += `
        <a href="?page=${Math.max(current - 1, 1)}" 
           class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${prevDisabled} ${hasPrev ? 'hover:bg-orange-500 hover:text-white' : ''}">
            <i class="fas fa-chevron-left"></i>
        </a>
    `;

    // Page numbers
    uniquePages.forEach(page => {
        if (page === "...") {
            html += `
                <span class="w-10 text-center text-slate-400">...</span>
            `;
        } else {
            html += pageLink(page, page === current);
        }
    });

    // Next button
    const nextDisabled = !hasNext ? disabledBtn : "";
    html += `
        <a href="?page=${Math.min(current + 1, total)}" 
           class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-500 hover:text-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${nextDisabled} ${hasNext ? 'hover:bg-orange-500 hover:text-white' : ''}">
            <i class="fas fa-chevron-right"></i>
        </a>
    `;

    html += `
            </div>
        </nav>
    `;

    container.innerHTML = html;

    // Update URL without reload
    const url = new URL(window.location);
    if (Number(url.searchParams.get("page") || 1) !== current) {
        url.searchParams.set("page", current);
        window.history.replaceState({}, "", url);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded!");
    const page = window.location.pathname.split('/').pop().replace('.html', '');
    console.log("Detected page:", page);

    const recipeContainer = document.getElementById('recipe-container');

    // --- Recipes ---
    if (recipeContainer) {
        // Loading skeleton (premium card layout)
        recipeContainer.innerHTML = getRecipeSkeletonHtml(8);

        // Get the current page from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = parseInt(urlParams.get('page')) || 1;
        
        const queryCategory = page && page !== "explore" ? page : "";
        
        const url = queryCategory
            ? `${window.API_BASE_URL}/recipes?category=${encodeURIComponent(queryCategory)}&page=${currentPage}&limit=12`
            : `${window.API_BASE_URL}/recipes?page=${currentPage}&limit=12`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const recipes = data.recipes;
                const pagination = data.pagination;
            
                // Keep URL in sync - only update if different
                const params = new URLSearchParams(window.location.search);
                const currentUrlPage = parseInt(params.get("page")) || 1;
                
                if (currentUrlPage !== pagination.page) {
                    params.set("page", pagination.page);
                    history.replaceState(
                        {},
                        "",
                        `${window.location.pathname}?${params.toString()}`
                    );
                }
            
                recipeContainer.innerHTML = renderRecipeSectionHtml({
                    recipes,
                    page,
                    revealBaseDelayMs: 0
                });
            
                renderPagination(pagination);
            })
            .catch(error => {
                console.error("Error fetching recipes:", error);
                recipeContainer.innerHTML = renderEmptyStateHtml({
                    message: "We couldn’t load recipes right now. Please try again in a moment.",
                    buttonText: "Back to home",
                    buttonHref: "/"
                });
            });
    } else {
        console.log('No recipe container found on this page; skipping recipe fetch.');
    }

    // --- Category content (hero) ---
    fetch(`${window.API_BASE_URL}/data/contents`, {
        headers: { "x-api-key": "yemite01" }
    })
        .then(response => response.json())
        .then(data => {
            const content = data[page];
            const contentContainer = document.getElementById('content');
            const desc = content?.description?.join("") || "";

            if (!contentContainer) {
                console.error("ERROR: #content NOT found in html");
                return;
            }

            if (content) {
                contentContainer.innerHTML = renderCategoryHeroHtml({
                    page,
                    title: content.title,
                    description: desc,
                    image: content.image
                });
            } else {
                contentContainer.innerHTML = '<p>No content found for this category.</p>';
            }
        })
        .catch(error => console.error("Error fetching content:", error));

    

    // Add event delegation for pagination clicks
    /*document.addEventListener('click', function(e) {
        const paginationLink = e.target.closest('#pagination a[href*="page="]');
        if (paginationLink) {
            e.preventDefault();
            const url = new URL(paginationLink.href);
            const page = url.searchParams.get('page');
            
            if (page) {
                // Update URL without reload
                const currentUrl = new URL(window.location);
                currentUrl.searchParams.set('page', page);
                window.history.pushState({}, '', currentUrl);
                
                // Re-fetch recipes with new page
                fetchRecipes(page);
            }
        }
    });
    
    // Separate function to fetch recipes
    function fetchRecipes(page) {
        const recipeContainer = document.getElementById('recipe-container');
        if (!recipeContainer) return;
        
        recipeContainer.innerHTML = getRecipeSkeletonHtml(8);
        
        const pagePath = window.location.pathname.split('/').pop().replace('.html', '');
        const queryCategory = pagePath && pagePath !== "explore" ? pagePath : "";
        
        const url = queryCategory
            ? `${window.API_BASE_URL}/recipes?category=${encodeURIComponent(queryCategory)}&page=${page}&limit=12`
            : `${window.API_BASE_URL}/recipes?page=${page}&limit=12`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const recipes = data.recipes;
                const pagination = data.pagination;
                
                recipeContainer.innerHTML = renderRecipeSectionHtml({
                    recipes,
                    page: pagePath,
                    revealBaseDelayMs: 0
                });
                
                renderPagination(pagination);
            })
            .catch(error => {
                console.error("Error fetching recipes:", error);
                recipeContainer.innerHTML = renderEmptyStateHtml({
                    message: "We couldn’t load recipes right now. Please try again in a moment.",
                    buttonText: "Back to home",
                    buttonHref: "/"
                });
            });
    }*/
});

