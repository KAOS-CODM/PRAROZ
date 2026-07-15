document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded!");
    const page = window.location.pathname.split('/').pop().replace('.html', '');
    console.log("Detected page:", page);

    const recipeContainer = document.getElementById('recipe-container');
   
    if (recipeContainer) {
    
        fetch(`${window.API_BASE_URL}/recipes?category=${encodeURIComponent(page)}`)
            .then(response => response.json())
            .then(data => {
    
                console.log("Fetched data:", data);
    
                const recipes = Array.isArray(data) ? data : [];
    
                recipeContainer.innerHTML = `
                    <div class="space-y-10">
                    
                        <!-- Header -->
                        <div
                            class="
                                flex
                                items-center
                                justify-between
                            "
                        >
                    
                            <h2
                                class="
                                    text-3xl
                                    font-bold
                                    text-slate-900
                                    dark:text-white
                                "
                            >
                                Recipes
                            </h2>
                    
                            <span
                                class="
                                    rounded-full
                                    bg-orange-100
                                    dark:bg-orange-900/30
                                    text-orange-600
                                    dark:text-orange-300
                                    px-4
                                    py-2
                                    font-semibold
                                "
                            >
                                ${recipes.length} Recipes
                            </span>
                    
                        </div>
                    
                        <!-- Grid -->
                        <div
                            class="
                                grid
                                grid-cols-1
                                sm:grid-cols-3
                                xl:grid-cols-4
                                gap-8
                            "
                        >
    
                        ${recipes.map(recipe => {
    
                            let imageUrl = recipe.image;
    
                            if (!/^https?:\/\//i.test(imageUrl)) {
                                imageUrl = `${window.API_BASE_URL}/${imageUrl}`;
                            }
    
                            const categorySlug = page.toLowerCase();
    
                            const recipeSlug = recipe.name
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^\w-]/g, "");
    
                            const url = `/recipes/${encodeURIComponent(categorySlug)}/${encodeURIComponent(recipeSlug)}`;
    
                            return `
                                <a
                                    href="${url}"
                                    class="
                                        block
                                        group
                                    "
                                >
    
                                    <article
                                        class="
                                            overflow-hidden
                                            rounded-3xl
                                            bg-white
                                            dark:bg-slate-900
                                            border
                                            border-slate-200
                                            dark:border-slate-700
                                            shadow-lg
                                            transition-all
                                            duration-500
                                            hover:-translate-y-2
                                            hover:shadow-2xl
                                        "
                                    >
    
                                        <div class="overflow-hidden pt-6">
    
                                            <figure>
                                                <img 
                                                    src="${imageUrl}"
                                                    alt="PraRoz - ${recipe.name}"
                                                    loading="lazy"
                                                    class="
                                                        w-full
                                                        h-64
                                                        object-cover
                                                        transition-transform
                                                        duration-700
                                                        group-hover:scale-110
                                                    "
                                                    onerror="this.onerror=null;this.src='/images/thumbnail/praroz-thumbnail.png';"
                                                >
                                                <figcaption
                                                    class="
                                                        py-6
                                                        px-6
                                                        text-2xl
                                                        font-bold
                                                        text-slate-900
                                                        dark:text-white
                                                        transition-colors
                                                        duration-300
                                                        group-hover:text-orange-500
                                                        h-30
                                                    "
                                                >
                                                    ${recipe.name}
                                                </figcaption>
                                            </figure>
    
                                        </div>
    
                                        <div class="p-6">    
                                            <div
                                                class="
                                                    mt-6
                                                    pt-4
                                                    border-t
                                                    border-slate-200
                                                    dark:border-slate-700
                                                    flex
                                                    items-center
                                                    justify-between
                                                "
                                            >
    
                                                <span
                                                    class="
                                                        font-semibold
                                                        text-orange-500
                                                        transition-transform
                                                        duration-300
                                                        group-hover:translate-x-2
                                                    "
                                                >
                                                    View Recipe
                                                </span>
    
                                                <i
                                                    class="
                                                        fas
                                                        fa-arrow-right
                                                        text-orange-500
                                                        transition-transform
                                                        duration-300
                                                        group-hover:translate-x-2
                                                    "
                                                ></i>
    
                                            </div>
    
                                        </div>
    
                                    </article>
    
                                </a>
                            `;
    
                        }).join("")}
    
                    </div>
                `;
    
            })
            .catch(error => console.error("Error fetching recipes:", error));
        } else {
            console.log('No recipe container found on this page; skipping recipe fetch.');
        }
    
    

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
            <div class="flex justify-center mb-6">
            
                <div
                    class="
                        inline-flex
                        items-center
                        rounded-full
                        bg-orange-100
                        text-orange-600
                        dark:bg-orange-900/30
                        dark:text-orange-300
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        uppercase
                        tracking-wider
                    "
                >
                    ${page}
                </div>
            
            </div>
            <section
                class="
                max-w-5xl
                mx-auto
                text-left
                mb-20
                ">
                
                <h1
                class="
                text-5xl
                font-extrabold
                text-slate-900
                dark:text-white
                mb-6
                ">
                ${content.title}
                </h1>
                
                <p
                class="
                max-w-3xl
                mx-auto
                text-lg
                leading-9
                text-slate-600
                dark:text-slate-300
                ">
                ${desc}
                </p>
                
                <img
                src="${content.image}"
                class="
                mt-10
                rounded-3xl
                shadow-2xl
                w-full
                max-h-125
                object-cover
                "
                />
                
                </section>
                
            `;
        } else {
            contentContainer.innerHTML = '<p>No content found for this category.</p>';
        }
    })
    .catch(error => console.error("Error fetching content:", error));
});
