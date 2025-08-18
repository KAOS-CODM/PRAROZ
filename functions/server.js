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
const COMMENTS_FILE = path.join(DATA_FOLDER, 'comments.json');

function readComments() {
  if (!fs.existsSync(COMMENTS_FILE)) return {};
  return JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf8'));
}

function writeComments(data) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2));
}

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

    //res.json(results);
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
 
app.post('/api/comments', express.json(), async (req, res) => {
  const { slug, name, comment } = req.body;

  if (!slug) {
    return res.status(400).json({ error: 'Recipe ID is required' });
  }

  if (!name || !comment) {
    return res.status(400).json({ error: 'Name and comment are required' });
  }

  const newComment = {
    recipe_slug: slug, 
    name,
    comment,
    approved: false,
    created_at: new Date()
  };

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([newComment])
      .select(); 

    if (error) {
      console.error("Supabase insert error:", error);
    }

    if (!error) {
      return res.json({ message: 'Comment submitted (DB) and awaiting approval.', comment: data[0] });
    }

    // Fallback to JSON if DB failed
    const comments = readComments();
    if (!comments[slug]) comments[slug] = [];
    const fallbackComment = { id: Date.now().toString(), ...newComment };
    comments[slug].push(fallbackComment);
    writeComments(comments);

    res.json({ message: 'Comment submitted (JSON) and awaiting approval.' });

  } catch (err) {
    console.error("Unexpected error posting comment:", err);
    res.status(500).json({ error: 'Error submitting comment' });
  }
});

app.get('/api/comments/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('recipe_slug', slug)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (!error && data.length > 0) return res.json(data);

    const comments = readComments();
    const recipeComments = (comments[slug] || []).filter(c => c.approved);
    res.json(recipeComments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

app.get('/api/comments-approved', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    let grouped = {};
    if (!error && data) {
      data.forEach(c => {
        if (!grouped[c.recipe_slug]) grouped[c.recipe_slug] = [];
        grouped[c.recipe_slug].push(c);
      });
      return res.json(grouped);
    }

    // JSON fallback
    const comments = readComments();
    let approvedGrouped = {};
    for (const slug in comments) {
      approvedGrouped[slug] = comments[slug].filter(c => c.approved);
    }
    res.json(approvedGrouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching approved comments' });
  }
});

app.get('/api/comments-pending', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('approved', false);

    let grouped = {};
    if (!error && data) {
      data.forEach(c => {
        if (!grouped[c.recipe_slug]) grouped[c.recipe_slug] = [];
        grouped[c.recipe_slug].push(c);
      });
      return res.json(grouped);
    }

    const comments = readComments();
    let pendingGrouped = {};
    for (const slug in comments) {
      pendingGrouped[slug] = comments[slug].filter(c => !c.approved);
    }
    res.json(pendingGrouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching unapproved comments' });
  }
});

// Approve a comment
app.post("/api/approve-comment", express.json(), async (req, res) => {
  const { id, recipeSlug } = req.body;
  if (!id || !recipeSlug) return res.status(400).json({ error: "Comment id and recipeSlug required" });

  try {
    // Try Supabase first
    const { error } = await supabase
      .from("comments")
      .update({ approved: true })
      .eq("id", id)
      .eq("recipe_slug", recipeSlug);

    if (!error) return res.json({ message: "Comment approved (DB)" });

    // Fallback to JSON
    const comments = readComments();
    if (comments[recipeSlug]) {
      const comment = comments[recipeSlug].find(c => c.id == id);
      if (comment) comment.approved = true;
      writeComments(comments);
    }
    res.json({ message: "Comment approved (JSON)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error approving comment" });
  }
});

// Delete a comment
app.post("/api/delete-comment", express.json(), async (req, res) => {
  const { id, recipeSlug } = req.body;
  if (!id || !recipeSlug) return res.status(400).json({ error: "Comment id and recipeSlug required" });

  try {
    // Supabase first
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id)
      .eq("recipe_slug", recipeSlug);

    if (!error) return res.json({ message: "Comment deleted (DB)" });

    // Fallback JSON
    const comments = readComments();
    if (comments[recipeSlug]) {
      comments[recipeSlug] = comments[recipeSlug].filter(c => c.id != id);
      writeComments(comments);
    }
    res.json({ message: "Comment deleted (JSON)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting comment" });
  }
});

// Disapprove a comment
app.post("/api/disapprove-comment", express.json(), async (req, res) => {
  const { id, recipeSlug } = req.body;
  if (!id || !recipeSlug) return res.status(400).json({ error: "Comment id and recipeSlug required" });

  try {
    // Supabase first
    const { error } = await supabase
      .from("comments")
      .update({ approved: false })
      .eq("id", id)
      .eq("recipe_slug", recipeSlug);

    if (!error) return res.json({ message: "Comment disapproved (DB)" });

    // Fallback JSON
    const comments = readComments();
    if (comments[recipeSlug]) {
      const comment = comments[recipeSlug].find(c => c.id == id);
      if (comment) comment.approved = false;
      writeComments(comments);
    }
    res.json({ message: "Comment disapproved (JSON)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error disapproving comment" });
  }
});

// Batch endpoint: approve, disapprove, delete multiple comments
app.post("/api/batch-comments", express.json(), async (req, res) => {
  const { comments } = req.body; 
  // comments = [{ id, recipeSlug, action: "approve"|"disapprove"|"delete" }, ...]

  if (!comments?.length) {
    return res.status(400).json({ error: "No comments provided" });
  }

  try {
    // --- DB first
    const approveIds = comments.filter(c => c.action === "approve").map(c => c.id);
    const disapproveIds = comments.filter(c => c.action === "disapprove").map(c => c.id);
    const deleteIds = comments.filter(c => c.action === "delete").map(c => c.id);

    // Approve
    if (approveIds.length) {
      await supabase
        .from("comments")
        .update({ approved: true })
        .in("id", approveIds);
    }

    // Disapprove
    if (disapproveIds.length) {
      await supabase
        .from("comments")
        .update({ approved: false })
        .in("id", disapproveIds);
    }

    // Delete
    if (deleteIds.length) {
      await supabase
        .from("comments")
        .delete()
        .in("id", deleteIds);
    }

    // --- JSON fallback
    const data = readComments();
    comments.forEach(({ id, recipeSlug, action }) => {
      if (!data[recipeSlug]) return;

      if (action === "approve") {
        data[recipeSlug] = data[recipeSlug].map(c =>
          c.id == id ? { ...c, approved: true } : c
        );
      } else if (action === "disapprove") {
        data[recipeSlug] = data[recipeSlug].map(c =>
          c.id == id ? { ...c, approved: false } : c
        );
      } else if (action === "delete") {
        data[recipeSlug] = data[recipeSlug].filter(c => c.id != id);
      }
    });
    writeComments(data);

    res.json({
      message: `✅ Approved ${approveIds.length}, ❌ Deleted ${deleteIds.length}, ↩ Disapproved ${disapproveIds.length}`
    });
  } catch (err) {
    console.error("Batch comment error:", err);
    res.status(500).json({ error: "Batch processing failed" });
  }
});

app.get('/:category/:recipeSlug', async (req, res) => {
  const { category, recipeSlug } = req.params;

  try {
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

    const templatePath = path.join(__dirname, '../public/recipe.html');
    let html = fs.readFileSync(templatePath, 'utf8');

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
    html = html.replace('</body>', `
    <script>
        window.RECIPE_ID = "${recipe.id}";
    </script>
    </body>`);
    res.send(html);

  } catch (err) {
    console.error('Recipe page error:', err);
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
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

app.use(express.static('../public', {
    maxAge: '1y',
    etag: false
}));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port https://localhost:${PORT}`);
});
