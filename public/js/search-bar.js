document.addEventListener('DOMContentLoaded', () => {
    // Get the search input and results div directly from the HTML
    const input = document.getElementById('search-input');
    const resultsDiv = document.getElementById('search-results');
    const clearBtn = document.getElementById('clear-search');
    
    // If no search input exists, exit
    if (!input) return;

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const category = pathParts.length > 0 ? decodeURIComponent(pathParts[0]) : '';

    // Debounce function to prevent too many API calls
    let debounceTimer;

    input.addEventListener('input', async () => {
        clearTimeout(debounceTimer);
        const query = input.value.trim();

        // Show/hide clear button
        if (clearBtn) {
            clearBtn.classList.toggle('hidden', query.length === 0);
        }

        debounceTimer = setTimeout(async () => {
            if (query.length === 0) {
                resultsDiv.classList.add('hidden');
                // Reload original recipes
                loadRecipes(1);
                return;
            }

            try {
                resultsDiv.classList.remove('hidden');
                resultsDiv.innerHTML = `
                    <div class="p-4 text-center text-slate-500 dark:text-slate-400">
                        <i class="fas fa-spinner fa-spin mr-2"></i> Searching...
                    </div>
                `;

                const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`, {
                    headers: { "x-api-key": "yemite01" }
                });
                const data = await res.json();

                if (!Array.isArray(data) || data.length === 0) {
                    resultsDiv.innerHTML = `
                        <div class="p-6 text-center text-slate-500 dark:text-slate-400">
                            <i class="fas fa-utensils text-2xl mb-2 block"></i>
                            <p class="text-sm">No recipes found for "<strong>${escapeHtml(query)}</strong>"</p>
                            <p class="text-xs mt-1 text-slate-400 dark:text-slate-500">Try adjusting your search terms</p>
                        </div>
                    `;
                    return;
                }

                // Update the recipe container with search results
                const recipeContainer = document.getElementById('recipe-container');
                if (recipeContainer) {
                    // Use the renderRecipeSectionHtml function from project.js
                    const page = window.location.pathname.split('/').pop().replace('.html', '');
                    recipeContainer.innerHTML = renderRecipeSectionHtml({
                        recipes: data,
                        page: page,
                        revealBaseDelayMs: 0
                    });
                    
                    // Hide pagination when searching
                    const paginationContainer = document.getElementById('pagination');
                    if (paginationContainer) {
                        paginationContainer.innerHTML = '';
                    }
                }

                // Also show results in dropdown
                resultsDiv.innerHTML = data.map(recipe => {
                    const categorySlug = (recipe.category || '').toLowerCase();
                    const recipeSlug = (recipe.name || '').toLowerCase().replace(/\s+/g, '-');
                    const url = `/recipes/${encodeURIComponent(categorySlug)}/${encodeURIComponent(recipeSlug)}`;

                    return `
                        <a href="${url}" 
                           class="flex items-center gap-4 p-3 border-b border-stone-100 hover:bg-orange-50 transition-all duration-200 dark:border-slate-700 dark:hover:bg-slate-800 last:border-b-0">
                            <img src="${recipe.image || '/images/thumbnail/praroz-thumbnail.png'}" 
                                 alt="${recipe.name}" 
                                 data-fallback="true"
                                 class="w-14 h-14 object-cover rounded-lg shrink-0"
                            />
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">${escapeHtml(recipe.name)}</p>
                                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHtml(recipe.description || '')}</p>
                                <span class="inline-block mt-1 text-xs text-orange-500 font-medium">${escapeHtml(recipe.category || '')}</span>
                            </div>
                            <i class="fas fa-chevron-right text-slate-300 dark:text-slate-600"></i>
                        </a>
                    `;
                }).join('');

            } catch (err) {
                console.error(err);
                resultsDiv.innerHTML = `
                    <div class="p-4 text-center text-red-500 dark:text-red-400">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Error fetching results. Please try again.
                    </div>
                `;
            }
        }, 300); // 300ms debounce delay
    });

    // Clear search
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.classList.add('hidden');
            resultsDiv.classList.add('hidden');
            loadRecipes(1);
            input.focus();
        });
    }

    // Click outside to close results
    document.addEventListener('click', (e) => {
        const searchContainer = document.querySelector('.mb-8.w-full');
        if (searchContainer && !searchContainer.contains(e.target)) {
            resultsDiv.classList.add('hidden');
        }
    });

    // Escape key to close
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resultsDiv.classList.add('hidden');
            input.blur();
        }
    });

    // Helper function to load recipes (reuse from project.js)
    function loadRecipes(page) {
        const recipeContainer = document.getElementById('recipe-container');
        if (!recipeContainer) return;
        
        const urlParams = new URLSearchParams(window.location.search);
        const currentPage = parseInt(urlParams.get('page')) || 1;
        const pagePath = window.location.pathname.split('/').pop().replace('.html', '');
        const queryCategory = pagePath && pagePath !== "explore" ? pagePath : "";
        
        const url = queryCategory
            ? `${window.API_BASE_URL}/recipes?category=${encodeURIComponent(queryCategory)}&page=${currentPage}&limit=12`
            : `${window.API_BASE_URL}/recipes?page=${currentPage}&limit=12`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                recipeContainer.innerHTML = renderRecipeSectionHtml({
                    recipes: data.recipes,
                    page: pagePath,
                    revealBaseDelayMs: 0
                });
                renderPagination(data.pagination);
            })
            .catch(error => {
                console.error("Error fetching recipes:", error);
            });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#039;');
    }
});

// Add this to handle search toggle (if you still want the floating search button)
const searchToggle = document.getElementById('search-toggle');
if (searchToggle) {
    searchToggle.addEventListener('click', (event) => {
        const input = document.getElementById('search-input');
        if (input) {
            input.focus();
            const resultsDiv = document.getElementById('search-results');
            if (resultsDiv && input.value.trim().length > 0) {
                resultsDiv.classList.toggle('hidden');
            }
        }
        event.stopPropagation();
    });
}