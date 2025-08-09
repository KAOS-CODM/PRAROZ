document.addEventListener('DOMContentLoaded', async function() {
    const response = await fetch(`${window.API_BASE_URL}/data/recipes`, {
        headers: {
            "x-api-key": "yemite01",
        }
    });
    const recipes = await response.json();
    const recipeContainer = document.getElementById('recipe-container');

    Object.keys(recipes).forEach(category => {
        recipes[category].forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');

            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.name}">
                <h3>${recipe.name}</h3>
                <p>${recipe.description}</p>
                <a href="/recipe-details?recipename=${encodeURIComponent(recipe.name)}">View Recipe</a>
            `;

            recipeContainer.appendChild(recipeCard);
        });
    });
});
