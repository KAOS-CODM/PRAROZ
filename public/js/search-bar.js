document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('search-container');

  container.innerHTML = `
    <input type="text" id="search-input" placeholder="Search recipes..." />
    <div id="search-results"></div>
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

      if (data.length === 0) {
        resultsDiv.innerHTML = '<p>No recipes found.</p>';
        return;
      }
      resultsDiv.innerHTML = data.map(recipe => {
        const categorySlug = recipe.category.toLowerCase();
        const recipeSlug = recipe.name.toLowerCase().replace(/\s+/g, '-');
        const url = `/${encodeURIComponent(categorySlug)}/${encodeURIComponent(recipeSlug)}`;

        return `
          <div class="search-result">
            <a href="${url}">
              <img src="${recipe.image}" alt="${recipe.name}" class="result-thumb" />
              <div class="result-info">
                <br><strong>${recipe.name}</strong></br>
                <small>${recipe.description || ''}</small>
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

document.getElementById('search-toggle').addEventListener('click', () => {
  const container = document.getElementById('search-container');
  container.style.display = container.style.display === 'none' ? 'block' : 'none';

  if (container.style.display === 'block') {
    document.getElementById('search-input').focus();
  }
});
