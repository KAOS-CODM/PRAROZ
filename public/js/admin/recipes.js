(function () {
  const state = {
    view: "pending",
    recipes: [],
    filteredRecipes: [],
    searchQuery: "",
  };

  

  function getRecipeImage(recipe) {
    return (
      recipe.image ||
      recipe.imageUrl ||
      recipe.thumbnail ||
      "/images/download.webp"
    );
  }

  function getRecipeMetrics(recipe) {
    const prepTime = recipe.prepTime || recipe.prep_time || "—";
    const cookTime = recipe.cookTime || recipe.cook_time || "—";
    const servings = recipe.servings || "—";
    return { prepTime, cookTime, servings };
  }

  function formatList(items) {
    if (Array.isArray(items)) return items;
    return items ? [items] : [];
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
    const pendingCount = state.recipes.filter((r) => r.status !== "approved").length;
    const approvedCount = state.recipes.filter((r) => r.status === "approved").length;

    const pendingEl = document.getElementById("stat-pending-recipes");
    const approvedEl = document.getElementById("stat-approved-recipes");
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (approvedEl) approvedEl.textContent = approvedCount;
  }

  function renderRecipes() {
    const container = document.getElementById("recipe-list");
    if (!container) return;

    const query = (state.searchQuery || "").trim().toLowerCase();
    
    const visibleRecipes = (state.filteredRecipes || []).filter((recipe) => {
      if (!query) return true;
    
      const text = `
        ${recipe.name || ""}
        ${recipe.category || ""}
        ${recipe.description || ""}
        ${formatList(recipe.ingredients).join(" ")}
        ${formatList(recipe.instructions).join(" ")}
      `.toLowerCase();
    
      return text.includes(query);
    });

    if (!visibleRecipes.length) {
      container.innerHTML = `
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 class="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">No recipes match your search</h3>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Try again with a different keyword.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="grid gap-6 md:grid-cols-2">
        ${visibleRecipes
          .map((recipe) => {
            const { prepTime, cookTime, servings } = getRecipeMetrics(recipe);
            const { description, ingredients, instructions } = getRecipeText(recipe);
            const isApproved = recipe.status === "approved";

            return `
              <article class="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                <div class="overflow-hidden rounded-2xl">
                  <img
                    src="${getRecipeImage(recipe)}"
                    alt="${recipe.name || "Recipe image"}"
                    class="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                    onerror="this.onerror=null;this.src='/images/download.webp';"
                  />
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
                  <div class="rounded-xl bg-slate-50 p-2 text-center dark:bg-slate-700"><div class="text-[11px] uppercase tracking-wide text-slate-400">Prep</div><div class="mt-1 font-semibold">${prepTime}</div></div>
                  <div class="rounded-xl bg-slate-50 p-2 text-center dark:bg-slate-700"><div class="text-[11px] uppercase tracking-wide text-slate-400">Cook</div><div class="mt-1 font-semibold">${cookTime}</div></div>
                  <div class="rounded-xl bg-slate-50 p-2 text-center dark:bg-slate-700"><div class="text-[11px] uppercase tracking-wide text-slate-400">Serves</div><div class="mt-1 font-semibold">${servings}</div></div>
                </div>
                <div class="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <p class="font-semibold text-slate-900 dark:text-slate-100">Ingredients</p>
                    <ul class="mt-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 line-clamp-4">
                      ${formatList(recipe.ingredients)
                        .map(item => `<li>${item}</li>`)
                        .join("")}
                    </ul>
                  </div>
                  <div>
                    <p class="font-semibold text-slate-900 dark:text-slate-100">Instructions</p>
                    <ol class="mt-2 list-decimal pl-5 text-sm text-slate-600 dark:text-slate-300 line-clamp-4">
                      ${formatList(recipe.instructions)
                        .map(step => `<li>${step}</li>`)
                        .join("")}
                    </ol>
                  </div>
                </div>
                <div class="mt-6 flex flex-wrap gap-2">
                  ${isApproved ? `
                    <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700" data-action="disapprove" data-id="${recipe.id || recipe._id}">
                      Disapprove
                    </button>
                  ` : `
                    <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                        data-action="approve"
                        data-id="${recipe.id || recipe._id}">
                        Approve
                    </button>
                    
                    <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-xl border border-blue-300 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
                        data-action="edit"
                        data-id="${recipe.id || recipe._id}">
                        Edit
                    </button>
                  `}
                  <button type="button" class="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30" data-action="delete" data-id="${recipe.id || recipe._id}">
                    Delete
                  </button>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;

    container
      .querySelectorAll("[data-action]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          handleRecipeAction(button.dataset.action, button.dataset.id);
        });
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

    window.adminApi.showLoader("recipe-list");

    try {
      const endpoint =
        state.view === "approved"
          ? "/approved-recipes"
          : "/unapproved-recipes";
    
      const recipes = await window.adminApi.apiCall(endpoint);
    
      const mapped = Array.isArray(recipes)
        ? recipes.map((r) => ({
            ...r,
            status: state.view === "approved" ? "approved" : "pending",
          }))
        : [];
    
      state.recipes = mapped;
      state.filteredRecipes = mapped;
      console.log(mapped[0]);
    
      renderStats();
      renderRecipes();
    
    } catch (error) {
    
      window.adminApi.showToast(
        error.message || "Unable to load recipes",
        "error"
      );
    
    }
  }

  async function handleRecipeAction(action, id) {

    if (action === "edit") {
      openEditModal(id);
      return;
    }

    const confirmed = await window.adminApi.confirmModal({
      title:
        action === "approve"
          ? "Approve recipe"
          : action === "disapprove"
            ? "Disapprove recipe"
            : "Delete recipe",
      message:
        action === "approve"
          ? "Approve this recipe?"
          : action === "disapprove"
            ? "Move this recipe back to pending?"
            : "Delete this recipe?",
      confirmLabel:
        action === "delete" ? "Delete" : action === "disapprove" ? "Disapprove" : "Approve",
      confirmClass:
        action === "delete"
          ? "bg-rose-600 text-white hover:bg-rose-500"
          : "bg-emerald-600 text-white hover:bg-emerald-500",
    });

    if (!confirmed) return;

    try {
      if (action === "approve") {
        await window.adminApi.apiCall("/approve-recipe", "POST", { id });
      } else if (action === "disapprove") {
        await window.adminApi.apiCall("/disapprove-recipe", "POST", { id });
      } else {
        await window.adminApi.apiCall("/delete-recipe", "POST", {
          id,
          type: state.view === "approved" ? "approved" : "unapproved",
        });
      }

      window.adminApi.showToast("Action completed", "success");
      fetchRecipes();
    } catch (error) {
      window.adminApi.showToast(error.message || "Action failed", "error");
    }
  }

  function openEditModal(id) {
    const recipe = state.recipes.find(
      r => (r.id || r._id) == id
    );
  
    if (!recipe) {
      window.adminApi.showToast("Recipe not found", "error");
      return;
    }
  
    const root = document.getElementById("edit-modal-root");
  
    root.innerHTML = `
  <div class="fixed inset-0 z-50 bg-black/60 overflow-y-auto p-6">
  
  <div class="mx-auto max-w-5xl rounded-3xl bg-white dark:bg-slate-900 p-8">
  
  <h2 class="text-2xl font-bold mb-8">
  Edit Recipe
  </h2>
  
  <div class="grid md:grid-cols-2 gap-6">
  
  <div>
  <label class="font-medium">Recipe Name</label>
  
  <input
  id="edit-name"
  class="mt-2 w-full rounded-xl border p-3"
  value="${String(recipe.name || "").replace(/"/g, "&quot;")}">
  </div>
  
  <div>
  <label class="font-medium">Category</label>
  
  <select
  id="edit-category"
  class="mt-2 w-full rounded-xl border p-3">
  
  <option ${recipe.category==="desserts"?"selected":""}>Desserts</option>
  <option ${recipe.category==="burgers"?"selected":""}>Burgers</option>
  <option ${recipe.category==="pizza"?"selected":""}>Pizza</option>
  <option ${recipe.category==="pasta"?"selected":""}>Pasta</option>
  <option ${recipe.category==="salads"?"selected":""}>Salads</option>
  <option ${recipe.category==="appetizers"?"selected":""}>Appetizers</option>
  
  </select>
  </div>
  
  <div>
  <label class="font-medium">Prep Time</label>
  
  <input
  id="edit-prep"
  class="mt-2 w-full rounded-xl border p-3"
  value="${recipe.prepTime || recipe.prep_time || ""}">
  </div>
  
  <div>
  <label class="font-medium">Cook Time</label>
  
  <input
  id="edit-cook"
  class="mt-2 w-full rounded-xl border p-3"
  value="${recipe.cookTime || recipe.cook_time || ""}">
  </div>
  
  <div>
  <label class="font-medium">Servings</label>
  
  <input
  id="edit-servings"
  class="mt-2 w-full rounded-xl border p-3"
  value="${recipe.servings || ""}">
  </div>
  
  </div>

  <div class="mt-8">
      <label class="block font-medium mb-3">
          Recipe Image
      </label>
  
      <img
          id="edit-image-preview"
          src="${recipe.image || '/images/download.webp'}"
          class="w-full max-h-64 object-cover rounded-2xl border"
      >
  
      <input
          id="edit-image"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          class="mt-4"
      >
  </div>
  
  <div class="mt-8">
  
  <label class="font-medium">
  Description
  </label>
  
  <textarea
  id="edit-description"
  rows="4"
  class="mt-2 w-full rounded-xl border p-3">${recipe.description || ""}</textarea>
  
  </div>
  
  <div class="mt-8">
  
  <div class="flex items-center justify-between">
  
  <label class="font-medium">
  Ingredients
  </label>
  
  <button
  id="add-ingredient"
  type="button"
  class="rounded-xl bg-blue-600 text-white px-4 py-2">
  
  + Add Ingredient
  
  </button>
  
  </div>
  
  <div
  id="ingredients-container"
  class="space-y-2 mt-4">
  
  </div>
  
  </div>
  
  <div class="mt-8">
  
  <div class="flex items-center justify-between">
  
  <label class="font-medium">
  Instructions
  </label>
  
  <button
  id="add-step"
  type="button"
  class="rounded-xl bg-blue-600 text-white px-4 py-2">
  
  + Add Step
  
  </button>
  
  </div>
  
  <div
  id="instructions-container"
  class="space-y-2 mt-4">
  
  </div>
  
  </div>

  <div class="mt-8">
  
  <label class="font-medium">
  Chef Tips
  </label>
  
  <textarea
  id="edit-chefTips"
  rows="3"
  class="mt-2 w-full rounded-xl border p-3">${
  recipe.chefTips ||
  recipe.chef_tips ||
  ""
  }</textarea>
  
  </div>
  
  <div class="mt-8 grid md:grid-cols-4 gap-4">
  
  <div>
  <label>Calories</label>
  
  <input
  id="edit-calories"
  class="mt-2 w-full rounded-xl border p-3"
  value="${recipe.calories || ""}">
  </div>
  
  <div>
  <label>Protein</label>
  
  <input
  id="edit-protein"
  class="mt-2 w-full rounded-xl border p-3"
  value="${recipe.protein || ""}">
  </div>
  
  <div>
  <label>Carbs</label>
  
  <input
  id="edit-carbs"
  class="mt-2 w-full rounded-xl border p-3"
  value="${recipe.carbs || ""}">
  </div>
  
  <div>
  <label>Fat</label>
  
  <input
  id="edit-fat"
  class="mt-2 w-full rounded-xl border p-3"
  value="${recipe.fat || ""}">
  </div>
  
  </div>
  
  <div class="mt-10 flex justify-end gap-3">
  
  <button
  id="cancel-edit"
  class="rounded-xl border px-5 py-2">
  
  Cancel
  
  </button>
  
  <button
  id="save-edit"
  data-id="${recipe.id || recipe._id}"
  class="rounded-xl bg-emerald-600 text-white px-5 py-2">
  
  Save Changes
  
  </button>
  
  </div>
  
  </div>
  
  </div>
  `;
  
    const ingredientsContainer =
      document.getElementById("ingredients-container");
  
    formatList(recipe.ingredients).forEach(item => {
  
      ingredientsContainer.insertAdjacentHTML(
        "beforeend",
        `
  <div class="flex gap-2">
  
  <input
  class="ingredient-input flex-1 rounded-xl border p-3"
  value="${String(item).replace(/"/g,"&quot;")}">
  
  <button
  type="button"
  class="remove-ingredient rounded-xl bg-red-500 px-4 text-white">
  
  ✕
  
  </button>
  
  </div>
  `
      );
  
    });
  
    const instructionsContainer =
      document.getElementById("instructions-container");
  
    formatList(recipe.instructions || []).forEach(step => {
  
      instructionsContainer.insertAdjacentHTML(
        "beforeend",
        `
  <div class="flex gap-2">
  
  <textarea
  class="instruction-input flex-1 rounded-xl border p-3">${String(step)}</textarea>
  
  <button
  type="button"
  class="remove-step rounded-xl bg-red-500 px-4 text-white">
  
  ✕
  
  </button>
  
  </div>
  `
      );
  
    });
  
    document
      .getElementById("add-ingredient")
      .addEventListener("click", () => {
  
        ingredientsContainer.insertAdjacentHTML(
          "beforeend",
          `
  <div class="flex gap-2">
  
  <input
  class="ingredient-input flex-1 rounded-xl border p-3">
  
  <button
  type="button"
  class="remove-ingredient rounded-xl bg-red-500 px-4 text-white">
  
  ✕
  
  </button>
  
  </div>
  `
        );
  
      });
  
    document
      .getElementById("add-step")
      .addEventListener("click", () => {
  
        instructionsContainer.insertAdjacentHTML(
          "beforeend",
          `
  <div class="flex gap-2">
  
  <textarea
  class="instruction-input flex-1 rounded-xl border p-3"></textarea>
  
  <button
  type="button"
  class="remove-step rounded-xl bg-red-500 px-4 text-white">
  
  ✕
  
  </button>
  
  </div>
  `
        );
  
      });
  
    ingredientsContainer.addEventListener("click", (e) => {
  
      if (e.target.classList.contains("remove-ingredient")) {
  
        e.target.parentElement.remove();
  
      }
  
    });
  
    instructionsContainer.addEventListener("click", (e) => {
  
      if (e.target.classList.contains("remove-step")) {
  
        e.target.parentElement.remove();
  
      }
  
    });

    const imageInput =
    document.getElementById("edit-image");
    
    const preview =
    document.getElementById("edit-image-preview");
    
    imageInput.addEventListener("change", () => {
    
        const file = imageInput.files[0];
    
        if (!file) return;
    
        preview.src = URL.createObjectURL(file);
    
    });
  
    document
      .getElementById("cancel-edit")
      .addEventListener("click", () => {
  
        root.innerHTML = "";
  
      });
  
    document
      .getElementById("save-edit")
      .addEventListener("click", saveRecipeChanges);
  
  }
  

  async function saveRecipeChanges() {
  
    const id = document
      .getElementById("save-edit")
      .dataset.id;

      let imageUrl = state.recipes.find(
          r => (r.id || r._id) == id
      )?.image || "";

      const imageInput = document.getElementById("edit-image");
      
      if (imageInput.files.length) {
      
          imageUrl = await uploadImageToCloudinary(
              imageInput.files[0]
          );
      
      }
  
    const updatedRecipe = {
  
      id,

      image: imageUrl,
  
      name: document
        .getElementById("edit-name")
        .value
        .trim(),
  
      category: document
        .getElementById("edit-category")
        .value
        .trim(),
  
      description: document
        .getElementById("edit-description")
        .value
        .trim(),
  
      prepTime: document
        .getElementById("edit-prep")
        .value
        .trim(),
  
      cookTime: document
        .getElementById("edit-cook")
        .value
        .trim(),
  
      servings: document
        .getElementById("edit-servings")
        .value
        .trim(),

      chefTips: document
          .getElementById("edit-chefTips")
          .value
          .trim(),
      
      calories: document
          .getElementById("edit-calories")
          .value
          .trim(),
      
      protein: document
          .getElementById("edit-protein")
          .value
          .trim(),
      
      carbs: document
          .getElementById("edit-carbs")
          .value
          .trim(),
      
      fat: document
          .getElementById("edit-fat")
          .value
          .trim(),
  
      ingredients: Array.from(
  
        document.querySelectorAll(".ingredient-input")
  
      )
  
      .map(i => i.value.trim())
  
      .filter(Boolean),
  
      instructions: Array.from(
  
        document.querySelectorAll(".instruction-input")
  
      )
  
      .map(i => i.value.trim())
  
      .filter(Boolean)
  
    };
  
    try {

      console.log(updatedRecipe);
    
        await window.adminApi.apiCall(
    
            "/update-recipe",
    
            "PUT",
    
            updatedRecipe
    
        );
    
        window.adminApi.showToast(
    
            "Recipe updated successfully",
    
            "success"
    
        );
    
        document
            .getElementById("edit-modal-root")
            .innerHTML = "";
    
        fetchRecipes();
    
    }
    catch(error){
    
        window.adminApi.showToast(
    
            error.message,
    
            "error"
    
        );
    
    }
  
  }

  async function uploadImageToCloudinary(imageFile) {
  
      const formData = new FormData();
  
      formData.append("file", imageFile);
      formData.append(
          "upload_preset",
          window.CLOUDINARY_UPLOAD_PRESET
      );
      formData.append(
          "cloud_name",
          window.CLOUDINARY_CLOUD_NAME
      );
  
      const response = await fetch(
  
          `https://api.cloudinary.com/v1_1/${window.CLOUDINARY_CLOUD_NAME}/image/upload`,
  
          {
              method: "POST",
              body: formData
          }
  
      );
  
      if (!response.ok)
          throw new Error("Cloudinary upload failed.");
  
      const data = await response.json();
  
      return data.secure_url;
  
  }

  document.addEventListener("DOMContentLoaded", () => {
    document
      .querySelectorAll("[data-tab]")
      .forEach((tab) =>
        tab.addEventListener("click", () => setActiveTab(tab.dataset.tab))
      );

    document.addEventListener("admin:search", (event) => {
      state.searchQuery = event.detail || "";
      renderRecipes();
    });

    // default tab
    setActiveTab("pending");
  });
})();
