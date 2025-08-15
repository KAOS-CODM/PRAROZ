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

                const categorySlug = page.toLowerCase();
                const recipeSlug = recipe.name.toLowerCase().replace(/\s+/g, '-');
                const url = `/${encodeURIComponent(categorySlug)}/${encodeURIComponent(recipeSlug)}`;

                return `
                    <a href="${url}" class="recipe-card-link">
                        <div class="recipe-card">
                            <img class="recipe-image" loading="lazy" src="${recipe.image}" width="100" 
                                 onerror="this.onerror=null;this.src='placeholder.jpg'">
                            <div class="recipe-content">
                                <h2>${recipe.name}</h2>
                                <ul>
                                    <p><li><h3>Ingredients</h3></li></p>
                                    <ul>${ingredientsArray.map(i => `<li>${i}</li>`).join('')}</ul>
                                    <p><li><h3><strong>Steps:</strong></h3></p>
                                    <p>Click to view full recipe!</p>
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
        const desc = content?.description?.join("") || "";

        if (!contentContainer) {
            console.error("ERROR: #content NOT found in html");
            return;
        }

        if (content) {
            contentContainer.innerHTML =  `
                <h2 class="content-title">${content.title}</h2>
                <p class="content-description">${desc}</p>
                <p>Thanks for visiting, hope you enjoy your stay!</p>
                <img class="recipe-image" loading="lazy" src="${content.image}" alt="${content.title}">
            `;
        } else {
            contentContainer.innerHTML = '<p>No content found for this category.</p>';
        }
    })
    .catch(error => console.error("Error fetching content:", error));
    
    console.log("✅ Recipe Details Page Loaded!");
    
    const urlParams = new URLSearchParams(window.location.search);
    const recipeName = urlParams.get("recipe");
    console.log("🍽️ Selected Recipe:", recipeName);

    if (!recipeName) {
        console.error("❌ ERROR: No recipe specified in URL.");
        document.getElementById("recipe-details").innerHTML = "<p>⚠️ No recipe found. Please go back and select a recipe.</p>";
        return;
    }
});
