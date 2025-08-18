document.addEventListener('DOMContentLoaded', async () => {
    const recipeDiv = document.getElementById('recipe-details');

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const category = pathParts[0];
    const recipeSlug = pathParts[1];
    let currentRecipeId = null;

    console.log('📦 Page loaded for:', category, recipeSlug);

    try {
        const res = await fetch(`/api/recipes/${category}/${recipeSlug}`, {
            headers: { "x-api-key": "yemite01" }
        });
        if (!res.ok) throw new Error('Recipe not found');

        const selectedRecipe = await res.json();
        console.log("📂 Fetched Recipe:", selectedRecipe);

        const imagePath = selectedRecipe.image?.startsWith('https')
        ? selectedRecipe.image
        : `/${selectedRecipe.image.replace(/^\/+/,'')}`;

        recipeDiv.innerHTML = `
        
            <div class="recipe-extra">
                <h1 class="recipe-title">${selectedRecipe.name}</h1>
                <img class="recipe-image" loading="lazy" src="${imagePath}" alt="${selectedRecipe.name}">
                <p class="recipe-description">${selectedRecipe.description || "A delicious recipe!"}</p>
                <ul>
                    <h2>Ingredients</h2>
                    <ol class="ingredients-list">
                        ${(Array.isArray(selectedRecipe.ingredients)
                            ? selectedRecipe.ingredients
                            : selectedRecipe.ingredients?.split(/\r?\n/))
                            ?.filter(i => i.trim() !== '')
                            .map(i => `<li>${i.trim()}</li>`).join('') || "<li>No ingredients listed.</li>"}
                    </ol>
                </ul>

                <ul>
                    <h2>Instructions</h2>
                    <ol class="instructions-list">
                        ${(Array.isArray(selectedRecipe.instructions)
                            ? selectedRecipe.instructions
                            : selectedRecipe.instructions?.split(/\r?\n/))
                            ?.filter(step => step.trim() !== '')
                            .map(step => `<li>${step.trim()}</li>`).join('') || "<li>No instructions available.</li>"}
                    </ol>
                </ul>

                <ul>
                    <h2>Additional Info</h2>
                    <ul class="additional-info">
                        <li><strong>Prep Time:</strong> ${selectedRecipe.prep_time || "Not specified"}</li>
                        <li><strong>Cook Time:</strong> ${selectedRecipe.cook_time || "Not specified"}</li>
                        <li><strong>Servings:</strong> ${selectedRecipe.servings || "Not specified"}</li>
                    </ul>
                <ul>

                <ul>
                    <h2>Nutrition Facts</h2>
                    <ul class="nutrition-list">
                        <li><strong>Calories:</strong> ${selectedRecipe.calories || "N/A"}</li>
                        <li><strong>Protein:</strong> ${selectedRecipe.protein || "N/A"}</li>
                        <li><strong>Carbs:</strong> ${selectedRecipe.carbs || "N/A"}</li>
                        <li><strong>Fat:</strong> ${selectedRecipe.fat || "N/A"}</li>
                    </ul> 
                </ul>

                <h2>Chef's Tips</h2>
                <p class="chef-tips">${selectedRecipe.chef_tips || "None"}</p>
                <p><strong>HEY YOU!</strong> Yes you, are you interested in submitting a recipe of your own? Click the button below, and let us know what you have in mind!!!</p>
                <button class="redirect-button">Submit a Recipe</button>
            </div>
        `;

        document.querySelector('.redirect-button').addEventListener('click', function() {
            window.location.href = '/submission';
        });

    } catch (err) {
        console.error('❌ Failed to load recipe:', err);
        recipeDiv.innerHTML = '<p>⚠️ Recipe not found.</p>';
    }
});
