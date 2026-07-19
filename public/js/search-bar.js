document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('search-container');
  if (!container) return; // Not every page includes the search widget

  container.innerHTML = `
    <input class="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 type="text" id="search-input" placeholder="Try: “Pepper soup”, “Jollof”, “No-bake”, “Weeknight" />
    <div id="search-results" class="
    absolute
    top-full
    max-h-75
    overflow-y-auto
    bg-white
    border
    border-solid
    border-[#eee]
    rounded-t-none
    z-50
    shadow-lg
    
    dark:bg-gray-800
    dark:border-gray-800

    "></div>
  `;

  const input = document.getElementById('search-input');
  const resultsDiv = document.getElementById('search-results');

  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const category = pathParts.length > 0 ? decodeURIComponent(pathParts[0]) : '';

  input.addEventListener('input', async () => {
    const query = input.value.trim();

    resultsDiv.innerHTML = '';

    if (query.length === 0) {
      resultsDiv.innerHTML = '<p>Search to find recipes ....</p>'
      return; // stop if no query
    }

    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`, {
        headers: { "x-api-key": "yemite01" }
      });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        resultsDiv.innerHTML = '<p>No recipes found.</p>';
        return;
      }
      resultsDiv.innerHTML = data.map(recipe => {
        const categorySlug = (recipe.category || '').toLowerCase();
        const recipeSlug = (recipe.name || '').toLowerCase().replace(/\s+/g, '-');
        const url = `/recipes/${encodeURIComponent(categorySlug)}/${encodeURIComponent(recipeSlug)}`;

        return `
          <div class="
            flex
            items-center 
            p-[8px_15px] 
            border-b 
            border-b-[#eee]
            cursor-pointer
            transition-colors
            duration-200

            dark:border-b-gray-900
            dark:hover:bg-slate-600

            hover:bg-[#f5f5f5]
            ">
            <a href="${url}" 
              class="
                flex 
                no-underline 
                text-inherit
                w-full 
                items-center
              ">
              <img src="${recipe.image || '/images/thumbnail/praroz-thumbnail.png'}" alt="${recipe.name}" onerror="this.onerror=null;this.src='images/thumbnail/praroz-thumbnail.png'"
                class="
                  w-12.5
                  h-12.5 
                  object-cover 
                  rounded-[5px] 
                  mr-3 
                  shrink-0
                " 
              />
              <div class="result-info">
                <br><strong class="text-[16px]">${recipe.name}</strong></br>
                <small class="text-[#666] dark:text-gray-200 text-[13px]">${recipe.description || ''}</small>
              </div>
            </a>
          </div>
        `;
      }).join('');

    } catch (err) {
      console.error(err);
      resultsDiv.innerHTML = '<p>Error fetching results.</p>';
    }
  });
});

const searchToggle = document.getElementById('search-toggle');
if (searchToggle) {
  searchToggle.addEventListener('click', (event) => {
    const container = document.getElementById('search-container');
    if (!container) return;
    container.style.display = container.style.display === 'none' ? 'block' : 'none';

    if (container.style.display === 'block') {
      const input = document.getElementById('search-input');
      if (input) input.focus();
    }


    event.stopPropagation();
  });
}

