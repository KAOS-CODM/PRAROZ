const express = require('express');
const path = require('path');
const fs = require('fs');
const metaTags = require('../metatags');
const recipeTags = require('../recipetags');
const storage = require('../services/storage');
const { sanitizeMeta, escapeHtml } = require('../services/htmlSafe');

const router = express.Router();

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

/* =========================
   ROBOTS
========================= */
router.get('/robots.txt', (req, res) => {
  const baseUrl = `${req.protocol}s://${req.get('host')}`;
  const disallowedPaths = ['/private/', '/admin/'];
  const disallowedRules = disallowedPaths.map(p => `\nDisallow: ${p}`).join('');

  const robotsContent = `
User-agent: *${disallowedRules}
Sitemap: ${baseUrl}/sitemap.xml`;

  res.type('text/plain').send(robotsContent);
});

/* =========================
   SITEMAP
========================= */
router.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  const baseUrl = `${req.protocol}s://${req.get('host')}`;

  const pages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/home', changefreq: 'daily', priority: 0.8 },
    { url: '/desserts', changefreq: 'weekly', priority: 1.0 },
    { url: '/appetizers', changefreq: 'weekly', priority: 0.8 },
    { url: '/salad', changefreq: 'weekly', priority: 0.8 },
    { url: '/burger', changefreq: 'weekly', priority: 0.8 },
    { url: '/pizza', changefreq: 'weekly', priority: 0.8 },
    { url: '/pasta', changefreq: 'weekly', priority: 0.8 },
    { url: '/recipes', changefreq: 'weekly', priority: 0.8 },
    { url: '/submit', changefreq: 'weekly', priority: 0.8 },
    { url: '/about', changefreq: 'weekly', priority: 0.8 },
    { url: '/terms', changefreq: 'weekly', priority: 0.8 },
    { url: '/privacy', changefreq: 'weekly', priority: 0.8 },
    { url: '/contact', changefreq: 'weekly', priority: 0.8 },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const page of pages) {
    xml += `<url>
<loc>${baseUrl}${page.url}</loc>
<changefreq>${page.changefreq}</changefreq>
<priority>${page.priority}</priority>
</url>\n`;
  }

  xml += `</urlset>`;
  res.send(xml);
});

/* =====================================================
   IMPORTANT: MOVE STATIC PAGE ROUTE LAST
===================================================== */

/* =========================
   RECIPE SLUG ROUTE (FIXED)
========================= */
router.get('/recipes/:category/:recipeSlug', async (req, res) => {
  const { category, recipeSlug } = req.params;

  try {
    const recipe = await storage.getRecipe(category, recipeSlug);
    console.log("CATEGORY:", category);
    console.log("SLUG:", recipeSlug);
    console.log("FOUND:", recipe);

    if (!recipe) {
      return res.status(404).sendFile(
        path.join(__dirname, '../../public/404.html')
      );
    }

    const templatePath = path.join(__dirname, '../../public/recipe.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    const slugKey = `${category}/${recipeSlug}`;
    const jsonLd = recipeTags[slugKey]?.jsonld || {};

    const metaTitle = sanitizeMeta(recipe.name);
    const metaDesc = sanitizeMeta(recipe.description || 'A delicious recipe!');
    const metaImage = sanitizeMeta(recipe.image || '/images/placeholder.jpg');

    html = html.replace(
      '</head>',
      `
<title>${metaTitle} | Praroz™</title>
<meta name="description" content="${metaDesc}">
<meta property="og:title" content="${metaTitle}">
<meta property="og:description" content="${metaDesc}">
<meta property="og:image" content="${metaImage}">
<meta name="twitter:title" content="${metaTitle}">
<meta name="twitter:description" content="${metaDesc}">
<meta name="twitter:image" content="${metaImage}">
<script type="application/ld+json">${escapeHtml(JSON.stringify(jsonLd))}</script>
${gaScript}
</head>`
    );

    html = html.replace(
      '</body>',
      `<script>
window.RECIPE_ID = "${escapeHtml(recipe.id || '')}";
</script></body>`
    );

    res.send(html);
  } catch (err) {
    console.error('Recipe page error:', err);
    return res.status(404).sendFile(
      path.join(__dirname, '../../public/404.html')
    );
  }
});

/* =========================
   STATIC PAGE ROUTE (MUST BE LAST)
========================= */
router.get('/:page?', (req, res, next) => {
  const page = req.params.page || 'index';

  // IMPORTANT: prevent catching /recipe/*
  if (req.path.startsWith('/recipe/')) return next();

  const filePath = path.join(__dirname, '../../public', `${page}.html`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return next();

    const meta = metaTags[page] || metaTags.home;

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
${gaScript}
`;

    res.send(data.replace('</head>', `${metaHtml}</head>`));
  });
});
module.exports = router;