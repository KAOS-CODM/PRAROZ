(function () {
  const state = {
    view: "pending",
    recipes: [],
    filteredRecipes: [],
    searchQuery: "",
  };

  function formatList(items) {
    return Array.isArray(items) ? items : items ? [items] : [];
  }

  function getRecipeImage(recipe) {
    return recipe.image || "/images/download.webp";
  }

  function getRecipeMetrics(recipe) {
    const prepTime = recipe.prepTime || recipe.prep_time || "—";
    const cookTime = recipe.cookTime || recipe.cook_time || "—";
    const servings = recipe.servings || "—";

    return { prepTime, cookTime, servings };
  }

  function getRecipeText(recipe) {
    const instructions = formatList(recipe.instructions);
    const ingredients = formatList(recipe.ingredients);

    return {
      instructions: instructions.length ? instructions.join(" • ") : "Not provided",
      ingredients: ingredients.length ? ingredients.join(", ") : "Not provided",
      description: recipe.description || "No description available.",
    };
  }

  function renderStats() {
    const pendingCount = state.recipes.filter((recipe) => recipe.status !== "approved").length;
    const approvedCount = state.recipes.filter((recipe) => recipe.status === "approved").length;

    document.getElementById("stat-pending-recipes").textContent = pendingCount;
    document.getElementById("stat-approved-recipes").textContent = approvedCount;
  }

  function renderRecipes() {
    const container = document.getElementById("recipe-list");
    if (!container) return;

    const query = state.searchQuery.toLowerCase();
    const visibleRecipes = (state.filteredRecipes || []).filter((recipe) => {
      if (!query) return true;
      const text = `${recipe.name || ""} ${recipe.category || ""} ${recipe.description || ""}`.toLowerCase();
      return text.includes(query);
    });

    if (!visibleRecipes.length) {
      container.innerHTML = `
        <div class="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"></path><path d="M7 7V4h10v3"></path><path d="M5 7l1 13h12l1-13"></path></svg>
          </div>
          <h3 class="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">No recipes match your search</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Try changing the filters or check back later.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        ${visibleRecipes.map((recipe) => {
          const { prepTime, cookTime, servings } = getRecipeMetrics(recipe);
          const { description, ingredients, instructions } = getRecipeText(recipe);
          const isApproved = recipe.status === "approved";
          return `
            <article class="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <div class="overflow-hidden rounded-2xl">
                <img src="${getRecipeImage(recipe)}" alt="${recipe.name || "Recipe image"}" class="h-44 w-full object-cover transition duration-300 group-hover:scale-105" onerror="this.onerror=null;this.src='/images/download.webp';">
              </div>
              <div class="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">${recipe.name || "Untitled recipe"}</h3>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${recipe.category || "Uncategorized"}</p>
                </div>
                <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">${isApproved ? "Approved" : "Pending"}</span>
              </div>
              <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">${description}</p>
              <div class="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-600 dark:text-slate-300">
                <div class="rounded-xl bg-slate-50 p-2 text-center dark:bg-slate-700/70"><div class="text-[11px] uppercase tracking-wide text-slate-400">Prep</div><div class="mt-1 font-semibold">${prepTime}</div></div>
                <div class="rounded-xl bg-slate-50 p-2 text-center dark:bg-slate-700/70"><div class="text-[11px] uppercase tracking-wide text-slate-400">Cook</div><div class="mt-1 font-semibold">${cookTime}</div></div>
                <div class="rounded-xl bg-slate-50 p-2 text-center dark:bg-slate-700/70"><div class="text-[11px] uppercase tracking-wide text-slate-400">Serves</div><div class="mt-1 font-semibold">${servings}</div></div>
              </div>
              <div class="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p class="font-semibold text-slate-900 dark:text-slate-100">Ingredients</p>
                  <p class="mt-1 line-clamp-3">${ingredients}</p>
                </div>
                <div>
                  <p class="font-semibold text-slate-900 dark:text-slate-100">Instructions</p>
                  <p class="mt-1 line-clamp-3">${instructions}</p>
                </div>
              </div>
              <div class="mt-6 flex flex-wrap gap-2">
                ${isApproved ? `
                  <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700" data-action="disapprove" data-id="${recipe.id}">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                    Disapprove
                  </button>
                ` : `
                  <button type="button" class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500" data-action="approve" data-id="${recipe.id}">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                    Approve
                  </button>
                `}
                <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30" data-action="delete" data-id="${recipe.id}">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>
                  Delete
                </button>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    `;

    container.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => handleRecipeAction(button.dataset.action, button.dataset.id));
    });
  }

  function setActiveTab(activeTab) {
    state.view = activeTab;
    document.querySelectorAll("[data-tab]").forEach((tab) => {
      const isActive = tab.dataset.tab === activeTab;
      tab.classList.toggle("border-emerald-500", isActive);
      tab.classList.toggle("text-emerald-600", isActive);
      tab.classList.toggle("dark:text-emerald-300", isActive);
      tab.classList.toggle("text-slate-500", !isActive);
      tab.classList.toggle("dark:text-slate-400", !isActive);
    });
    fetchRecipes();
  }

  async function fetchRecipes() {
    const container = document.getElementById("recipe-list");
    if (!container) return;
    showLoader("recipe-list");

    try {
      const endpoint = state.view === "approved" ? "/approved-recipes" : "/unapproved-recipes";
      const recipes = await apiCall(endpoint);
      const mapped = Array.isArray(recipes) ? recipes.map((recipe) => ({ ...recipe, status: state.view === "approved" ? "approved" : "pending" })) : [];
      state.recipes = mapped;
      state.filteredRecipes = mapped;
      renderStats();
      renderRecipes();
      showToast(state.view === "approved" ? "Approved recipes loaded" : "Pending recipes loaded", "success");
    } catch (error) {
      showToast(error.message || "Unable to load recipes", "error");
    }
  }

  async function handleRecipeAction(action, id) {
    const targetRecipe = state.recipes.find((recipe) => recipe.id === id);
    if (!targetRecipe) return;

    const confirmed = await confirmModal({
      title: action === "approve" ? "Approve recipe" : action === "disapprove" ? "Disapprove recipe" : "Delete recipe",
      message: action === "approve" ? `Approve ${targetRecipe.name || "this recipe"}?` : action === "disapprove" ? `Move ${targetRecipe.name || "this recipe"} back to pending?` : `Delete ${targetRecipe.name || "this recipe"}?`,
      confirmLabel: action === "delete" ? "Delete" : action === "disapprove" ? "Disapprove" : "Approve",
      confirmClass: action === "delete" ? "bg-rose-600 text-white hover:bg-rose-500" : "bg-emerald-600 text-white hover:bg-emerald-500",
    });

    if (!confirmed) return;

    try {
      if (action === "approve") {
        await apiCall("/approve-recipe", "POST", { id });
      } else if (action === "disapprove") {
        await apiCall("/disapprove-recipe", "POST", { id });
      } else {
        await apiCall("/delete-recipe", "POST", { id, type: state.view === "approved" ? "approved" : "unapproved" });
      }
      showToast(action === "delete" ? "Recipe deleted" : action === "disapprove" ? "Recipe moved back to pending" : "Recipe approved", "success");
      fetchRecipes();
    } catch (error) {
      showToast(error.message || "Action failed", "error");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "/adminLogin";
      return;
    }

    document.querySelectorAll("[data-tab]").forEach((tab) => {
      tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
    });

    document.addEventListener("admin:search", (event) => {
      state.searchQuery = event.detail || "";
      renderRecipes();
    });

    fetchRecipes();
  });

  window.fetchApprovedRecipes = () => setActiveTab("approved");
  window.fetchUnapprovedRecipes = () => setActiveTab("pending");
  window.approveRecipe = (id) => handleRecipeAction("approve", id);
  window.deleteRecipe = (id, type) => {
    state.view = type === "approved" ? "approved" : "pending";
    handleRecipeAction("delete", id);
  };
  window.disapproveRecipe = (id) => handleRecipeAction("disapprove", id);
})();
