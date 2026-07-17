document.addEventListener("DOMContentLoaded", async () => {

    const recipeDiv = document.getElementById("recipe-details");

    const pathParts = window.location.pathname
        .split("/")
        .filter(Boolean);

    const category = pathParts[1];
    const recipeSlug = pathParts[2];

    console.log("📦 Loading recipe:", category, recipeSlug);

    try {

        const res = await fetch(`/api/recipes/${category}/${recipeSlug}`, {
            headers: {
                "x-api-key": "yemite01"
            }
        });

        if (!res.ok) throw new Error("Recipe not found");

        const selectedRecipe = await res.json();

        console.log(selectedRecipe);

        const imagePath = selectedRecipe.image?.startsWith("https")
            ? selectedRecipe.image
            : `/${selectedRecipe.image.replace(/^\/+/, "")}`;

        const extra = selectedRecipe.extraContent || {};

        const nutrition = extra.nutrition || {};

        const ingredients = Array.isArray(selectedRecipe.ingredients)
            ? selectedRecipe.ingredients
            : selectedRecipe.ingredients?.split(/\r?\n/) || [];

        // Backend (storage.formatRecipe) generates instructionsHtml dynamically.
        // Use it as the single source for HTML rendering.
        const instructionsHtml = selectedRecipe.instructionsHtml || "";

        recipeDiv.innerHTML = `

<section
class="
max-w-7xl
mx-auto
px-6
py-10
space-y-16
" data-reveal="up">

<!-- HERO -->

<section
class="
space-y-8
" data-reveal="up">

<div
class="
inline-flex
items-center
rounded-full
bg-orange-100
dark:bg-orange-900/30
text-orange-600
dark:text-orange-300
px-4
py-2
font-semibold
uppercase
tracking-wider
text-sm
">

${category}

</div>

<h1
class="
text-5xl
lg:text-6xl
font-black
text-slate-900
dark:text-white
leading-tight
">

${selectedRecipe.name}

</h1>

<p
class="
max-w-4xl
text-xl
leading-9
text-slate-600
dark:text-slate-300
">

${selectedRecipe.description || "A delicious homemade recipe waiting to be enjoyed."}

</p>

<img

src="${imagePath}"

alt="${selectedRecipe.name}"

loading="lazy"

class="
w-full
h-137.5
object-cover
rounded-4xl
shadow-2xl
transition-transform
duration-700
hover:scale-[1.02]
"

onerror="this.onerror=null;this.src='/images/thumbnail/praroz-thumbnail.png'"

>

</section>

<!-- QUICK INFO -->

<section
class="
grid
grid-cols-2
lg:grid-cols-4
gap-6
" data-reveal="up">

<div
class="
rounded-3xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-lg
p-6
text-center
">

<div class="text-4xl mb-3">⏱</div>

<p class="text-sm uppercase text-slate-500">

Prep Time

</p>

<p class="text-xl font-bold mt-2">

${extra.prepTime || "N/A"}

</p>

</div>

<div
class="
rounded-3xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-lg
p-6
text-center
">

<div class="text-4xl mb-3">🔥</div>

<p class="text-sm uppercase text-slate-500">

Cook Time

</p>

<p class="text-xl font-bold mt-2">

${extra.cookTime || "N/A"}

</p>

</div>

<div
class="
rounded-3xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-lg
p-6
text-center
">

<div class="text-4xl mb-3">🍽</div>

<p class="text-sm uppercase text-slate-500">

Servings

</p>

<p class="text-xl font-bold mt-2">

${extra.servings || "N/A"}

</p>

</div>

<div
class="
rounded-3xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-lg
p-6
text-center
">

<div class="text-4xl mb-3">🥣</div>

<p class="text-sm uppercase text-slate-500">

Calories

</p>

<p class="text-xl font-bold mt-2">

${nutrition.calories || "N/A"}

</p>

</div>

</section>

<!-- INGREDIENTS + INSTRUCTIONS -->

<section
class="
grid
lg:grid-cols-2
gap-12
" data-reveal="up">

<!-- INGREDIENTS -->

<div
class="
rounded-4xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-xl
p-8
">

<h2
class="
text-3xl
font-bold
mb-8
">

Ingredients

</h2>

<ul
class="
space-y-5
">

${ingredients
.filter(i => i.trim())
.map(i => `

<li
class="
flex
items-start
gap-4
">

<div
class="
h-8
w-8
rounded-full
bg-orange-500
text-white
flex
items-center
justify-center
shrink-0
">

<i class="fas fa-check"></i>

</div>

<span
class="
text-lg
leading-8
text-slate-700
dark:text-slate-300
">

${i.trim()}

</span>

</li>

`).join("")}

</ul>

</div>

<!-- INSTRUCTIONS -->

<div
class="
rounded-4xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-xl
p-8
">

<h2
class="
text-3xl
font-bold
mb-8
">

Instructions

</h2>

<div
class="
[&>ol]:space-y-4
[&>ol]:list-decimal
[&>ol]:pl-7

[&>ol>li]:rounded-2xl
[&>ol>li]:border
[&>ol>li]:border-slate-200
dark:[&>ol>li]:border-slate-700
[&>ol>li]:bg-slate-50
dark:[&>ol>li]:bg-slate-800/40
[&>ol>li]:p-5

[&>ol>li]:marker:text-orange-500
[&>ol>li]:marker:font-bold
[&>ol>li]:marker:text-xl
">

${instructionsHtml}

</div>

</div>

</section>
<!-- NUTRITION -->

<section data-reveal="up">

<h2
class="
text-4xl
font-bold
mb-8
text-slate-900
dark:text-white
">

Nutrition Facts

</h2>

<div
class="
grid
grid-cols-2
lg:grid-cols-4
gap-6
">

${[
    {
        icon: "🔥",
        label: "Calories",
        value: nutrition.calories || "N/A"
    },
    {
        icon: "💪",
        label: "Protein",
        value: nutrition.protein || "N/A"
    },
    {
        icon: "🥖",
        label: "Carbs",
        value: nutrition.carbs || "N/A"
    },
    {
        icon: "🥑",
        label: "Fat",
        value: nutrition.fat || "N/A"
    }
].map(item => `

<div
class="
rounded-3xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-lg
hover:shadow-xl
transition
duration-300
p-8
text-center
">

<div class="text-5xl mb-4">

${item.icon}

</div>

<p
class="
uppercase
tracking-wider
text-sm
text-slate-500
">

${item.label}

</p>

<p
class="
mt-3
text-2xl
font-bold
text-slate-900
dark:text-white
">

${item.value}

</p>

</div>

`).join("")}

</div>

</section>

<!-- CHEF'S TIP -->

<section data-reveal="up">

<div
class="
rounded-4xl
bg-linear-to-r
from-orange-500
to-orange-600
text-white
shadow-2xl
overflow-hidden
">

<div
class="
p-10
">

<div
class="
flex
items-center
gap-4
mb-6
">

<div
class="
h-16
w-16
rounded-full
bg-white/20
flex
items-center
justify-center
text-3xl
">

👨‍🍳

</div>

<div>

<h2
class="
text-3xl
font-bold
">

Chef's Tip

</h2>

<p class="opacity-90">

Professional cooking advice

</p>

</div>

</div>

<p
class="
text-xl
leading-9
italic
">

${extra.chefTips || "No chef tips available for this recipe."}

</p>

</div>

</div>

</section>

<!-- SUBMIT CTA -->

<section data-reveal="up">

<div
class="
rounded-[40px]
bg-slate-900
dark:bg-slate-950
overflow-hidden
relative
">

<div
class="
absolute
inset-0
bg-linear-to-r
from-orange-500/20
to-transparent
">

</div>

<div
class="
relative
px-10
py-16
text-center
">

<div
class="
text-6xl
mb-6
">

🍳

</div>

<h2
class="
text-4xl
font-black
text-white
mb-6
">

Have Your Own Amazing Recipe?

</h2>

<p
class="
max-w-3xl
mx-auto
text-lg
leading-9
text-slate-50
dark:text-slate-300
mb-10
">

Join the PraRoz community by sharing your favorite recipes with food lovers around the world. Whether it's a cherished family tradition or your newest kitchen creation, we'd love to feature it.

</p>

<button

class="
redirect-button

inline-flex
items-center
gap-3

rounded-full

bg-orange-500

hover:bg-orange-600

px-10
py-5

text-lg
font-semibold

text-white

shadow-xl

transition-all
duration-300

hover:-translate-y-1
hover:shadow-orange-500/40

"

>

<i class="fas fa-plus-circle"></i>

Submit Your Recipe

</button>

</div>

</div>

</section>

</section>

`;
        const redirectBtn = document.querySelector(".redirect-button");

        if (redirectBtn) {

            redirectBtn.addEventListener("click", () => {

                window.location.href = "/submit";

            });

        }

    } catch (err) {

        console.error("❌ Failed to load recipe:", err);

        recipeDiv.innerHTML = `

<div
class="
max-w-3xl
mx-auto
py-24
text-center
">

<div
class="
text-7xl
mb-8
">

🍽️

</div>

<h2
class="
text-4xl
font-bold
text-slate-900
dark:text-white
mb-6
">

Recipe Not Found

</h2>

<p
class="
text-lg
text-slate-600
dark:text-slate-300
mb-10
">

Sorry, the recipe you're looking for doesn't exist or may have been removed.

</p>

<a

href="/"

class="
inline-flex
items-center
gap-3

rounded-full

bg-orange-500
hover:bg-orange-600

px-8
py-4

font-semibold

text-white

transition

duration-300

"

>

<i class="fas fa-home"></i>

Back Home

</a>

</div>

`;

    }

});

