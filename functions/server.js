require('dotenv').config();
console.log("Admin Password from .env:", process.env.ADMIN_PASSWORD); // Debugging
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { v2: cloudinary } = require('cloudinary'); // Import Cloudinary SDK
const streamifier = require('streamifier'); // Used for streaming file uploads

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["https://praroz.onrender.com", "http://localhost:3000"], // Add both your live and local frontend URLs
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));

// Cloudinary Configuration (replace with your credentials)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Serve static files correctly from the root `html/` directory
app.use(express.static(path.join(__dirname, '../html')));


// Serve uploads and images properly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// File paths
const DATA_FOLDER = path.join(__dirname, '../html/data');
const FILES = {
    submissions: path.join(DATA_FOLDER, 'submission.json'),
    recipes: path.join(DATA_FOLDER, 'recipes.json'),
    contents: path.join(DATA_FOLDER, 'contents.json'),
    popup: path.join(DATA_FOLDER, 'popup.json'),
};

// Helper functions
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 4), 'utf8');

// Serve admin panel correctly
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

// Fetch all data
app.get('/api/data/:file', (req, res) => {
    const { file } = req.params;
    if (!FILES[file]) return res.status(400).json({ message: "Invalid file request" });

    try {
        res.json(readJSON(FILES[file]));
    } catch (error) {
        res.status(500).json({ message: "Error reading file." });
    }
});

// Multer setup for handling file uploads in memory (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Submit a new recipe with Cloudinary image upload
app.post('/submit-recipe', upload.single('image'), async (req, res) => {
    try {
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        if (!req.body || !req.file) {
            return res.status(400).json({ message: "Missing data or image." });
        }

        const { category, name, description, instructions, ingredients, prepTime, cookTime, servings, chefTips } = req.body;
        const imageUrl = req.body.imageUrl; // Now directly use the image URL from Cloudinary

        const newRecipe = {
            name,
            image: imageUrl, // Use the image URL received from Cloudinary or the uploaded file
            description,
            instructions,
            ingredients: ingredients.split(", ").map(i => i.trim()),
            extraContent: { prepTime, cookTime, servings, chefTips }
        };

        // Log the recipe data
        console.log("New Recipe Data:", newRecipe);

        let submissionData = readJSON(FILES.submissions);
        submissionData[category] = submissionData[category] || [];
        submissionData[category].push(newRecipe);
        writeJSON(FILES.submissions, submissionData);

        res.json({ message: "Recipe submitted successfully!" });
    } catch (error) {
        console.error("Error submitting recipe:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Approve a recipe
app.post('/approve-recipe', (req, res) => {
    try {
        const { id } = req.body;
        console.log("ID received for approval:", id);  // Debug log

        if (!id || !id.includes('-')) return res.status(400).json({ message: "Invalid recipe ID!" });

        const [category, indexStr] = id.split('-');
        const index = parseInt(indexStr, 10);

        if (!category || isNaN(index)) return res.status(400).json({ message: "Invalid recipe ID format!" });

        const submissionData = readJSON(FILES.submissions);
        const recipeData = readJSON(FILES.recipes);

        // Log data for debugging
        console.log("Submission Data:", submissionData);
        console.log("Recipe Data:", recipeData);

        if (!submissionData[category] || !submissionData[category][index]) {
            return res.status(404).json({ message: "Recipe not found!" });
        }

        let approvedRecipe = submissionData[category].splice(index, 1)[0];
        console.log("Approved Recipe:", approvedRecipe);  // Debug log

        if (!recipeData[category]) recipeData[category] = [];
        recipeData[category].push(approvedRecipe);

        // Log the updated data
        console.log("Updated Submission Data:", submissionData);
        console.log("Updated Recipe Data:", recipeData);

        // Write to files
        writeJSON(FILES.submissions, submissionData);
        writeJSON(FILES.recipes, recipeData);

        res.json({ message: "Recipe approved successfully!" });
    } catch (error) {
        console.error("Error approving recipe:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Fetch approved recipes
app.get('/approved-recipes', (req, res) => {
    try {
        const recipeData = readJSON(FILES.recipes);
        let allApproved = [];

        for (const category in recipeData) {
            recipeData[category].forEach(recipe => {
                allApproved.push({ ...recipe, category });
            });
        }

        res.json(allApproved);
    } catch (error) {
        console.error("Error fetching approved recipes:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Fetch unapproved recipes
app.get('/unapproved-recipes', (req, res) => {
    const submissionData = readJSON(FILES.submissions);
    let allUnapproved = [];

    for (const category in submissionData) {
        submissionData[category].forEach(recipe => {
            allUnapproved.push({ ...recipe, category });
        });
    }

    res.json(allUnapproved);
});

// Disapprove a recipe
app.post('/disapprove-recipe', (req, res) => {
    try {
        const { id } = req.body;
        if (!id || !id.includes('-')) return res.status(400).json({ message: "Invalid recipe ID!" });

        const [category, indexStr] = id.split('-');
        const index = parseInt(indexStr, 10);
        if (!category || isNaN(index)) return res.status(400).json({ message: "Invalid recipe ID format!" });

        const recipeData = readJSON(FILES.recipes);
        const submissionData = readJSON(FILES.submissions);

        if (!recipeData[category] || !recipeData[category][index]) {
            return res.status(404).json({ message: "Recipe not found in approved recipes!" });
        }

        // Get the recipe that needs to be disapproved
        let disapprovedRecipe = recipeData[category].splice(index, 1)[0];

        // Add the recipe back to the submissions
        submissionData[category] = submissionData[category] || [];
        submissionData[category].push(disapprovedRecipe);

        // Write updated data to the files
        writeJSON(FILES.recipes, recipeData);
        writeJSON(FILES.submissions, submissionData);

        res.json({ message: "Recipe disapproved successfully!" });
    } catch (error) {
        console.error("Error disapproving recipe:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Delete a recipe
app.post('/delete-recipe', (req, res) => {
    try {
        console.log("Received delete request:", req.body); // Debugging

        const { category, name, type } = req.body;

        if (!category || !name || !type) {
            return res.status(400).json({ message: "Invalid category, recipe name, or type!" });
        }

        // Determine which file to check
        const fileToCheck = type === "approved" ? FILES.recipes : FILES.submissions;
        const recipeData = readJSON(fileToCheck);

        if (!recipeData[category]) {
            return res.status(404).json({ message: "Category not found!" });
        }

        // Find the recipe index by name
        const recipeIndex = recipeData[category].findIndex(recipe => recipe.name.toLowerCase() === name.toLowerCase());
        if (recipeIndex === -1) {
            console.log("Recipe not found. Available recipes:", recipeData[category]);
            return res.status(404).json({ message: "Recipe not found!" });
        }

        // Remove the recipe from the array
        const deletedRecipe = recipeData[category].splice(recipeIndex, 1);

        // Save updated data
        writeJSON(fileToCheck, recipeData);
        console.log("Updated file after deletion:", recipeData);

        res.json({ message: `Recipe '${deletedRecipe[0].name}' deleted successfully!` });
    } catch (error) {
        console.error("Error deleting recipe:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/validate-admin', (req, res) => {
    console.log("Received password:", req.body.password);
    console.log("Expected password:", process.env.ADMIN_PASSWORD);

    if (req.body.password === process.env.ADMIN_PASSWORD) {
        return res.json({ valid: true });
    }
    res.json({ valid: false });
});



const PORT = process.env.PORT || 3000;  // Default Railway port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

