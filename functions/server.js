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
const metaTags = require('./metatags');
const recipeTags = require('./recipetags');
const { version } = require('os');
const gaScript = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-RWDGMK7KP6"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-RWDGMK7KP6');
    </script>
`;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: ["https://praroz-50094.web.app", "http://localhost:3000",],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.get('/:page?',(req, res, next) => {
    const page = req.params.page || 'index'
    const filePath = path.join(__dirname, '../public', `${page}.html`)

    console.log("serving page:", {page});
    fs.readFile(filePath, 'utf8', (err, data) =>  {
        if (req.path === '/recipe') return next();
        if (err) return next();
        const meta = metaTags[page] || metaTags.home;
        console.log("Meta Tags:", {meta});

        const metaHtml = `
            <title>${meta.title} | Praroz™</title>
            <meta name="description" content="${meta.description}">
            <meta property="og:title" content="${meta.title}">
            <meta property="og:description" content="${meta.description}">
            <meta property="og:image" content="${meta.image}">
            <meta property="og:type" content="website">

            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${meta.title}">
            <meta name="twitter:description" content="${meta.description}">
            <meta name="twitter:image" content="${meta.image}">
        `;
        const modifiedData = data.replace('</head>', `${metaHtml} ${gaScript}</head>`);
        res.send(modifiedData);
    });
});

app.get('/favicon.ico', (req, res) => {
  const icoPath = path.join(__dirname, '../public/images/favicon.ico');
  const pngPath = path.join(__dirname, '../public/images/favicon.png');
  if (fs.existsSync(icoPath)) {
    res.sendFile(icoPath);
  } else if (fs.existsSync(pngPath)) {
    res.sendFile(pngPath);
  } else {
    res.status(404).end();
  }
});


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


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


app.get('/api/recipes/:category/:recipe', async (req, res) => {
  const { category, recipe } = req.params;
  console.log('➡️ Router hit:', category, recipe);

  try {
    // Try DB first
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('category', category)
      .ilike('name', recipe.replace(/-/g, ' '))
      .limit(1);

    if (error) console.log('❌ Supabase error:', error);

    if (data && data.length > 0) {
      console.log('✅ Found in DB:', data[0].name);
      return res.json(data[0]);
    }

    // Fallback to JSON
    const recipesJson = require(path.join(__dirname, 'data', 'recipes.json'))
    const recipesInCategory = recipesJson[category];
    if (!recipesInCategory) {
      console.log('⚠️ Category not found in JSON');
      return res.status(404).json({ error: 'Category not found' });
    }

    const matched = recipesInCategory.find(r =>
      r.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') === recipe.toLowerCase()
    );

    if (!matched) {
      console.log('⚠️ Recipe not found in JSON');
      return res.status(404).json({ error: 'Recipe not found' });
    }

    console.log('✅ Found in JSON:', matched.name);
    res.json(matched);
} catch (err) {
    console.error('🔥 Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/search', async (req, res) => {
const recipesData = require(path.join(__dirname, 'data', 'recipes.json'))
  const query = (req.query.query || '').toLowerCase();
  const category = (req.query.category || '').toLowerCase();

  try {
    let results = [];

    // Try DB first
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('category', category);

    if (!error && data) {
      results = data; 
    }

    // Fallback to JSON if no DB results or DB error
    if (results.length === 0) {
      for (const cat in recipesData) {
        if (category && cat.toLowerCase() !== category) continue; // skip if category doesn't match

        const matches = recipesData[cat].filter(r =>
          r.name.toLowerCase().includes(query)
        ).map(r => ({ ...r, category: cat }));

        results.push(...matches);
      }
      console.log('Query:', query);
      console.log('Category (from params):', category);
    }

    res.json(results);
  } catch (err) {
    console.error('Search API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
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

app.get('/:category/:recipeSlug', async (req, res) => {
  const { category, recipeSlug } = req.params;

  try {
    // Fetch recipe from DB or fallback to JSON
    let recipe;
    let { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('category', category)
      .ilike('name', recipeSlug.replace(/-/g, ' '));

    if (!error && data && data.length > 0) {
      recipe = data[0];
    } else {
      const recipesJson = require(path.join(__dirname, 'data', 'recipes.json'));
      const recipesInCategory = recipesJson[category];
      if (!recipesInCategory) throw new Error('Recipe not found');

      recipe = recipesInCategory.find(r =>
        r.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') === recipeSlug.toLowerCase()
      );

      if (!recipe) throw new Error('Recipe not found');
    }

    // Read template
    const templatePath = path.join(__dirname, '../public/recipe.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Inject meta tags and JSON-LD using slug key
    const slugKey = `${category}/${recipeSlug}`;
    const jsonLd = recipeTags[slugKey]?.jsonld || {};
    const metaTitle = recipe.name;
    const metaDesc = recipe.description || 'A delicious recipe!';
    const metaImage = recipe.image || '/images/placeholder.jpg';

    html = html.replace('</head>', `
      <title>${metaTitle} | Praroz™</title>
      <meta name="description" content="${metaDesc}">
      <meta property="og:title" content="${metaTitle}">
      <meta property="og:description" content="${metaDesc}">
      <meta property="og:image" content="${metaImage}">
      <meta name="twitter:title" content="${metaTitle}">
      <meta name="twitter:description" content="${metaDesc}">
      <meta name="twitter:image" content="${metaImage}">
      <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    </head>`);

    res.send(html);

  } catch (err) {
    console.error('Recipe page error:', err);
    res.status(404).send('<h1>Recipe not found</h1>');
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

app.get('/:category/:recipe', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'recipe.html'));
});

app.get('/robots.txt', (req, res) => {
    const baseUrl = `${req.protocol}s://${req.get('host')}`;
    const disallowedPaths = [
        '/private/',
        '/admin/'
    ];

    const disallowedRules = disallowedPaths.map(path => `\nDisallow: ${path}`).join('');

    const robotsContent = `
        User-agent: *\n${disallowedRules}
        \nSitemap: ${baseUrl}/sitemap.xml`;

        res.type('text/plain').send(robotsContent);
});

app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    const baseUrl =`${req.protocol}s://${req.get('host')}`;
    const pages = [
        {url: '/', changefreq: 'daily', priority: 1.0},
        {url: '/home', changefreq: 'daily', priority: 0.8},
        {url: '/desserts', changefreq: 'weekly', priority: 1.0},
        {url: '/appetizers', changefreq: 'weekly', priority: 0.8},
        {url: '/salad', changefreq: 'weekly', priority: 0.8},
        {url: '/burger', changefreq: 'weekly', priority: 0.8},
        {url: '/pizza', changefreq: 'weekly', priority: 0.8},
        {url: '/pasta', changefreq: 'weekly', priority: 0.8},
        {url: '/recipes', changefreq: 'weekly', priority: 0.8},
        {url: '/recipe', changefreq: 'weekly', priority: 0.8},
        {url: '/index', changefreq: 'weekly', priority: 0.8},
        {url: '/submission', changefreq: 'weekly', priority: 0.8},
        {url: '/about', changefreq: 'weekly', priority: 0.8},
        {url: '/terms', changefreq: 'weekly', priority: 0.8},
        {url: '/contact', changefreq: 'weekly', priority: 0.8},
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    pages.forEach(page => {
        xml += `<url>\n`;
        xml += `<loc>${baseUrl}${page.url}</loc>`;
        xml += `<changefreq>${page.changefreq}</changefreq>\n`;
        xml += `<priority>${page.priority}</priority>\n`;
        xml += `</url>\n`
    });

    xml += `</urlset>`;
    res.send(xml);
});

app.use(express.static('../public', {
    maxAge: '1y',
    etag: false
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
