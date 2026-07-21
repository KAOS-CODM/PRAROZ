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

<!-- HERO (Premium Editorial) -->

<section
class="
space-y-8
" data-reveal="up">

<div
class="
flex
items-center
justify-between
gap-6
">

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

<div
class="
hidden
sm:flex
items-center
gap-3
text-sm
text-slate-600
dark:text-slate-300
">

<div
class="
flex
items-center
gap-2
rounded-full
border
border-slate-200
dark:border-slate-700
bg-white/60
dark:bg-slate-900/40
px-4
py-2
shadow-sm
">

<span class="opacity-90">⏱</span>

<span class="font-semibold">${extra.prepTime || "N/A"}</span>

</div>

<div
class="
flex
items-center
gap-2
rounded-full
border
border-slate-200
dark:border-slate-700
bg-white/60
dark:bg-slate-900/40
px-4
py-2
shadow-sm
">

<span class="opacity-90">🔥</span>

<span class="font-semibold">${extra.cookTime || "N/A"}</span>

</div>

<div
class="
flex
items-center
gap-2
rounded-full
border
border-slate-200
dark:border-slate-700
bg-white/60
dark:bg-slate-900/40
px-4
py-2
shadow-sm
">

<span class="opacity-90">🍽</span>

<span class="font-semibold">${extra.servings || "N/A"}</span>

</div>

</div>

</div>

<h1
class="
text-4xl
sm:text-5xl
lg:text-6xl
font-black
text-slate-900
dark:text-white
leading-tight
tracking-tight
">

${selectedRecipe.name}

</h1>

<p
class="
max-w-4xl
text-lg
sm:text-xl
leading-9
text-slate-600
dark:text-slate-300
">

${selectedRecipe.description || "A delicious homemade recipe waiting to be enjoyed."}

</p>

<div
class="
relative
overflow-hidden
rounded-4xl
shadow-2xl
border
border-slate-200/70
dark:border-slate-700/70
">

<div
class="
absolute
inset-0
bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_40%)]
opacity-100
pointer-events-none
"></div>

<img

src="${imagePath}"

alt="${selectedRecipe.name}"

loading="lazy"

class="
w-full
h-137.5
object-cover
rounded-4xl
transition-transform
duration-700
hover:scale-[1.02]
relative
z-10
"

data-fallback="true"

>

</div>

<!-- Mobile-only quick info -->

<section
class="
grid
grid-cols-2
lg:grid-cols-4
gap-4
sm:gap-6
" data-reveal="up">

<div
class="
rounded-3xl
bg-white/70
dark:bg-slate-900/60
border
border-slate-200
dark:border-slate-700
shadow-lg
p-6
text-center
backdrop-blur
">

<div class="text-4xl mb-2">⏱</div>

<p class="text-xs sm:text-sm uppercase text-slate-500">Prep Time</p>

<p class="text-base sm:text-xl font-bold mt-2">${extra.prepTime || "N/A"}</p>

</div>

<div
class="
rounded-3xl
bg-white/70
dark:bg-slate-900/60
border
border-slate-200
dark:border-slate-700
shadow-lg
p-6
text-center
backdrop-blur
">

<div class="text-4xl mb-2">🔥</div>

<p class="text-xs sm:text-sm uppercase text-slate-500">Cook Time</p>

<p class="text-base sm:text-xl font-bold mt-2">${extra.cookTime || "N/A"}</p>

</div>

<div
class="
rounded-3xl
bg-white/70
dark:bg-slate-900/60
border
border-slate-200
dark:border-slate-700
shadow-lg
p-6
text-center
backdrop-blur
">

<div class="text-4xl mb-2">🍽</div>

<p class="text-xs sm:text-sm uppercase text-slate-500">Servings</p>

<p class="text-base sm:text-xl font-bold mt-2">${extra.servings || "N/A"}</p>

</div>

<div
class="
rounded-3xl
bg-white/70
dark:bg-slate-900/60
border
border-slate-200
dark:border-slate-700
shadow-lg
p-6
text-center
backdrop-blur
">

<div class="text-4xl mb-2">🥣</div>

<p class="text-xs sm:text-sm uppercase text-slate-500">Calories</p>

<p class="text-base sm:text-xl font-bold mt-2">${nutrition.calories || "N/A"}</p>

</div>

</section>

</section>

<!-- TWO-COLUMN EDITORIAL LAYOUT -->

<section
class="
grid
lg:grid-cols-[1.05fr_0.95fr]
gap-8
lg:gap-12
" data-reveal="up">

<!-- LEFT COLUMN: Ingredients / Equipment / Nutrition / Notes -->

<div
class="
space-y-6
lg:space-y-8
">

<div
class="
rounded-4xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-xl
p-7
sm:p-8
">

<h2
class="
text-2xl
sm:text-3xl
font-bold
mb-6
">

Ingredients

</h2>

<ul
class="
space-y-4
sm:space-y-5
">

${ingredients
.filter(i => i.trim())
.map(i => `

<li
class="
flex
items-start
gap-4
p-3
rounded-2xl
hover:bg-orange-500/5
transition-colors
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
shadow-md
">

<i class="fas fa-check"></i>

</div>

<span
class="
text-base
sm:text-lg
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

<div
class="
rounded-4xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-xl
p-7
sm:p-8
">

<h2
class="
text-2xl
sm:text-3xl
font-bold
mb-4
">

Equipment

</h2>

<p class="text-slate-600 dark:text-slate-300 leading-8">

A chef-loved setup for smooth cooking: sharp tools, clean prep, and a reliable pan.

</p>

<div class="mt-4 grid grid-cols-2 gap-3">

<div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-800/30">

<div class="text-3xl">🥄</div>

<div class="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Mixing</div>

</div>

<div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-800/30">

<div class="text-3xl">🍳</div>

<div class="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Cooking</div>

</div>

<div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-800/30">

<div class="text-3xl">🫙</div>

<div class="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Storage</div>

</div>

<div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-800/30">

<div class="text-3xl">🔪</div>

<div class="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Prep</div>

</div>

</div>

</div>

<div
class="
rounded-4xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-xl
p-7
sm:p-8
">

<h2
class="
text-2xl
sm:text-3xl
font-bold
mb-6
">

Nutrition

</h2>

<div
class="
grid
grid-cols-2
sm:grid-cols-2
lg:grid-cols-2
gap-4
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
transition
duration-300
p-6
text-center
hover:shadow-xl
">

<div class="text-4xl mb-3">${item.icon}</div>

<p
class="
uppercase
tracking-wider
text-xs
sm:text-sm
text-slate-500
">

${item.label}

</p>

<p
class="
mt-3
text-lg
sm:text-2xl
font-bold
text-slate-900
dark:text-white
">

${item.value}

</p>

</div>

`).join("")}

</div>

</div>

<!-- Notes -->

<div
class="
rounded-4xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-xl
p-7
sm:p-8
">

<h2
class="
text-2xl
sm:text-3xl
font-bold
mb-4
">

Notes

</h2>

<p class="text-slate-600 dark:text-slate-300 leading-8">

Save this recipe and tweak with your favorite spices—premium flavor is always personal.

</p>

<div class="mt-5 flex flex-wrap gap-3">

<span class="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Make-ahead</span>

<span class="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Chef-friendly</span>

<span class="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Season to taste</span>

</div>

</div>

</div>

<!-- RIGHT COLUMN: Instructions / Tips / Gallery -->

<div
class="
space-y-6
lg:space-y-8
">

<div
class="
rounded-4xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-xl
p-7
sm:p-8
">

<h2
class="
text-2xl
sm:text-3xl
font-bold
mb-6
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

<!-- CHEF'S TIP -->

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
p-7
sm:p-10
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
shadow-md
">

👨‍🍳

</div>

<div>

<h2
class="
text-2xl
sm:text-3xl
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
text-lg
sm:text-xl
leading-9
italic
">

${extra.chefTips || "No chef tips available for this recipe."}

</p>

</div>

</div>

<!-- Gallery (UI only; images use hero image as fallback since data model doesn't provide gallery) -->

<div
class="
rounded-4xl
bg-white
dark:bg-slate-900
border
border-slate-200
dark:border-slate-700
shadow-xl
p-7
sm:p-8
">

<h2
class="
text-2xl
sm:text-3xl
font-bold
mb-6
">

Gallery

</h2>

<div
class="
grid
grid-cols-2
gap-3
">

<div class="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30">

<img
src="${imagePath}"
alt="${selectedRecipe.name}"
loading="lazy"
class="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-[1.06]"
data-fallback="true"
>

</div>

<div class="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30">

<img
src="${imagePath}"
alt="${selectedRecipe.name}"
loading="lazy"
class="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-[1.06]"
data-fallback="true"
>

</div>

<div class="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30">

<img
src="${imagePath}"
alt="${selectedRecipe.name}"
loading="lazy"
class="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-[1.06]"
data-fallback="true"
>

</div>

<div class="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30">

<img
src="${imagePath}"
alt="${selectedRecipe.name}"
loading="lazy"
class="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-[1.06]"
data-fallback="true"
>

</div>

</div>

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

