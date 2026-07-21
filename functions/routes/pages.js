const express = require('express');
const path = require('path');
const fs = require('fs');

const metaTags = require('../metatags');
const storage = require('../services/storage');
const { sanitizeMeta, escapeHtml } = require('../services/htmlSafe');

const router = express.Router();

const GA_SCRIPT = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-RWDGMK7KP6"></script>
    <script src="/js/gtag.js"></script>
`;

const ADSENSE_META = {
  name: 'google-adsense-account',
  content: 'ca-pub-2855061272568390',
};

/* =========================
   HELPERS
========================= */

function getBaseUrl(req) {
  return `${req.protocol}s://${req.get('host')}`;
}

function getCanonicalUrl(req) {
  // Must include the current request URL
  const base = getBaseUrl(req);
  return `${base}${req.originalUrl}`;
}

function normalizeStr(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  const s = String(value);
  return s.trim() ? s.trim() : fallback;
}

function safeImage(value) {
  const v = normalizeStr(value);
  return v || '/images/thumbnail/praroz-thumbnail.webp';
}

function buildRobotsMetaHtml() {
  // Allow all pages; disallow only admin + api.
  // Also include sitemap.
  return `
    <meta name="robots" content="index,follow" />
  `;
}

function buildTitleHtml(title) {
  return `<title>${sanitizeMeta(title)} | Praroz™</title>`;
}

function buildDescriptionHtml(description) {
  return `<meta name="description" content="${sanitizeMeta(description)}" />`;
}

function buildKeywordsHtml(keywords) {
  if (!keywords) return '';
  return `<meta name="keywords" content="${sanitizeMeta(keywords)}" />`;
}

function buildAuthorHtml(author) {
  if (!author) return '';
  return `<meta name="author" content="${sanitizeMeta(author)}" />`;
}

function buildCanonicalLinkHtml(url) {
  return `<link rel="canonical" href="${sanitizeMeta(url)}" />`;
}

function buildOpenGraphHtml({ title, description, image, url, siteName, type }) {
  // Include the required OG tags.
  return `
    <meta property="og:url" content="${sanitizeMeta(url)}" />
    <meta property="og:site_name" content="${sanitizeMeta(siteName)}" />
    <meta property="og:type" content="${sanitizeMeta(type)}" />

    <meta property="og:title" content="${sanitizeMeta(title)}" />
    <meta property="og:description" content="${sanitizeMeta(description)}" />
    <meta property="og:image" content="${sanitizeMeta(image)}" />
  `;
}

function buildTwitterCardHtml({ title, description, image, card }) {
  return `
    <meta name="twitter:card" content="${sanitizeMeta(card)}" />
    <meta name="twitter:title" content="${sanitizeMeta(title)}" />
    <meta name="twitter:description" content="${sanitizeMeta(description)}" />
    <meta name="twitter:image" content="${sanitizeMeta(image)}" />
  `;
}

function buildMetaTags(pageMeta, req) {
  const canonicalUrl = getCanonicalUrl(req);

  const title = normalizeStr(pageMeta?.title, metaTags?.home?.title || 'Praroz');
  const description = normalizeStr(
    pageMeta?.description,
    metaTags?.home?.description || 'Delicious recipes and cooking ideas from Praroz.'
  );
  const image = safeImage(pageMeta?.image);

  const robotsMeta = pageMeta?.robots ? pageMeta.robots : 'index,follow';
  const keywords = pageMeta?.keywords;
  const author = pageMeta?.author;

  const og = {
    title,
    description,
    image,
    url: canonicalUrl,
    siteName: 'Praroz',
    type: pageMeta?.ogType || 'website',
  };

  const twitter = {
    title,
    description,
    image,
    card: pageMeta?.twitterCard || 'summary_large_image',
  };

  // robots meta tag (required) + canonical + OG/Twitter + GA injection
  // NOTE: keep favicon untouched by only injecting before </head>.
  const metaHtml = `
    ${buildTitleHtml(title)}
    <meta name="google-adsense-account" content="${sanitizeMeta(ADSENSE_META.content)}" />
    ${buildDescriptionHtml(description)}
    ${buildKeywordsHtml(keywords)}
    ${buildAuthorHtml(author)}

    ${buildCanonicalLinkHtml(canonicalUrl)}
    <meta name="robots" content="${sanitizeMeta(robotsMeta)}" />

    ${buildOpenGraphHtml(og)}
    ${buildTwitterCardHtml(twitter)}

    ${GA_SCRIPT}
  `;

  return metaHtml;
}

function injectSeoIntoHead(html, seoHtml) {
  // Inject exactly once by targeting </head>.
  if (!html || typeof html !== 'string') return html;

  const headClose = '</head>';
  const idx = html.lastIndexOf(headClose);
  if (idx === -1) return html;

  return html.slice(0, idx) + `${seoHtml}${headClose}` + html.slice(idx + headClose.length);
}

function toIsoDate(value) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function normalizeInstructionsToArray(instructions) {
  if (Array.isArray(instructions)) {
    return instructions
      .map((s) => (s === null || s === undefined ? '' : String(s).trim()))
      .filter(Boolean);
  }

  if (typeof instructions === 'string') {
    const trimmed = instructions.trim();
    if (!trimmed) return [];

    // If it's stored as HTML list, take text inside <li>.
    const hasListMarkup = /<\s*(ol|ul)\b/i.test(trimmed) || /<\s*li\b/i.test(trimmed);
    if (hasListMarkup) {
      const liMatches = trimmed.match(/<\s*li\b[^>]*>([\s\S]*?)<\s*\/\s*li\s*>/gi) || [];
      if (liMatches.length) {
        return liMatches
          .map((liHtml) => {
            const inner = liHtml
              .replace(/<\s*li\b[^>]*>/i, '')
              .replace(/<\s*\/\s*li\s*>/i, '');
            const withoutTags = inner.replace(/<[^>]*>/g, '');
            return withoutTags.replace(/\s+/g, ' ').trim();
          })
          .filter(Boolean);
      }
    }

    // fallback: newline-separated or numbered text
    return trimmed
      .split(/\r?\n+/g)
      .map((s) => s.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeIngredients(recipe) {
  // storage.js formats recipe.ingredients as part of schema? We'll be defensive.
  const ing = recipe?.recipeIngredient || recipe?.ingredients || recipe?.recipe_ingredients;
  if (Array.isArray(ing)) return ing.map((s) => String(s).trim()).filter(Boolean);
  if (typeof ing === 'string') {
    return ing
      .split(/\r?\n+/g)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (recipe?.extraContent?.nutrition && recipe?.ingredientsHtml) {
    // no-op; keep defensive.
  }
  return [];
}

function extractRecipeInstructions(recipe) {
  // storage.js guarantees recipe.instructions is Array<string> via formatRecipe()
  const instructions = recipe?.instructions || [];
  return normalizeInstructionsToArray(instructions);
}

function buildRecipeJsonLd(recipe, req) {
  const canonicalUrl = getCanonicalUrl(req);
  const name = normalizeStr(recipe?.name, '');
  const description = normalizeStr(recipe?.description, '');
  const image = safeImage(recipe?.image);

  const category = normalizeStr(recipe?.category, '');
  const recipeCategory = category || undefined;

  const recipeIngredient = normalizeIngredients(recipe);
  const recipeInstructions = extractRecipeInstructions(recipe);

  // Map recipe.prep_time/cook_time/servings/nutrition when present.
  const prepTime = normalizeStr(recipe?.prep_time || recipe?.extraContent?.prepTime || '');
  const cookTime = normalizeStr(recipe?.cook_time || recipe?.extraContent?.cookTime || '');
  const recipeYield = normalizeStr(recipe?.servings || recipe?.extraContent?.servings || '');

  const nutrition = recipe?.nutrition || recipe?.extraContent?.nutrition || undefined;
  const calories = normalizeStr(nutrition?.calories || '', '');
  const protein = normalizeStr(nutrition?.protein || '', '');
  const carbs = normalizeStr(nutrition?.carbs || '', '');
  const fat = normalizeStr(nutrition?.fat || '', '');

  const nutritionObj = {
    calories: calories || undefined,
    proteinContent: protein || undefined,
    carbohydrateContent: carbs || undefined,
    fatContent: fat || undefined,
  };

  // Build JSON-LD fields, omitting empties to reduce spam.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: name || undefined,
    description: description || undefined,
    image: image || undefined,
    recipeCategory: recipeCategory || undefined,
    recipeIngredient: recipeIngredient.length ? recipeIngredient : undefined,
    recipeInstructions: recipeInstructions.length
      ? recipeInstructions.map((step) => `<li>${escapeHtml(step)}</li>`).join('')
      : undefined,

    prepTime: prepTime || undefined,
    cookTime: cookTime || undefined,
    recipeYield: recipeYield || undefined,

    nutrition: (calories || protein || carbs || fat) ? nutritionObj : undefined,

    author: recipe?.author?.name
      ? {
          '@type': 'Person',
          name: normalizeStr(recipe.author.name, 'Praroz'),
        }
      : {
          '@type': 'Person',
          name: 'Praroz',
        },

    publisher: {
      '@type': 'Organization',
      name: 'Praroz',
    },

    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },

    datePublished: toIsoDate(recipe?.datePublished) || toIsoDate(recipe?.created_at) || undefined,
    dateModified: toIsoDate(recipe?.dateModified) || toIsoDate(recipe?.updated_at) || undefined,
  };

  // JSON-LD recipeInstructions expects either string or structured. We used HTML <li> list.
  // Ensure we output valid JSON by removing undefined keys.
  function stripUndefined(obj) {
    if (Array.isArray(obj)) return obj.map(stripUndefined).filter((v) => v !== undefined);
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .map(([k, v]) => [k, stripUndefined(v)])
          .filter(([, v]) => v !== undefined)
      );
    }
    return obj;
  }

  return stripUndefined(jsonLd);
}

function buildPageJsonLd(pageType, req, pageMeta) {
  const canonicalUrl = getCanonicalUrl(req);
  const title = normalizeStr(pageMeta?.title, metaTags?.home?.title || 'Praroz');
  const description = normalizeStr(pageMeta?.description, metaTags?.home?.description || '');
  const image = safeImage(pageMeta?.image);

  let schemaType;
  if (pageType === 'home') schemaType = 'WebSite';
  else if (pageType === 'about') schemaType = 'AboutPage';
  else if (pageType === 'contact') schemaType = 'ContactPage';
  else if (['privacy', 'terms'].includes(pageType)) schemaType = 'WebPage';
  else schemaType = 'WebPage';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: title,
    description: description || undefined,
    image: image || undefined,
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  return jsonLd;
}

function buildBreadcrumbJsonLd(req, recipe) {
  // Home → Category → Recipe Name
  const canonicalUrl = getCanonicalUrl(req);

  const category = normalizeStr(recipe?.category, '');
  const name = normalizeStr(recipe?.name, '');

  const categoryUrl = category ? `${getBaseUrl(req)}/recipes/${encodeURIComponent(category)}/${encodeURIComponent(toSlugForUrl(category))}` : undefined;

  // The UI route uses /recipes/:category/:recipeSlug.
  // We can reconstruct recipeSlug from name.
  const recipeSlug = recipe?.id ? undefined : undefined; // do not rely
  const recipeSlugFromName = toSlugForUrl(name);

  const recipeUrl = `${getBaseUrl(req)}/recipes/${encodeURIComponent(category)}${category ? '/' : ''}${encodeURIComponent(recipeSlugFromName || '')}`;

  const items = [];
  items.push({
    '@type': 'ListItem',
    position: 1,
    name: 'Home',
    item: `${getBaseUrl(req)}/`,
  });

  if (category) {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: capitalizeFirst(category),
      item: `${getBaseUrl(req)}/recipes`,
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: name || category,
    item: canonicalUrl || recipeUrl,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function toSlugForUrl(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

function capitalizeFirst(s = '') {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildRecipeSeoHtml({ recipe, req }) {
  const canonicalUrl = getCanonicalUrl(req);
  const title = normalizeStr(recipe?.name, metaTags?.home?.title || 'Praroz');
  const description = normalizeStr(recipe?.description, metaTags?.home?.description || '');
  const image = safeImage(recipe?.image);

  // Required extras in this task:
  // - canonical
  // - robots
  // - keywords (if present) from recipe doc
  // - author
  // - OpenGraph + Twitter (complete + og:url etc)
  // - JSON-LD
  const keywords = recipe?.keywords || recipe?.extraContent?.keywords;
  const authorName = recipe?.author?.name || recipe?.chef || 'Praroz';

  const seoHtml = `
    ${buildTitleHtml(title)}
    <meta name="google-adsense-account" content="${sanitizeMeta(ADSENSE_META.content)}" />
    ${buildDescriptionHtml(description)}
    ${buildKeywordsHtml(keywords)}
    ${buildAuthorHtml(authorName)}

    ${buildCanonicalLinkHtml(canonicalUrl)}
    ${buildRobotsMetaHtml()}

    ${buildOpenGraphHtml({
      title,
      description,
      image,
      url: canonicalUrl,
      siteName: 'Praroz',
      type: 'recipe',
    })}

    ${buildTwitterCardHtml({
      title,
      description,
      image,
      card: 'summary_large_image',
    })}

    <script type="application/ld+json">${escapeHtml(JSON.stringify(buildRecipeJsonLd(recipe, req)))}</script>
    <script type="application/ld+json">${escapeHtml(JSON.stringify(buildBreadcrumbJsonLd(req, recipe)))}</script>

    ${GA_SCRIPT}
  `;

  return seoHtml;
}

function injectCommonSeoForStaticPage(html, pageKey, req) {
  const meta = metaTags[pageKey] || metaTags.home;
  const seoHtml = buildMetaTags({
    ...meta,
    // Ensure OG/Twitter type defaults for static pages.
    ogType: pageKey === 'index' || pageKey === 'home' ? 'website' : 'website',
    twitterCard: 'summary_large_image',
  }, req);

  // Static page schema JSON-LD
  const pageTypeForSchema = pageKey === 'index' ? 'home' : pageKey;
  const pageJsonLd = buildPageJsonLd(pageTypeForSchema, req, meta);

  const jsonLdHtml = `
    <script type="application/ld+json">${escapeHtml(JSON.stringify(pageJsonLd))}</script>
  `;

  // Inject both meta tags and schema JSON-LD
  return injectSeoIntoHead(html, `${seoHtml}${jsonLdHtml}`);
}

/* =========================
   ROBOTS
========================= */
router.get('/robots.txt', (req, res) => {
  const baseUrl = getBaseUrl(req);

  // Allow all pages.
  // Disallow admin and API.
  const disallowedPaths = ['/admin/', '/api/'];
  const disallowedRules = disallowedPaths.map((p) => `\nDisallow: ${p}`).join('');

  const robotsContent = `User-agent: *${disallowedRules}\nSitemap: ${baseUrl}/sitemap.xml`;

  res.type('text/plain').send(robotsContent);
});

/* =========================
   SITEMAP (DYNAMIC)
========================= */
router.get('/sitemap.xml', async (req, res) => {
  res.header('Content-Type', 'application/xml');
  const baseUrl = getBaseUrl(req);

  const staticPages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/about', changefreq: 'weekly', priority: 0.8 },
    { url: '/appetizers', changefreq: 'weekly', priority: 0.8 },
    { url: '/burgers', changefreq: 'weekly', priority: 0.8 },
    { url: '/contact', changefreq: 'weekly', priority: 0.8 },
    { url: '/desserts', changefreq: 'weekly', priority: 0.8 },
    { url: '/explore', changefreq: 'weekly', priority: 0.9 },
    { url: '/pasta', changefreq: 'weekly', priority: 0.8 },
    { url: '/pizza', changefreq: 'weekly', priority: 0.8 },
    { url: '/privacy', changefreq: 'weekly', priority: 0.8 },
    { url: '/salads', changefreq: 'weekly', priority: 0.8 },
    { url: '/submit', changefreq: 'weekly', priority: 0.8 },
    { url: '/terms', changefreq: 'weekly', priority: 0.8 },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const page of staticPages) {
    xml += `<url>`;
    xml += `<loc>${baseUrl}${page.url}</loc>`;
    xml += `<changefreq>${page.changefreq}</changefreq>`;
    xml += `<priority>${page.priority}</priority>`;
    xml += `</url>\n`;
  }

  try {
    const recipes = await storage.getRecipes({});
    for (const recipe of recipes) {
      const category = normalizeStr(recipe?.category, '');
      const slug = toSlugForUrl(recipe?.name || '');
      if (!category || !slug) continue;

      const loc = `${baseUrl}/recipes/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;

      const lastmod = toIsoDate(recipe?.dateModified) || toIsoDate(recipe?.datePublished) || toIsoDate(recipe?.updated_at) || toIsoDate(recipe?.created_at);

      xml += `<url>`;
      xml += `<loc>${loc}</loc>`;
      if (lastmod) xml += `<lastmod>${lastmod}</lastmod>`;
      xml += `<changefreq>weekly</changefreq>`;
      xml += `<priority>0.9</priority>`;
      xml += `</url>\n`;
    }
  } catch (err) {
    // If sitemap generation fails, still return static pages.
    console.error('Sitemap generation error:', err);
  }

  xml += `</urlset>`;
  res.send(xml);
});

/* =====================================================
   ADMIN ROUTES (MUST BE BEFORE STATIC FALLBACK)
===================================================== */
router.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../views/admin/dashboard.html'));
});

router.get('/admin/recipes', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../views/admin/recipes.html'));
});

router.get('/admin/comments', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../views/admin/comments.html'));
});

router.get('/admin/contacts', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../views/admin/contacts.html'));
});

router.get('/admin/settings', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../views/admin/settings.html'));
});

router.get('/adminLogin', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../views/admin/login.html'));
});

/* =========================
   RECIPE SLUG ROUTE
========================= */
router.get('/recipes/:category/:recipeSlug', async (req, res) => {
  const { category, recipeSlug } = req.params;

  try {
    const recipe = await storage.getRecipe(category, recipeSlug);

    if (!recipe) {
      return res.status(404).sendFile(path.join(__dirname, '../../public/404.html'));
    }

    const templatePath = path.join(__dirname, '../../public/recipe-detail.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    const seoHtml = buildRecipeSeoHtml({ recipe, req });
    html = injectSeoIntoHead(html, seoHtml);

    // Preserve existing behavior: RECIPE_ID in the frontend.
    html = html.replace(
      '</body>',
      `<script src="/js/id.js">
</script></body>`
    );

    res.send(html);
  } catch (err) {
    console.error('Recipe page error:', err);
    return res.status(404).sendFile(path.join(__dirname, '../../public/404.html'));
  }
});

/* =========================
   STATIC PAGE ROUTE
========================= */
router.get('/:page?', (req, res, next) => {
  // Homepage: ensure GET / serves index.html (no /index required)
  const page = req.params.page || 'index';

  // Prevent catching /recipe/*
  if (req.path.startsWith('/recipe/')) return next();

  // Prevent catching /admin/* here
  if (req.path.startsWith('/admin/')) return next();
  if (req.path === '/admin') return next();
  if (req.path === '/adminLogin') return next();

  const fileName = page === 'index' && req.path === '/' ? 'index' : page;
  const filePath = path.join(__dirname, '../../public', `${fileName}.html`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return next();

    // Use metatags.js for static SEO
    const pageKey = fileName;
    const htmlWithSeo = injectCommonSeoForStaticPage(data, pageKey, req);

    res.send(htmlWithSeo);
  });
});

module.exports = router;

