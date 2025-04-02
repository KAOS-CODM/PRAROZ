document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded!");
    const page = window.location.pathname.split('/').pop().replace('.html', '');
    console.log("Detected page:", page);

    fetch(`${window.API_BASE_URL}/api/data/recipes`, {
        headers: {
            "x-api-key": "yemite01",
        }
    }) // Adjust path if needed
    .then(response => response.json())
    .then(data => {
        console.log("Fetched data:", data);
        const recipes = data[page]; // Get all recipes for the current category
        console.log("Recipes for this page:", recipes);
        const recipeContainer = document.getElementById('recipe-container');    

        if (recipes) {
            recipeContainer.innerHTML = recipes.map(recipe => {
                let imageUrl = recipe.image;

            if (!imageUrl.startsWith("https")){
                imageUrl = `${window.API_BASE_URL}/${imageUrl}`;
            }


                // Ensure ingredients is an array
                let ingredientsArray = Array.isArray(recipe.ingredients) 
                    ? recipe.ingredients 
                    : recipe.ingredients.split(",").map(item => item.trim());
        
                return `
                    <a href="recipe-details.html?recipe=${encodeURIComponent(recipe.name.trim())}" class="recipe-card-link">
                        <div class="recipe-card">
                            <img class="recipe-image" src="${imageUrl}"  width="100" onerror="this.onerror=null;this.src='placeholder.jpg' ">
                            <h2 class="recipe-title">${recipe.name}</h2>
                            <p class="recipe-description">${recipe.description || "A delicious recipe!"}</p>
                            <div class="recipe-ingredients">
                                <h3>Ingredients</h3>
                                <ul>${ingredientsArray.map(i => `<li>${i}</li>`).join('')}</ul>
                            </div>
                            <div class="recipe-instructions">
                                <strong>Quick Steps:</strong> ${recipe.shortInstructions || "Click to view full recipe!"}
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

    fetch(`${window.API_BASE_URL}/api/data/contents`, {
        headers: {
            "x-api-key": "yemite01",
        }
    }) // Adjust path if needed
    .then(response =>{
        console.log("fetching content");
        return response.json();
    })
    .then(data => {
        console.log("Fetched data:", data);
        const content = data[page]; // Get all content for the current category
        console.log("Content for this page:", content);
        
        const contentContainer = document.getElementById('content');

        if (!contentContainer){
            console.error("ERROR: #content  NOT found in html");
            return;
        }

        if (content) {
            contentContainer.innerHTML =  `
            <h2 class="content-title">${content.title}</h2>
            <p class="content-description">${content.description}</p>
            <img class="content-image" src="${content.image}">
            `;
        } else {
            contentContainer.innerHTML = '<p>No content found for this category.</p>';
        }

        if (data.footer) {
            const footer = document.getElementById("dynamic-footer");
            if (footer) {
                footer.innerHTML = `
                    <p>${data.footer.text}</p>
                    <p class="social-icons">
                        <a href="${data.footer.social.facebook}" target="_blank"><i class="fab fa-facebook"></i></a>
                        <a href="${data.footer.social.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>
                        <a href="${data.footer.social.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>
                    </p>
                `;
            }
        }

        let currentPage = window.location.pathname.split('/').pop().split('?')[0].split('#')[0];

        fetch(`${window.API_BASE_URL}/api/data/contents`, {
            headers: {
                "x-api-key": "yemite01",
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("📂 Navbar Data:", data.navbar);
            const navbarContainer = document.getElementById("nav-links");

            if (!navbarContainer) {
                console.error("❌ ERROR: Navbar container not found!");
                return;
            }

            data.navbar.links.forEach(link => {
                console.log(`🔗 Adding link: ${link.name} (${link.url})`);

                const li = document.createElement("li");
                li.classList.add("active")

                if(link.url === currentPage){
                    li.innerHTML = `<a href="${link.url}" class="active"><i class= "${link.icon}">${link.name}</i></a>`;
                }else{
                    li.innerHTML = `<a href="${link.url}">${link.name}</i></a>`;
                }
                navbarContainer.appendChild(li);
            });
        })
        .catch(error => console.error("❌ ERROR Fetching Navbar:", error));
    })
    .catch(error => console.error("Error fetching content:", error));

    console.log("✅ Recipe Details Page Loaded!");

    // Get the recipe name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const recipeName = urlParams.get("recipe");
    console.log("🍽️ Selected Recipe:", recipeName);
    console.log("🔍 Extracted Recipe Name from URL:", recipeName);


    if (!recipeName) {
        console.error("❌ ERROR: No recipe specified in URL.");
        document.getElementById("recipe-details").innerHTML = "<p>⚠️ No recipe found. Please go back and select a recipe.</p>";
        return;
    }

    // Fetch recipe data from recipes.json
    fetch(`${window.API_BASE_URL}/api/data/recipes`, {
        headers: {
            "x-api-key": "yemite01",
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("📂 Fetched Data:", data);

        // Search for the recipe in all categories
        let selectedRecipe = null;
        for (const category in data) {
            selectedRecipe = data[category].find(recipe => 
                recipe.name.toLowerCase().trim() === recipeName.toLowerCase().trim()
            );            
            if (selectedRecipe) break;
        }

        if (!selectedRecipe) {
            console.error("❌ ERROR: Recipe not found in JSON.");
            const detailsContainer = document.getElementById("recipe-details");
            if (detailsContainer) {
                detailsContainer.innerHTML = "<p>⚠️ Recipe not found.</p>";
            }
            return;
        }
        

        // Build the recipe details dynamically
        document.getElementById("recipe-details").innerHTML = `
            <h1 class="recipe-title">${selectedRecipe.name}</h1>
            <img class="recipe-image" src="${selectedRecipe.image}" alt="${selectedRecipe.name}">
            <p class="recipe-description">${selectedRecipe.description || "A delicious recipe!"}</p>

            <h2>Ingredients</h2>
            <ul class="recipe-ingredients">
                ${selectedRecipe.ingredients.map(i => `<li>${i}</li>`).join('')}
            </ul>

            <h2>Instructions</h2>
            <p class="recipe-instructions">${selectedRecipe.instructions}</p>

            ${selectedRecipe.extraContent ? `
                <div class="recipe-extra">
                    <h2>Additional Info</h2>
                    <p><strong>Prep Time:</strong> ${selectedRecipe.extraContent.prepTime}</p>
                    <p><strong>Cook Time:</strong> ${selectedRecipe.extraContent.cookTime}</p>
                    <p><strong>Servings:</strong> ${selectedRecipe.extraContent.servings}</p>

                    ${selectedRecipe.extraContent && selectedRecipe.extraContent.nutrition ? `
                    <h2>Nutrition Facts</h2>
                    <ul class="nutrition-list">
                        <li><strong>Calories:</strong> ${selectedRecipe.extraContent.nutrition.calories || "N/A"}</li>
                        <li><strong>Protein:</strong> ${selectedRecipe.extraContent.nutrition.protein || "N/A"}</li>
                        <li><strong>Carbs:</strong> ${selectedRecipe.extraContent.nutrition.carbs || "N/A"}</li>
                        <li><strong>Fat:</strong> ${selectedRecipe.extraContent.nutrition.fat || "N/A"}</li>
                    </ul>
` : "<p>No nutrition data available.</p>"}


                    <h2>Chef's Tips</h2>
                    <p class="chef-tips">${selectedRecipe.extraContent.chefTips}</p>
                </div>
            `: ""}
            <p><strong>HEY YOU!</strong>yes you, are you interested in submitting a recipe of your own? Click the button below, and let us know what you have in mind!!!</p>
            <button class="redirect-button">Submit a Recipe</button>
        `;
        document.querySelector('.redirect-button').addEventListener('click', function() {
            window.location.href = 'submission.html'; // Change this to your actual submission page URL
        });        
    })
    .catch(error => console.error("❌ ERROR Fetching Recipe:", error));
});


document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    // Toggle Sidebar When Clicking the Menu Button
    menuBtn.addEventListener("click", function (event) {
        sidebar.classList.toggle("open");

        if (sidebar.classList.contains("open")) {
            menuBtn.textContent = "X"; // Change to 'X' when open
        } else {
            menuBtn.textContent = "☰"; // Change back to menu icon
        }
        event.stopPropagation(); // Prevents click from propagating
    });

    // Close Sidebar When Clicking Outside of It
    document.addEventListener("click", function (event) {
        if (!sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
            sidebar.classList.remove("open");
        }

        if (!sidebar.classList.contains("open")) {
            menuBtn.textContent = "☰"; // Change back to menu icon
        }
    });

    // Prevent Closing Sidebar When Clicking Inside It
    sidebar.addEventListener("click", function (event) {
        event.stopPropagation(); // Stops the click event inside the sidebar from closing it
    });
});

