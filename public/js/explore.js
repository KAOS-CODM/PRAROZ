/*
  Fully database-driven Explore page (no hardcoded categories, no category.json)

  Responsibilities:
  loadExplore()
  fetchContents()
  fetchRecipes()
  groupRecipesByCategory()
  renderHero()
  renderFeaturedCategories()
  renderCategoryGrid()
  renderLatestRecipes()
  showEmptyState()
*/

const FALLBACK_IMAGE = '/images/thumbnail/praroz-thumbnail.webp';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

function normalizeImageUrlMaybe(imageUrl) {
  if (!imageUrl) return imageUrl;
  if (!/^https?:\/\//i.test(imageUrl)) {
    if (imageUrl.startsWith('/')) return imageUrl;
    return `${window.API_BASE_URL}/${imageUrl}`;
  }
  return imageUrl;
}

function safeImageSrc(imageUrl) {
  const src = normalizeImageUrlMaybe(imageUrl);
  return src || FALLBACK_IMAGE;
}

function pluralize(count, singular, plural) {
  const n = Number(count);
  if (Number.isNaN(n)) return singular;
  if (n === 1) return singular;
  return plural || `${singular}s`;
}

function toSubtitle(categoryName) {
  // Premium but simple, automatically generated.
  const name = String(categoryName || '').trim();
  if (!name) return 'Curated recipes waiting for you.';
  return `Curated ${name.toLowerCase()} ideas, ready to cook.`;
}

function toCategoryName(maybe) {
  const v = String(maybe || '').trim();
  return v ? v : 'Other';
}

function normalizeCategoryForGrouping(maybe) {
  const v = String(maybe || '').trim();
  return v ? v : 'Other';
}

function groupRecipesByCategory(recipes) {
  const list = Array.isArray(recipes) ? recipes : [];

  const map = new Map();

  for (const recipe of list) {
    const name = normalizeCategoryForGrouping(recipe?.category);
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(recipe);
  }

  const grouped = Array.from(map.entries()).map(([name, recipesForName]) => ({
    name,
    count: recipesForName.length,
    recipes: recipesForName,
  }));

  grouped.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  return grouped;
}

function showEmptyState(container, { message = 'No recipes have been published yet.' } = {}) {
  if (!container) return;

  container.innerHTML = `
    <div class="mx-auto flex max-w-xl flex-col items-center rounded-[1.25rem] border border-stone-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
        <i class="fa-solid fa-bowl-food text-2xl"></i>
      </div>
      <h3 class="text-2xl font-semibold text-slate-900 dark:text-white">Nothing to browse</h3>
      <p class="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">${escapeHtml(message)}</p>
    </div>
  `;
}

function createCategoryCard(category) {
  const name = category?.name || 'Other';
  const count = Number(category?.count || 0);
  const recipes = Array.isArray(category?.recipes) ? category.recipes : [];

  const previews = recipes.slice(0, 3);

  const thumbsHtml = previews
    .map((r) => {
      const src = safeImageSrc(r?.image);
      return `
        <img
          src="${escapeHtml(src)}"
          alt="${escapeHtml(name)} preview"
          class="h-16 w-16 rounded-xl object-cover ring-1 ring-white/40 shadow-sm dark:ring-white/10"
          loading="lazy"
          data-fallback="true"
        />
      `;
    })
    .join('');

  const missing = Math.max(0, 3 - previews.length);
  const placeholders = Array.from({ length: missing }).map(() => {
    return `
      <div class="h-16 w-16 rounded-xl bg-stone-100 dark:bg-slate-900 ring-1 ring-white/40 dark:ring-white/10"></div>
    `;
  });

  const pluralText = `${count} ${pluralize(count, 'Recipe', 'Recipes')}`;
  const categorySlug = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  
  const href = `/${categorySlug}`;
  // Category link: /explore?category=Desserts
  //const href = `/${encodeURIComponent(name)}`;

  return `
    <a href="${href}" class="group">
      <article
        class="h-full overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="relative">
          <div class="absolute inset-0 bg-linear-to-t from-black/35 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90"></div>

          <div class="relative p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-xl font-semibold leading-7 text-slate-900 transition-colors duration-300 group-hover:text-orange-600 dark:text-white">
                  ${escapeHtml(name)}
                </h3>
                <p class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  ${escapeHtml(toSubtitle(name))}
                </p>
              </div>

              <span
                class="inline-flex items-center rounded-full bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 transition-colors duration-300 group-hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-300"
              >
                ${escapeHtml(pluralText)}
              </span>
            </div>

            <div class="mt-5 flex items-center gap-2">
              <div class="flex -space-x-3">
                ${thumbsHtml}
              </div>
              ${placeholders.join('')}
            </div>

            <div class="mt-6">
              <span class="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                Browse
                <i class="fas fa-arrow-right"></i>
              </span>
            </div>
          </div>
        </div>
      </article>
    </a>
  `;
}

function renderFeaturedCategories(container, groupedCategories) {
  if (!container) return;

  const list = Array.isArray(groupedCategories) ? groupedCategories : [];
  if (!list.length) {
    showEmptyState(container);
    return;
  }

  const featured = list
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  container.innerHTML = `
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      ${featured.map(createCategoryCard).join('')}
    </div>
  `;
}

function renderCategoryGrid(container, groupedCategories) {
  if (!container) return;

  const list = Array.isArray(groupedCategories) ? groupedCategories : [];
  if (!list.length) {
    showEmptyState(container, { message: 'No recipes have been published yet.' });
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      ${list.map(createCategoryCard).join('')}
    </div>
  `;
}

function renderLatestRecipes(sectionContainer, recipes) {
  if (!sectionContainer) return;

  const list = Array.isArray(recipes) ? recipes : [];
  if (!list.length) {
    // Keep existing layout from project.js? This task requires empty state.
    sectionContainer.innerHTML = '';
    // Latest recipes is currently handled by project.js in explore.html, but we keep
    // this for completeness in case we wire it.
    showEmptyState(sectionContainer, { message: 'No recipes have been published yet.' });
    return;
  }

  // Newest 6: prefer createdAt, then created_at, then datePublished.
  const normalizeDate = (r) => {
    const v = r?.createdAt || r?.created_at || r?.datePublished;
    if (!v) return undefined;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.getTime();
  };

  const sorted = list
    .slice()
    .sort((a, b) => {
      const ta = normalizeDate(a) ?? 0;
      const tb = normalizeDate(b) ?? 0;
      return tb - ta;
    })
    .slice(0, 6);

  // Reuse existing premium recipe cards from project.js? We can’t.
  // So render a minimal grid consistent with Explore feel.
  sectionContainer.innerHTML = `
    <div class="space-y-10">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div class="flex items-center gap-3">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white">Latest recipes</h2>
          <span class="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600 dark:bg-orange-500 dark:text-orange-300">
            ${sorted.length} ${pluralize(sorted.length, 'Recipe', 'Recipes')}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        ${sorted
          .map((r) => {
            const name = r?.title || r?.name || 'Recipe';
            const cat = r?.category || 'Other';
            const categorySlug = String(cat).toLowerCase();
            const slugBase = (r?.slug || name).toString().toLowerCase().trim();
            const recipeSlug = slugBase
              .replace(/\s+/g, '-')
              .replace(/[^\w-]/g, '');

            const href = `/recipes/${encodeURIComponent(categorySlug)}/${encodeURIComponent(recipeSlug)}`;
            const src = safeImageSrc(r?.image);

            return `
              <a href="${href}" class="group">
                <article class="h-full overflow-hidden rounded-[1.25rem] border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                  <div class="relative">
                    <div class="absolute inset-0 bg-linear-to-t from-black/35 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90"></div>
                    <img
                      src="${escapeHtml(src)}"
                      alt="${escapeHtml(name)}"
                      loading="lazy"
                      class="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      data-fallback="true"
                    />
                    <div class="absolute left-4 top-4">
                      <span class="inline-flex items-center rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 shadow-sm dark:bg-slate-900/60">
                        ${escapeHtml(String(cat).toUpperCase())}
                      </span>
                    </div>
                  </div>
                  <div class="p-5">
                    <h3 class="text-lg font-semibold leading-7 text-slate-900 transition-colors duration-300 group-hover:text-orange-600 dark:text-white">
                      ${escapeHtml(name)}
                    </h3>
                    <div class="mt-4 flex items-center justify-between">
                      <span class="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                        View recipe
                        <i class="fas fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                </article>
              </a>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderHero(contentsExplore, contentContainer) {
  if (!contentContainer) return;

  const c = contentsExplore || {};
  const title = c.title || 'Explore Recipes';
  const descriptionParts = Array.isArray(c.description) ? c.description : [];
  const descriptionHtml = descriptionParts.join('');
  const imageUrl = safeImageSrc(c.image);
  const ctaTitle = c.ctaTitle || '';
  const ctaDescriptionParts = Array.isArray(c.ctaDescription) ? c.ctaDescription : [];
  const ctaDescriptionHtml = ctaDescriptionParts.join('');
  const ctaButton = c.ctaButton || '';

  contentContainer.innerHTML = `
    <section
        class="relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900"
        data-reveal="up"
    >

        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_40%)]"></div>
        <div class="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl dark:bg-orange-500/10"></div>

        <div class="relative grid gap-10 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-14">
            <div class="space-y-7">
                <div class="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 dark:border-orange-500 dark:bg-orange-500 dark:text-orange-300">
                    <i class="fa-solid fa-fire"></i>
                    ${escapeHtml(title)} • Premium recipes
                </div>

                <div class="space-y-4">
                    <h1 class="text-4xl font-black leading-[0.95] text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                        ${escapeHtml(title)}
                    </h1>
                    <div class="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                        ${descriptionHtml}
                    </div>
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
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_40%)]"></div>
                <div class="gap-8  md:grid-cols-[1fr_0.9fr] md:items-center">
                    <div class="space-y-4">
                        ${ctaTitle ? `<p class="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600 dark:text-orange-400">${escapeHtml(ctaTitle)}</p>` : ''}
                        ${ctaDescriptionHtml ? `<div class="text-base leading-7 text-slate-600 dark:text-slate-300">${ctaDescriptionHtml}</div>` : ''}
                        ${ctaButton ? `
                            <a href="/explore" class="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500 transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-200">
                            ${escapeHtml(ctaButton)}
                            <i class="fa-solid fa-arrow-right ml-2"></i>
                            </a>
                        ` : ''}
                    </div>
                    <div class="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-70"></div>
                        <img
                            src="${escapeHtml(imageUrl)}"
                            alt="${escapeHtml(title)}"
                            class="h-72 w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                            loading="eager"
                            data-fallback="true"
                        />
                    </div>

                    <div class="relative p-6">
                        <div class="flex items-center justify-between gap-3">
                            <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700 dark:bg-orange-500 dark:text-orange-300">
                                ${escapeHtml(title)}
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
                            href="#all-categories-grid"
                            class="mt-5 inline-flex items-center justify-center rounded-full border border-white/30 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                            Browse all recipes
                            <i class="fa-solid fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>
  `;
}

async function fetchContents() {
  const res = await fetch(`${window.API_BASE_URL}/data/contents`, {
    headers: { 'x-api-key': 'yemite01' },
  });
  if (!res.ok) throw new Error(`Failed to load contents: ${res.status}`);
  const data = await res.json();
  return data;
}

/*async function fetchRecipes() {

    const currentPage =
        Number(new URLSearchParams(window.location.search).get("page")) || 1;

    const res = await fetch(
        `${window.API_BASE_URL}/recipes?page=${currentPage}&limit=12`
    );

    if (!res.ok)
        throw new Error(`Failed to load recipes: ${res.status}`);

    return await res.json();
}*/

async function fetchRecipes(page = 1) {

    const res = await fetch(
        `${window.API_BASE_URL}/recipes?page=${page}&limit=12`
    );

    return await res.json();

}

async function fetchCategories() {

    const res = await fetch(
        `${window.API_BASE_URL}/recipes/categories`
    );

    return await res.json();

}

async function loadExplore() {
  const featuredContainer = document.getElementById('featured-categories');
  const allCategoriesContainer = document.getElementById('all-categories-grid');
  const contentContainer = document.getElementById('content');

  // Latest recipes is currently rendered by project.js via #recipe-container.
  // This file focuses on category discovery. We still implement latest rendering
  // if #recipe-container is present and project.js is not.
  const latestContainer = document.getElementById('recipe-container');

  // Start with skeletons
  if (featuredContainer) featuredContainer.innerHTML = '<div class="min-h-30"></div>';
  if (allCategoriesContainer) allCategoriesContainer.innerHTML = '<div class="min-h-30"></div>';

  try {
    const currentPage =
        Number(
            new URLSearchParams(
                location.search
            ).get("page")
        ) || 1;
    
    const [
    
        contentsData,
    
        recipeData,
    
        categories
    
    ] = await Promise.all([
    
        fetchContents(),
    
        fetchRecipes(currentPage),
    
        fetchCategories()
    
    ]);

    const recipes = recipeData.recipes;
    const pagination = recipeData.pagination;

    const exploreContents = contentsData?.explore || {};
    renderHero(exploreContents, contentContainer);

    const grouped = groupRecipesByCategory(recipes);

    renderFeaturedCategories(featuredContainer, categories);
    renderCategoryGrid(allCategoriesContainer, categories);

    // Latest recipes (newest 6)
    if (latestContainer) {
      // If project.js is still loaded, it will overwrite #recipe-container.
      // But if we removed project.js, we render here.
      renderLatestRecipes(latestContainer, recipes);
    }

    //renderPagination(pagination);

    // If there are no recipes, ensure empty message exists.
    if (!Array.isArray(recipes) || recipes.length === 0) {
      showEmptyState(featuredContainer, { message: 'No recipes have been published yet.' });
      showEmptyState(allCategoriesContainer, { message: 'No recipes have been published yet.' });
      if (latestContainer) showEmptyState(latestContainer, { message: 'No recipes have been published yet.' });
    }
  } catch (err) {
    console.error('Explore load error:', err);
    const msg = 'No recipes have been published yet.';

    showEmptyState(featuredContainer, { message: msg });
    showEmptyState(allCategoriesContainer, { message: msg });
    if (latestContainer) showEmptyState(latestContainer, { message: msg });

    // Keep hero if possible.
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const hasExploreMounts =
    document.getElementById('featured-categories') || document.getElementById('all-categories-grid');

  if (!hasExploreMounts) return;
  loadExplore();
});

