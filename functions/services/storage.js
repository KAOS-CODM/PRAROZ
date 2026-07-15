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

function formatRecipe(recipe) {
    if (!recipe) return null;

    // Convert mongoose document to plain object if needed
    if (typeof recipe.toObject === "function") {
        recipe = recipe.toObject();
    }

    return {
        ...recipe,

        instructions:
            recipe.instructions,

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
    async getRecipes(filter = {}) {
        return useMongo(
    
            async () => {
    
                const recipes = await Recipe.find(filter).lean();
    
                return recipes.map(formatRecipe);
    
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
    
                return recipes.map(formatRecipe);
    
            }
    
        );
    },

    /* =====================
       GET SINGLE RECIPE (FIXED)
    ===================== */
    async getRecipe(category, recipeSlug) {
    
        const cat = normalize(category);
    
        const slug = normalize(recipeSlug);
    
        return useMongo(
    
            async () => {
    
                const normalizedName =
                    slug.replace(/-/g, " ").trim();
    
                const recipe =
                    await Recipe.findOne({
    
                        category: cat,
    
                        name: new RegExp(
                            `^${escapeRegex(normalizedName)}$`,
                            "i"
                        )
    
                    }).lean();
    
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
    }
};

module.exports = storage;