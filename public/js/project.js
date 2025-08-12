document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded!");
    const page = window.location.pathname.split('/').pop().replace('.html', '');
    console.log("Detected page:", page);

    fetch(`${window.API_BASE_URL}/approved-recipes`, {
        headers: { "x-api-key": "yemite01" }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Fetched data:", data);
        const recipes = Array.isArray(data) ? data.filter(recipe => recipe.category === page) : [];
        console.log("Recipes for this page:", recipes);
        const recipeContainer = document.getElementById('recipe-container');

        if (recipes) {
            recipeContainer.innerHTML = recipes.map(recipe => {
                let imageUrl = recipe.image;
                if (!/^https?:\/\//i.test(imageUrl)) {
                    imageUrl = `${window.API_BASE_URL}/${imageUrl}`;
                }

                let ingredientsArray = Array.isArray(recipe.ingredients) 
                    ? recipe.ingredients 
                    : recipe.ingredients.split(",").map(item => item.trim());
        
                return `
                    <a href="/recipe?recipe=${encodeURIComponent(recipe.name.trim())}" class="recipe-card-link">
                        <div class="recipe-card">
                            <img class="recipe-image" loading="lazy"  src="${recipe.image}" width="100" onerror="this.onerror=null;this.src='placeholder.jpg'">
                            <div class="recipe-content">
                                <h2>${recipe.name}</h2>
                                <ul>
                                <p><li><h3>Ingredients</h3></li></p>
                                <ul>${ingredientsArray.map(i => `<li>${i}</li>`).join('')}</ul>
                                <p><li><h3><strong>Steps:</strong></h3></p>
                                <p> Click to view full recipe!</p>
                                </ul>
                            </div>
                        </div>
                    </a>
                `;
            }).join('');
        } else {
            recipeContainer.innerHTML = '';
        }
    })
    .catch(error => console.error("Error fetching recipes:", error));

    fetch(`${window.API_BASE_URL}/data/contents`, {
        headers: { "x-api-key": "yemite01" }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Fetched data:", data);
        const content = data[page];
        const contentContainer = document.getElementById('content');
        const desc = content.description.join("")

        if (!contentContainer) {
            console.error("ERROR: #content NOT found in html");
            return;
        }

        if (content) {
            contentContainer.innerHTML =  `
                <h2 class="content-title">${content.title}</h2>
                <p class="content-description">${desc}</p>
                <p>Thanks for visiting, hope you enjoy your stay!</p>
                <img class="content-image" loading="lazy" src="${content.image}" alt="${content.title}">
            `;
        } else {
            contentContainer.innerHTML = '<p>No content found for this category.</p>';
        }
    })
    .catch(error => console.error("Error fetching content:", error));
    
    console.log("✅ Recipe Details Page Loaded!");
    
    const urlParams = new URLSearchParams(window.location.search);
    const recipeName = decodeURIComponent(urlParams.get("recipe") || "").trim();
    console.log("🍽️ Selected Recipe:", recipeName);

    if (!recipeName) {
        console.error("❌ ERROR: No recipe specified in URL.");
        document.getElementById("recipe-details").innerHTML = "<p>⚠️ No recipe found. Please go back and select a recipe.</p>";
        return;
    }

    fetch(`${window.API_BASE_URL}/approved-recipes`, {
        headers: { "x-api-key": "yemite01" }
    })
    .then(response => response.json())
    .then(data => {
        console.log("📂 Fetched Data:", data);
        let selectedRecipe = Array.isArray(data)
            ? data.find(recipe => recipe.name.toLowerCase().trim() === recipeName.toLowerCase().trim())
            : null;

        if (!selectedRecipe) {
            console.error("❌ ERROR: Recipe not found in JSON.");
            document.getElementById("recipe-details").innerHTML = "<p>⚠️ Recipe not found.</p>";
            return;
        }

        document.getElementById("recipe-details").innerHTML = `
            <h1 class="recipe-title">${selectedRecipe.name}</h1>
            <img class="recipe-image" loading="lazy" src="${selectedRecipe.image}" alt="${selectedRecipe.name}">
            <p class="recipe-description">${selectedRecipe.description || "A delicious recipe!"}</p>

            <ul>
                <li><h2>Ingredients</h2></li>
                <ul>
                    ${(Array.isArray(selectedRecipe.ingredients)
                        ? selectedRecipe.ingredients
                        : selectedRecipe.ingredients.split(/\r?\n/))
                        .filter(i => i.trim() !== '')
                        .map(i => `<li>${i.trim()}</li>`).join('')}
                </ul>
            </ul>

            <ul>
                <li><h2>Instructions</h2></li>
                <ol>
                    ${(Array.isArray(selectedRecipe.instructions)
                        ? selectedRecipe.instructions
                        : selectedRecipe.instructions.split(/\r?\n/))
                        .filter(step => step.trim() !== '')
                        .map(step => `<p>${step.trim()}</p>`).join('')}
                </ol>
            </ul>

            <div class="recipe-extra">
                <h2>Additional Info</h2>
                <p><strong>Prep Time:</strong> ${selectedRecipe.prep_time || "Not specified"}</p>
                <p><strong>Cook Time:</strong> ${selectedRecipe.cook_time || "Not specified"}</p>
                <p><strong>Servings:</strong> ${selectedRecipe.servings || "Not specified"}</p>

                <h2>Nutrition Facts</h2>
                <ul class="nutrition-list">
                    <li><strong>Calories:</strong> ${selectedRecipe.calories || "N/A"}</li>
                    <li><strong>Protein:</strong> ${selectedRecipe.protein || "N/A"}</li>
                    <li><strong>Carbs:</strong> ${selectedRecipe.carbs || "N/A"}</li>
                    <li><strong>Fat:</strong> ${selectedRecipe.fat || "N/A"}</li>
                </ul> 

                <h2>Chef's Tips</h2>
                <p class="chef-tips">${selectedRecipe.chef_tips || "None"}</p>
            </div>

            <p><strong>HEY YOU!</strong> Yes you, are you interested in submitting a recipe of your own? Click the button below, and let us know what you have in mind!!!</p>
            <button class="redirect-button">Submit a Recipe</button>
        `;
        document.querySelector('.redirect-button').addEventListener('click', function() {
            window.location.href = '/submission';
        });
    })
    .catch(error => console.error("❌ ERROR Fetching Recipe:", error));
});
