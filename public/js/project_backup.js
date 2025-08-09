document.addEventListener('DOMContentLoaded', async function () {
  const recipeContainer = document.getElementById('recipe-container');
  const recipeDetailsContainer = document.getElementById('recipe-details');
  const footerElement = document.getElementById('footer');
  const sidebar = document.getElementById('sidebar');
  const toggleSidebar = document.getElementById('toggle-sidebar');

  const currentPage = window.location.pathname.split('/').pop().replace('.html', '').split('?')[0].split('#')[0];
  const recipeName = new URLSearchParams(window.location.search).get('name');

  if (toggleSidebar && sidebar) {
    toggleSidebar.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  try {
    const response = await fetch(`${window.API_BASE_URL}/data/contents`, {
      headers: { Accept: 'application/json' },
    });

    const { recipes, footer } = await response.json();

    // Load Recipe List (e.g., desserts.html, drinks.html)
    if (recipeContainer && !recipeDetailsContainer) {
      const filteredRecipes = recipes.filter(
        (recipe) => recipe.category.toLowerCase() === currentPage.toLowerCase()
      );

      if (filteredRecipes.length > 0) {
        recipeContainer.innerHTML = filteredRecipes
          .map(
            (recipe) => `
          <a class="recipe-card-link" href="/recipe-details?name=${encodeURIComponent(recipe.name)}">
            <div class="recipe-card">
              <img src="${recipe.image}" alt="${recipe.name}">
              <h2 class="recipe-title">${recipe.name}</h2>
            </div>
          </a>`
          )
          .join('');
      } else {
        recipeContainer.innerHTML = '<p>No recipes found for this category.</p>';
      }
    }

    // Load Single Recipe Detail Page (recipe-details.html)
    if (recipeDetailsContainer && recipeName) {
      const selectedRecipe = recipes.find(
        (recipe) => recipe.name.toLowerCase() === recipeName.toLowerCase()
      );

      if (selectedRecipe) {
        let ingredientsArray = Array.isArray(selectedRecipe.ingredients)
          ? selectedRecipe.ingredients
          : selectedRecipe.ingredients.split(',').map((item) => item.trim()).filter(Boolean);

        let instructionsArray = Array.isArray(selectedRecipe.instructions)
          ? selectedRecipe.instructions
          : selectedRecipe.instructions.split('.').map((step) => step.trim()).filter(Boolean);

        recipeDetailsContainer.innerHTML = `
          <div class="recipe-detail">
            <img src="${selectedRecipe.image}" alt="${selectedRecipe.name}">
            <h1>${selectedRecipe.name}</h1>
            <h3>Category: ${selectedRecipe.category}</h3>
            <p>${selectedRecipe.description}</p>

            <h2>Ingredients</h2>
            <ul class="recipe-ingredients">
              ${ingredientsArray.map((ingredient) => `<li>${ingredient}</li>`).join('')}
            </ul>

            <h2>Instructions</h2>
            <ol class="recipe-instructions">
              ${instructionsArray.map((step) => `<li>${step}</li>`).join('')}
            </ol>

            ${selectedRecipe.extraContent?.nutrition ? `
              <h2>Nutrition Facts</h2>
              <ul class="nutrition-list">
                <li><strong>Calories:</strong> ${selectedRecipe.extraContent.nutrition.calories || "N/A"}</li>
                <li><strong>Protein:</strong> ${selectedRecipe.extraContent.nutrition.protein || "N/A"}</li>
                <li><strong>Fat:</strong> ${selectedRecipe.extraContent.nutrition.fat || "N/A"}</li>
                <li><strong>Carbohydrates:</strong> ${selectedRecipe.extraContent.nutrition.carbohydrates || "N/A"}</li>
              </ul>
            ` : '<p>No nutrition data available.</p>'}
          </div>`;
      } else {
        recipeDetailsContainer.innerHTML = '<p>Recipe not found.</p>';
      }
    }

    // Load footer
    if (footerElement) {
      footerElement.innerHTML = footer || '';
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    if (recipeContainer) recipeContainer.innerHTML = '<p>Error loading recipes.</p>';
    if (recipeDetailsContainer) recipeDetailsContainer.innerHTML = '<p>Error loading recipe details.</p>';
    if (footerElement) footerElement.innerHTML = '<p>Error loading footer.</p>';
  }
});
