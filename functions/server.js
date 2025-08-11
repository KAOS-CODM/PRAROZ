require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require ('fs');
const streamifier = require('streamifier');
const { v2: cloudinary } = require('cloudinary');
const supabase = require('./supabase');
const app = express();
const DATA_FOLDER = path.join(__dirname, 'data');
const FILES = {
    contents: path.join(DATA_FOLDER, 'contents.json'),
    popup: path.join(DATA_FOLDER, 'popup.json'),
    recipes: path.join(DATA_FOLDER, 'recipes.json')
};
const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 4), 'utf8');
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use((req, res, next) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname  = parsedUrl.pathname;

    if(!path.extname(pathname)){
        const htmlPath = path.join(__dirname, '../public', `${pathname}.html`);
        if(fs.existsSync(htmlPath)){
            return res.sendFile(htmlPath);
        }
    }
    next();
})
app.use(express.json());
app.use(cors({
    origin: ["https://praroz-50094.web.app", "http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.get('/api/data/:file', (req, res) => {
    if (req.get('host') === 'localhost:3000') {
        const { file } = req.params;
        if (!FILES[file]) return res.status(400).json({ message: "Invalid file request" });

        try {
            res.json(readJSON(FILES[file]));
        } catch (error) {
            res.status(500).json({ message: "Error reading file." });
        }
    } else {
        // Require API key for non-local requests
        const apiKey = req.headers['x-api-key'];
        if (apiKey !== process.env.API_KEY) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const { file } = req.params;
        if (!FILES[file]) return res.status(400).json({ message: "Invalid file request" });

        try {
            res.json(readJSON(FILES[file]));
        } catch (error) {
            res.status(500).json({ message: "Error reading file." });
        }
    }
});

app.get('/api/approved-recipes', async (req, res) => {
    try {
        const { data, error } = await supabase.from('recipes').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/api/unapproved-recipes', async (req, res) => {
    try {
        const { data, error } = await supabase.from('submissions').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/api/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

app.get('/api/data/recipes', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        const isLocal = req.get('host') === 'localhost:3000';
        if (!isLocal && apiKey !== process.env.API_KEY) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }
        const { data: recipes, error } = await supabase.from('recipes').select('*');
        if (error) throw error;
        const grouped = recipes.reduce((acc, recipe) => {
            const category = recipe.category || 'Uncategorized';
            if (!acc[category]) acc[category] = [];
            acc[category].push(recipe);
            return acc;
        }, {});

        res.json(grouped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/submit-recipe', upload.single('image'), async (req, res) => {
    try {
        let {
            category, name, description, instructions,
            ingredients, prepTime, cookTime, servings,
            chefTips, imageUrl
        } = req.body;

        const parsedIngredients = Array.isArray(ingredients)
            ? ingredients
            : ingredients?.split('\n').map(i => i.trim()).filter(Boolean) || [];

        const instructionsArray = Array.isArray(instructions)
            ? instructions.map(step => step.trim()).filter(Boolean)
            : instructions?.split('\n').map(step => step.trim()).filter(Boolean) || [];

        const formatList = (lines, fallbackType = 'ul') => {
            const isNumbered = lines.every(line => /^\d+[\.\)]\s/.test(line));
            const type = isNumbered ? 'ol' : fallbackType;
            const cleanedItems = lines.map(line => line.replace(/^(\d+[\.\)]|\-|\*|•)\s*/, '').trim());
            return `<${type}>${cleanedItems.map(item => `<li>${item}</li>`).join('')}</${type}>`;
        };

        const formattedInstructions = formatList(instructionsArray, 'ol');

        if (req.file) {
            const streamUpload = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    });
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            const result = await streamUpload();
            imageUrl = result.secure_url;
        }

        const { error } = await supabase.from('submissions').insert([{
            name,
            category,
            image: imageUrl,
            description,
            instructions: formattedInstructions,
            instructions_array: instructionsArray,
            ingredients: parsedIngredients,
            prep_time: prepTime,
            cook_time: cookTime,
            servings,
            chef_tips: chefTips
        }]);

        if (error) throw error;
        res.json({ message: "Recipe submitted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/api/approve-recipe', async (req, res) => {
    try {
        const { id } = req.body;
        const { data: recipe, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !recipe) return res.status(404).json({ message: "Recipe not found!" });

        const { error: insertError } = await supabase.from('recipes').insert([recipe]);
        if (insertError) throw insertError;

        await supabase.from('submissions').delete().eq('id', id);

        res.json({ message: "Recipe approved successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/api/disapprove-recipe', async (req, res) => {
    try {
        const { id } = req.body;
        const { data: recipe, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !recipe) return res.status(404).json({ message: "Recipe not found!" });

        await supabase.from('submissions').insert([recipe]);
        await supabase.from('recipes').delete().eq('id', id);

        res.json({ message: "Recipe disapproved successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/api/delete-recipe', async (req, res) => {
    const { id, type } = req.body;

    try {
        let table = type === 'approved' ? 'recipes' : 'submissions';
        const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select(); 

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting recipe', error: err.message });
    }
});

app.post('/api/validate-admin', (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) {
        return res.json({ valid: true });
    }
    res.json({ valid: false });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
