const express = require('express');
const multer = require('multer');
const streamifier = require('streamifier');
const { v2: cloudinary } = require('cloudinary');
const path = require('path');
const { readJSON } = require('../services/jsonFallback');
const storageService = require('../services/storage');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DATA_FOLDER = path.join(__dirname, '..', 'data');
const FILES = {
  contents: path.join(DATA_FOLDER, 'contents.json'),
  popup: path.join(DATA_FOLDER, 'popup.json'),
  recipes: path.join(DATA_FOLDER, 'recipes.json'),
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/recipes', async (req, res) => {
  const category = req.query.category;
  const filter = {};

  if (category) {
    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  }

  try {
    //const recipes = await Recipe.find(filter).lean();
    const recipes = await storageService.getRecipes(filter);
    return res.json(recipes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
});

router.get('/recipes/:category/:recipe', async (req, res) => {
  const { category, recipe } = req.params;

  try {
    const recipeData = await storageService.getRecipe(category, recipe);
    
    if (!recipeData) {
      return res.status(404).json({
        error: 'Recipe not found',
      });
    }
    return res.json(recipeData);
  } catch (err) {
    console.error('🔥 Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }


});

router.get('/search', async (req, res) => {
  //const recipesData = require(path.join(__dirname, '..', 'data', 'recipes.json'));
  const query = (req.query.query || '').toLowerCase();
  const category = (req.query.category || '').toLowerCase();

  try {
    const results = await storageService.searchRecipes(
      req.query.query || '',
      req.query.category || ''
    );

    res.json(results);
  } catch (err) {
    console.error('Search API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/data/:file', (req, res) => {
  const { file } = req.params;
  if (!FILES[file]) return res.status(400).json({ message: 'Invalid file request' });

  const isLocal = req.get('host') === 'localhost:3000';
  if (!isLocal) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
  }

  try {
    return res.json(readJSON(FILES[file]));
  } catch (_e) {
    return res.status(500).json({ message: 'Error reading file.' });
  }
});

router.post('/submit-recipe', upload.single('image'), async (req, res) => {
    try {

        let {
            category,
            name,
            description,
            instructions,
            ingredients,
            prepTime,
            cookTime,
            servings,
            chefTips,
            calories,
            protein,
            carbs,
            fat,
            imageUrl,
        } = req.body;

        const parsedIngredients = Array.isArray(ingredients)
            ? ingredients
            : (ingredients || "")
                  .split("\n")
                  .map(i => i.trim())
                  .filter(Boolean);

        const instructionsArray = Array.isArray(instructions)
            ? instructions.map(i => i.trim()).filter(Boolean)
            : (instructions || "")
                  .split("\n")
                  .map(i => i.trim())
                  .filter(Boolean);



        if (req.file) {

            const streamUpload = () =>
                new Promise((resolve, reject) => {

                    const stream =
                        cloudinary.uploader.upload_stream(
                            (error, result) => {

                                if (error)
                                    return reject(error);

                                resolve(result);

                            }
                        );

                    streamifier
                        .createReadStream(req.file.buffer)
                        .pipe(stream);

                });

            const result = await streamUpload();

            imageUrl = result.secure_url;

        }

        await storageService.createSubmission({

            name,
            category,

            image: imageUrl,

            description,

            ingredients: parsedIngredients,

            instructions: instructionsArray,


            prep_time: prepTime || "",

            cook_time: cookTime || "",

            servings: servings || "",

            calories: calories || "",

            protein: protein || "",

            carbs: carbs || "",

            fat: fat || "",

            chef_tips: chefTips || "",

            created_at: new Date()

        });


        return res.json({
            success: true,
            message: "Recipe submitted successfully!"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
});

router.put("/update-recipe", async (req, res) => {
    try {

        const {
            id,
            name,
            category,
            description,
            image,
            prepTime,
            cookTime,
            servings,
            ingredients,
            instructions,
            chefTips,
            calories,
            protein,
            carbs,
            fat
        } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Recipe ID is required."
            });
        }



        const updatedRecipe = {
            name,
            category,
            description,
            image,

            ingredients,

            // Stored exactly like your existing recipes
            instructions,

            prep_time: prepTime,
            cook_time: cookTime,
            servings,

            chef_tips: chefTips,
            calories,
            protein,
            carbs,
            fat
        };

        console.log("=== UPDATE REQUEST ===");
        console.log(updatedRecipe);
        console.log("======================");

        const recipe = await storageService.updateSubmission(
            id,
            updatedRecipe
        );

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found."
            });
        }

        res.json({
            success: true,
            message: "Recipe updated successfully.",
            recipe
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
});
/*router.put("/update-recipe", async (req, res) => {
    try {

        const {
            id,
            name,
            category,
            description,
            image,
            prepTime,
            cookTime,
            servings,
            ingredients,
            instructions,
            chefTips,
            calories,
            protein,
            carbs,
            fat
        } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Recipe ID is required."
            });
        }

        const updatedRecipe = {
            name,
            category,
            description,
            image,

            ingredients,

            instructions,
            instructions_array: instructions,

            prep_time: prepTime,
            cook_time: cookTime,
            servings,

            chef_tips: chefTips,
            calories,
            protein,
            carbs,
            fat
        };

        const recipe = await storageService.updateSubmission(
            id,
            updatedRecipe
        );

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found."
            });
        }

        res.json({
            success: true,
            message: "Recipe updated successfully.",
            recipe
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to update recipe."
        });

    }
});*/

module.exports = router;

