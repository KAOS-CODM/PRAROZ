const express = require("express");
const path = require("path");
const { requireAdmin, adminValidateRoute } = require("../services/auth");
const storage = require("../services/storage");

const router = express.Router();

router.post("/validate-admin", express.json(), adminValidateRoute);

router.get("/approved-recipes", requireAdmin, async (_req, res) => {
    try {
        const results = await storage.getRecipes({
            filter: {},
            page: 1,
            limit: 100
        });
        res.json(results.recipes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/unapproved-recipes", requireAdmin, async (_req, res) => {
    try {
        const submissions = await storage.getSubmissions();
        res.json(submissions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/admin.html", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../public/admin.html"));
});

router.post("/approve-recipe", requireAdmin, express.json(), async (req, res) => {
    try {
        const { id } = req.body;

        const recipe = await storage.getSubmission(id);

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found!",
            });
        }

        await storage.createRecipe(recipe);
        await storage.deleteSubmission(id);

        res.json({
            message: "Recipe approved successfully!",
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});

router.post("/disapprove-recipe", requireAdmin, express.json(), async (req, res) => {
    try {
        const { id } = req.body;

        const recipesResult = await storage.getRecipes({
            filter: {},
            page: 1,
            limit: 100
        });
        const recipe = recipesResult.recipes?.find(r => r.id === id);

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found!",
            });
        }

        await storage.createSubmission(recipe);
        await storage.deleteRecipe(id);

        res.json({
            message: "Recipe disapproved successfully!",
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});

router.post("/delete-recipe", requireAdmin, express.json(), async (req, res) => {
    try {
        const { id, type } = req.body;

       /* if (type === "approved") {
            await storage.deleteRecipe(id);
        } else {
            await storage.deleteSubmission(id);
        }

        res.json({
            message: "Recipe deleted successfully",
        });*/
        if (!["approved", "submission"].includes(type)) {
            return res.status(400).json({
                message:"Invalid type"
            });

        }
        
        res.json({
            message: "Recipe deleted successfully",
        });
    }catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error deleting recipe",
        });
    }
});

router.get("/contacts", requireAdmin, async (_req, res) => {

    try {

        const contacts = await storage.getContacts();

        res.json(contacts);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

});

router.delete("/contacts/:id", requireAdmin, async (req, res) => {

    try {

        await storage.deleteContact(req.params.id);

        res.json({
            message: "Contact deleted successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

});

router.patch(
    "/contacts/:id/read",
    requireAdmin,
    async (req, res) => {

        try {

            await storage.markContactRead(
                req.params.id
            );

            res.json({
                message: "Marked as read."
            });

        }

        catch (err) {

            console.error(err);

            res.status(500).json({
                message: "Internal Server Error"
            });

        }

    }
);

module.exports = router;

/*const express = require('express');
const { requireAdmin, adminValidateRoute } = require('../services/auth');
const { Recipe, Submission } = require('../models');

const router = express.Router();

router.post('/validate-admin', express.json(), adminValidateRoute);

router.get('/approved-recipes', requireAdmin, async (_req, res) => {
  try {
    const recipes = await Recipe.find().lean();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/unapproved-recipes', requireAdmin, async (_req, res) => {
  try {
    const submissions = await Submission.find().lean();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/admin.html', (_req, res) => {
  res.sendFile(require('path').join(__dirname, '../../public/admin.html'));
});

router.post('/approve-recipe', requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    const recipe = await Submission.findOne({ id }).lean();

    if (!recipe) return res.status(404).json({ message: 'Recipe not found!' });

    await Recipe.create(recipe);
    await Submission.deleteOne({ id });

    res.json({ message: 'Recipe approved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/disapprove-recipe', requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    const recipe = await Recipe.findOne({ id }).lean();

    if (!recipe) return res.status(404).json({ message: 'Recipe not found!' });

    await Submission.create(recipe);
    await Recipe.deleteOne({ id });

    res.json({ message: 'Recipe disapproved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/delete-recipe', requireAdmin, async (req, res) => {
  const { id, type } = req.body;

  try {
    const model = type === 'approved' ? Recipe : Submission;
    const result = await model.deleteOne({ id });

    if (!result.deletedCount) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting recipe', error: err.message });
  }
});

module.exports = router;

*/