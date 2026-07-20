const path = require("path");
const fs = require("fs");
const { Recipe, Submission, Comment, Contact } = require("../models");
const { isMongoConnected } = require("../database");
const {
    readJSON,
    writeJSON,
    readComments,
    writeComments,
} = require("./jsonFallback");

const DATA_FOLDER = path.join(__dirname, "..", "data");
const RECIPES_DIR = path.join(DATA_FOLDER, "recipes");
const SUBMISSIONS_FILE = path.join(DATA_FOLDER, "submissions.json");
const CONTACTS_FILE = path.join(DATA_FOLDER, "contacts.json");

/* =========================
   HELPERS
========================= */

function slugify(name = "") {
    return name
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
}

function escapeRegex(value = "") {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalize(str = "") {
    return str.toString().toLowerCase().trim();
}

function normalizeInstructionsToArray(instructions) {
    // Desired DB type: Array<string>
    if (Array.isArray(instructions)) {
        return instructions.map(s => (s == null ? "" : String(s).trim())).filter(Boolean);
    }

    if (typeof instructions === "string") {
        const trimmed = instructions.trim();
        if (!trimmed) return [];

        // Backward compatibility: old data may store HTML like <ol><li>..</li></ol>
        const hasListMarkup = /<\s*(ol|ul)\b/i.test(trimmed) || /<\s*li\b/i.test(trimmed);
        if (hasListMarkup) {
            const liMatches = trimmed.match(/<\s*li\b[^>]*>([\s\S]*?)<\s*\/\s*li\s*>/gi) || [];
            if (liMatches.length) {
                return liMatches
                    .map(liHtml => {
                        const inner = liHtml.replace(/<\s*li\b[^>]*>/i, "").replace(/<\s*\/\s*li\s*>/i, "");
                        const withoutTags = inner.replace(/<[^>]*>/g, "");
                        return withoutTags.replace(/\s+/g, " ").trim();
                    })
                    .filter(Boolean);
            }
        }

        // Fallback: treat as newline-separated text
        return trimmed
            .split(/\r?\n+/g)
            .map(s =>
                s.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, "").trim()
            )
            .filter(Boolean);
    }

    return [];
}

function formatRecipe(recipe) {
    if (!recipe) return null;

    // Convert mongoose document to plain object if needed
    if (typeof recipe.toObject === "function") {
        recipe = recipe.toObject();
    }

    const instructionsArray = normalizeInstructionsToArray(recipe.instructions);

    return {
        ...recipe,

        instructions: instructionsArray,

        // Build instructions as multiple resettable groups.
        // If a step contains a delimiter line like "---" or "\n\n---\n\n",
        // we treat it as a new instruction section.
        // This preserves existing step strings while fixing continuous numbering.
        instructionsHtml: (() => {
            const rawSteps = instructionsArray || [];

            // Split each step on delimiter markers; keep order.
            // Each segment becomes its own numbered <ol>.
            const groups = [];
            let current = [];

            const pushCurrent = () => {
                if (current.length) {
                    groups.push(current);
                    current = [];
                }
            };

            for (const step of rawSteps) {
                const str = step == null ? "" : String(step);

                // delimiter: a line containing only ---
                const parts = str.split(/\n\s*---\s*\n/g);
                for (let idx = 0; idx < parts.length; idx++) {
                    const part = parts[idx].trim();
                    if (!part) continue;

                    // If this isn't the first part, we start a new group.
                    if (idx !== 0) pushCurrent();
                    current.push(part);
                }
            }

            pushCurrent();

            // If no delimiter produced groups, fall back to a single <ol>.
            const finalGroups = groups.length ? groups : [rawSteps.map(s => String(s))];

            return finalGroups
                .map(group =>
                    "<ol>" +
                    (group || []).map(step => `<li>${step}</li>`).join("") +
                    "</ol>"
                )
                .join("");
        })(),


        extraContent: {
            prepTime: recipe.prep_time || "",
            cookTime: recipe.cook_time || "",
            servings: recipe.servings || "",

            chefTips: recipe.chef_tips || "",

            nutrition: {
                calories: recipe.calories || "",
                protein: recipe.protein || "",
                carbs: recipe.carbs || "",
                fat: recipe.fat || ""
            }
        }
    };
}


function getAllRecipeFiles() {
    if (!fs.existsSync(RECIPES_DIR)) return [];
    return fs.readdirSync(RECIPES_DIR).filter(f => f.endsWith(".json"));
}

function readCategoryFile(category) {
    if (!category) return null;
    const filePath = path.join(RECIPES_DIR, `${category}.json`);
    if (!fs.existsSync(filePath)) return null;
    return readJSON(filePath);
}

/* =========================
   DB WRAPPER
========================= */

async function useMongo(operation, fallback) {
    if (!isMongoConnected()) return fallback();

    try {
        return await operation();
    } catch (err) {
    
        console.error(err);
    
        console.warn(
            "Mongo failed. Using JSON fallback."
        );
    
        return fallback();
    
    }
}

/* =========================
   STORAGE
========================= */

const storage = {

    /* =====================
       GET ALL RECIPES
    ===================== */
    //async getRecipes(filter = {})
     /*async getRecipes({ filter = {}, page = 1, limit = 12 }) {
        return useMongo(
    
            async () => {
    
                //const recipes = await Recipe.find(filter).lean();
    
                //return recipes.map(formatRecipe);

                const totalRecipes = await Recipe.countDocuments(filter);
                const totalPages= Math.ceil(totalRecipes / limit);
                const validPage= Math.max(1, Math.min(page, totalPages || 1));
                
                const recipes = await Recipe.find(filter)
                    .sort({ created_at: -1 })
                    .skip((validPage - 1) * limit)
                    .limit(limit)
                    .lean();
                
                return {
                    recipes: recipes.map(formatRecipe),
                
                    pagination: {
                        page: validPage,
                        limit,
                        totalRecipes,
                        totalPages: Math.ceil(totalRecipes / limit),
                        hasPrev: page > 1,
                        hasNext: page * limit < totalRecipes
                    }
                };
    
            },
    
            () => {
    
                const files = getAllRecipeFiles();
    
                let recipes = [];
    
                for (const file of files) {
    
                    const category = file.replace(".json", "");
    
                    const items =
                        readJSON(path.join(RECIPES_DIR, file)) || [];
    
                    recipes.push(
    
                        ...items.map(recipe => ({
                            ...recipe,
                            category
                        }))
    
                    );
    
                }
    
                if (filter.category) {
    
                    recipes = recipes.filter(recipe => {
    
                        if (filter.category instanceof RegExp) {
                            return filter.category.test(recipe.category);
                        }
    
                        return (
                            normalize(recipe.category) ===
                            normalize(filter.category)
                        );
    
                    });
    
                }
    
                //return recipes.map(formatRecipe);
                const totalRecipes = recipes.length;
                const totalPages= Math.ceil(totalRecipes / limit);
                const validPage= Math.max(1, Math.min(page, totalPages || 1));
                
                const paginatedRecipes = recipes.slice(
                    (validPage - 1) * limit,
                    validPage * limit
                );
                
                return {
                    recipes: paginatedRecipes.map(formatRecipe),
                
                    pagination: {
                        page: validPage,
                        limit,
                        totalRecipes,
                        totalPages,
                        hasPrev: page > 1,
                        hasNext: page * limit < totalRecipes
                    }
                };
    
            }
    
        );
    },*/
    async getRecipes({ filter = {}, page = 1, limit = 12 }) {
        return useMongo(
            async () => {
                const totalRecipes = await Recipe.countDocuments(filter);
                
                // Validate page number
                const totalPages = Math.ceil(totalRecipes / limit);
                const validPage = Math.max(1, Math.min(page, totalPages || 1));
                
                const recipes = await Recipe.find(filter)
                    .sort({ created_at: -1 })
                    .skip((validPage - 1) * limit)
                    .limit(limit)
                    .lean();
                
                return {
                    recipes: recipes.map(formatRecipe),
                    pagination: {
                        page: validPage,
                        limit,
                        totalRecipes,
                        totalPages,
                        hasPrev: validPage > 1,
                        hasNext: validPage * limit < totalRecipes
                    }
                };
            },
            () => {
                const files = getAllRecipeFiles();
                let recipes = [];
    
                for (const file of files) {
                    const category = file.replace(".json", "");
                    const items = readJSON(path.join(RECIPES_DIR, file)) || [];
                    recipes.push(
                        ...items.map(recipe => ({
                            ...recipe,
                            category
                        }))
                    );
                }
    
                if (filter.category) {
                    recipes = recipes.filter(recipe => {
                        if (filter.category instanceof RegExp) {
                            return filter.category.test(recipe.category);
                        }
                        return normalize(recipe.category) === normalize(filter.category);
                    });
                }
    
                const totalRecipes = recipes.length;
                const totalPages = Math.ceil(totalRecipes / limit);
                const validPage = Math.max(1, Math.min(page, totalPages || 1));
                
                const paginatedRecipes = recipes.slice(
                    (validPage - 1) * limit,
                    validPage * limit
                );
                
                return {
                    recipes: paginatedRecipes.map(formatRecipe),
                    pagination: {
                        page: validPage,
                        limit,
                        totalRecipes,
                        totalPages,
                        hasPrev: validPage > 1,
                        hasNext: validPage * limit < totalRecipes
                    }
                };
            }
        );
    },

    async getRecipeCategories() {
    
        return useMongo(
    
            async () => {
    
                const recipes = await Recipe.find()
                    .sort({ created_at: -1 })
                    .lean();
    
                const map = new Map();
    
                for (const recipe of recipes) {
    
                    const category = recipe.category;
    
                    if (!map.has(category)) {
    
                        map.set(category, {
                            name: category,
                            count: 0,
                            image: recipe.image,
                            recipes: []
                        });
    
                    }
    
                    const group = map.get(category);
    
                    group.count++;
    
                    if (group.recipes.length < 3) {
    
                        group.recipes.push({
                            name: recipe.name,
                            image: recipe.image
                        });
    
                    }
    
                }
    
                return [...map.values()];
    
            },
    
            () => {
    
                const files = getAllRecipeFiles();
    
                return files.map(file => {
    
                    const items = readJSON(
                        path.join(RECIPES_DIR, file)
                    );
    
                    return {
    
                        name: file.replace(".json", ""),
    
                        count: items.length,
    
                        image: items[0]?.image,
    
                        recipes: items
                            .slice(0, 3)
                            .map(recipe => ({
                                name: recipe.name,
                                image: recipe.image
                            }))
    
                    };
    
                });
    
            }
    
        );
    },

    /* =====================
       GET SINGLE RECIPE (FIXED)
    ===================== */
    async getRecipe(category, recipeSlug) {
    
        const cat = normalize(category);

        // Decode URL-encoded slug, then normalize.
        // This fixes slugs like `spicy-jalapeo-burger` coming from
        // names such as `Spicy Jalapeño Burger`.
        const slug = normalize(decodeURIComponent(recipeSlug));

    
        return useMongo(
    
            async () => {
    
                const normalizedName =
                    slug.replace(/-/g, " ").trim();
    
                    console.log({
                        category: cat,
                        normalizedName
                    });
                const recipe = await Recipe.findOne({
                    category: new RegExp(
                        `^${escapeRegex(cat)}$`,
                        "i"
                    ),
                    name: new RegExp(
                        `^${escapeRegex(normalizedName)}$`,
                        "i"
                    )
                }).lean();console.log(recipe);
    
                return formatRecipe(recipe);
    
            },
    
            () => {
    
                const items =
                    readCategoryFile(cat);
    
                if (!items) return null;
    
                const recipe =
                    items.find(r => {
    
                        return (
                            slugify(r.name) === slug
                        );
    
                    });
    
                return formatRecipe(recipe);
    
            }
    
        );
    
    },

    /* =====================
       SEARCH
    ===================== */
    async searchRecipes(query = "", category = "") {
    
        const q = normalize(query);
    
        const cat = normalize(category);
    
        return useMongo(
    
            async () => {
    
                const filter = {};
    
                if (q) {
    
                    filter.name = {
                        $regex: escapeRegex(q),
                        $options: "i"
                    };
    
                }
    
                if (cat) {
    
                    filter.category =
                        new RegExp(
                            `^${escapeRegex(cat)}$`,
                            "i"
                        );
    
                }
    
                const recipes =
                    await Recipe.find(filter).lean();
    
                return recipes.map(formatRecipe);
    
            },
    
            () => {
    
                const files = getAllRecipeFiles();
    
                let results = [];
    
                for (const file of files) {
    
                    const fileCategory =
                        file.replace(".json", "");
    
                    if (
                        cat &&
                        normalize(fileCategory) !== cat
                    ) {
                        continue;
                    }
    
                    const items =
                        readJSON(
                            path.join(
                                RECIPES_DIR,
                                file
                            )
                        ) || [];
    
                    items.forEach(recipe => {
    
                        if (
                            !q ||
                            recipe.name
                                .toLowerCase()
                                .includes(q)
                        ) {
    
                            results.push({
                                ...recipe,
                                category: fileCategory
                            });
    
                        }
    
                    });
    
                }
    
                return results.map(formatRecipe);
    
            }
    
        );
    
    },

    /* =====================
       CREATE
    ===================== */
    async createRecipe(recipe) {
    
        return useMongo(
    
            async () => {
    
                const created =
                    await Recipe.create(recipe);
    
                return formatRecipe(created);
    
            },
    
            () => {
    
                const filePath =
                    path.join(
                        RECIPES_DIR,
                        `${recipe.category}.json`
                    );
    
                const data =
                    readCategoryFile(recipe.category) || [];
    
                data.push(recipe);
    
                writeJSON(filePath, data);
    
                return formatRecipe(recipe);
    
            }
    
        );
    
    },

    /* =====================
       UPDATE
    ===================== */
    async updateRecipe(id, updates) {
    
        return useMongo(
    
            async () => {
    
                await Recipe.updateOne(
                    { id },
                    updates
                );
    
                const recipe =
                    await Recipe.findOne({ id }).lean();
    
                return formatRecipe(recipe);
    
            },
    
            () => {
    
                const files = getAllRecipeFiles();
    
                let updatedRecipe = null;
    
                for (const file of files) {
    
                    const filePath =
                        path.join(
                            RECIPES_DIR,
                            file
                        );
    
                    const data =
                        readJSON(filePath);
    
                    const recipe =
                        data.find(r => r.id === id);
    
                    if (recipe) {
    
                        Object.assign(
                            recipe,
                            updates
                        );
    
                        updatedRecipe = recipe;
    
                        writeJSON(
                            filePath,
                            data
                        );
    
                        break;
    
                    }
    
                }
    
                return formatRecipe(updatedRecipe);
    
            }
    
        );
    
    },
    

    /* =====================
       DELETE
    ===================== */
    async deleteRecipe(id) {
        return useMongo(
            () => Recipe.deleteOne({ id }),

            () => {
                const files = getAllRecipeFiles();

                for (const file of files) {
                    const filePath = path.join(RECIPES_DIR, file);
                    let data = readJSON(filePath);

                    data = data.filter(r => r.id !== id);

                    writeJSON(filePath, data);
                }
            }
        );
    },

    

    /* =====================
       SUBMISSIONS
    ===================== */
    async createSubmission(recipe) {
        return useMongo(
            () => Submission.create(recipe),

            () => {
                const data = readJSON(SUBMISSIONS_FILE);
                const submissions = Array.isArray(data) ? data : [];

                submissions.push(recipe);
                writeJSON(SUBMISSIONS_FILE, submissions);

                //return recipe;
                return {
                    ...recipe,
                
                    extraContent: {
                        prepTime: recipe.prep_time,
                        cookTime: recipe.cook_time,
                        servings: recipe.servings,
                
                        chefTips: recipe.chef_tips,
                
                        nutrition: {
                            calories: recipe.calories,
                            protein: recipe.protein,
                            carbs: recipe.carbs,
                            fat: recipe.fat
                        }
                    },
                
                    instructions: recipe.instructions
                };
            }
        );
    },

    async getSubmissions() {
    
        return useMongo(
    
            async () => {
    
                const recipes =
                    await Submission.find({})
                        .sort({
                            created_at: -1
                        })
                        .lean();
    
                return recipes.map(formatRecipe);
    
            },
    
            () => {
    
                const data =
                    readJSON(
                        SUBMISSIONS_FILE
                    );
    
                const recipes =
                    Array.isArray(data)
                        ? data
                        : [];
    
                return recipes.map(formatRecipe);
    
            }
    
        );
    
    },

    async getSubmission(id) {
    
        return useMongo(
    
            async () => {
    
                const recipe =
                    await Submission.findOne({
                        id
                    }).lean();
    
                return formatRecipe(recipe);
    
            },
    
            () => {
    
                const data =
                    readJSON(
                        SUBMISSIONS_FILE
                    );
    
                const recipe =
                    (Array.isArray(data)
                        ? data
                        : []
                    ).find(
                        r => r.id === id
                    );
    
                return formatRecipe(recipe);
    
            }
    
        );
    
    },

    async deleteSubmission(id) {
        return useMongo(
            () => Submission.deleteOne({ id }),
    
            () => {
                const data = readJSON(SUBMISSIONS_FILE);
                const updated = (Array.isArray(data) ? data : []).filter(r => r.id !== id);
                writeJSON(SUBMISSIONS_FILE, updated);
            }
        );
    },



    /* =====================
       COMMENTS
    ===================== */
    async getComments(recipeSlug, approvedOnly = false) {
        return useMongo(
            () => {
                const filter = { recipe_slug: recipeSlug };
                if (approvedOnly) filter.approved = true;

                return Comment.find(filter)
                    .sort({ created_at: -1 })
                    .lean();
            },
            () => {
                const data = readComments();
                let comments = data[recipeSlug] || [];

                if (approvedOnly) {
                    comments = comments.filter(c => c.approved);
                }

                return comments.sort(
                    (a, b) =>
                        new Date(b.created_at) - new Date(a.created_at)
                );
            }
        );
    },
    
    async createComment(comment) {
        return useMongo(
    
            async () => {
                return Comment.create(comment);
            },
    
            () => {
                const data = readComments();
    
                if (!data[comment.recipe_slug]) {
                    data[comment.recipe_slug] = [];
                }
    
                data[comment.recipe_slug].push(comment);
    
                writeComments(data);
    
                return comment;
            }
    
        );
    },
    
    async approveComment(id) {
        return useMongo(
    
            () =>
                Comment.updateOne(
                    { id },
                    { approved: true }
                ),
    
            () => {
    
                const data = readComments();
    
                for (const slug of Object.keys(data)) {
    
                    const comment =
                        data[slug].find(
                            c => c.id === id
                        );
    
                    if (comment) {
                        comment.approved = true;
    
                        writeComments(data);
    
                        return comment;
                    }
                }
    
                return null;
            }
    
        );
    },
    
    async deleteComment(id) {
        return useMongo(
    
            () =>
                Comment.deleteOne({ id }),
    
            () => {
    
                const data = readComments();
    
                for (const slug of Object.keys(data)) {
    
                    data[slug] =
                        data[slug].filter(
                            c => c.id !== id
                        );
                }
    
                writeComments(data);
    
                return true;
            }
    
        );
    },

    async getAllComments(approved = null) {
        return useMongo(
    
            () => {
    
                const filter = {};
    
                if (approved !== null) {
                    filter.approved = approved;
                }
    
                return Comment.find(filter)
                    .sort({ created_at: -1 })
                    .lean();
    
            },
    
            () => {
    
                const data = readComments();
    
                return Object.entries(data)
                    .flatMap(([recipe_slug, comments]) =>
                        comments
                            .filter(comment => {
    
                                if (approved === null) return true;
    
                                return comment.approved === approved;
    
                            })
                            .map(comment => ({
                                ...comment,
                                recipe_slug
                            }))
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.created_at) -
                            new Date(a.created_at)
                    );
    
            }
    
        );
    },

    async updateComment(id, recipeSlug, updates) {
        return useMongo(
            () =>
                Comment.updateOne(
                    {
                        id,
                        recipe_slug: recipeSlug
                    },
                    {
                        $set: updates
                    }
                ),
    
            () => {
                const data = readComments();
    
                if (!data[recipeSlug]) return;
    
                const comment = data[recipeSlug].find(
                    c => c.id == id
                );
    
                if (comment) {
                    Object.assign(comment, updates);
                    writeComments(data);
                }
            }
        );
    },

    async batchUpdateComments(comments) {
        for (const comment of comments) {
    
            if (comment.action === "approve") {
                await this.updateComment(
                    comment.id,
                    comment.recipeSlug,
                    { approved: true }
                );
            }
    
            else if (comment.action === "disapprove") {
                await this.updateComment(
                    comment.id,
                    comment.recipeSlug,
                    { approved: false }
                );
            }
    
            else if (comment.action === "delete") {
                await this.deleteComment(
                    comment.id,
                    comment.recipeSlug
                );
            }
    
        }
    },

    /* =====================
       CONTACTS
    ===================== */
    
    async getContacts() {
        return useMongo(
    
            async () => {
                if (!Contact) throw new Error("No Contact model");
                return await Contact.find({})
                    .sort({ created_at: -1 })
                    .lean();
            },
    
            () => {
                const contacts = readJSON(CONTACTS_FILE);
                return Array.isArray(contacts) ? contacts : [];
            }
    
        );
    },
    
    async getContact(id) {
    
        return useMongo(
    
            async () => {
                if (!Contact) throw new Error("No Contact model");
                return await Contact.findOne({ id }).lean();
            },
    
            () => {
                const contacts = readJSON(CONTACTS_FILE);
                return (Array.isArray(contacts) ? contacts : [])
                    .find(contact => contact.id === id);
            }
    
        );
    
    },
    
    async createContact(contact) {
    
        return useMongo(
    
            async () => {
                if (!Contact) throw new Error("No Contact model");
                return await Contact.create(contact);
            },
    
            () => {
                const contacts = readJSON(CONTACTS_FILE);
    
                const data = Array.isArray(contacts)
                    ? contacts
                    : [];
    
                data.push(contact);
    
                writeJSON(CONTACTS_FILE, data);
    
                return contact;
            }
    
        );
    
    },
    
    async deleteContact(id) {
    
        return useMongo(
    
            async () => {
                if (!Contact) throw new Error("No Contact model");
                return await Contact.deleteOne({ id });
            },
    
            () => {
                const contacts = readJSON(CONTACTS_FILE);
    
                const updated = (Array.isArray(contacts)
                    ? contacts
                    : []
                ).filter(contact => contact.id !== id);
    
                writeJSON(CONTACTS_FILE, updated);
    
                return true;
            }
    
        );
    
    },

    async markContactRead(id) {
        return useMongo(
    
            () =>
                Contact.updateOne(
                    { id },
                    { status: "read" }
                ),
    
            () => {
                const contacts = readJSON(CONTACTS_FILE);
    
                const data = Array.isArray(contacts)
                    ? contacts
                    : [];
    
                const contact = data.find(c => c.id === id);
    
                if (contact) {
                    contact.status = "read";
                    writeJSON(CONTACTS_FILE, data);
                }
    
                return contact;
            }
    
        );
    },

    async updateSubmission(id, data) {
        console.log("Updating:", id);
        console.log(data);
    
        const recipe = await Submission.findOneAndUpdate(
            { id },
            {
                $set: data
            },
            {
                new: true,
                runValidators: true
            }
        ).lean();
    
        console.log("RESULT:", recipe);
    
        return recipe;
    }
};

module.exports = storage;