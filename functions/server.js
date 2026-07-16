require('dotenv').config();
const {connectDB} = require('./database');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

const pagesRouter = require('./routes/pages');
const recipesRouter = require('./routes/recipes');
const commentsRouter = require('./routes/comments');
const adminRouter = require('./routes/admin');
const contactRoutes = require("./routes/contact");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Minimal cookie parsing (no external deps)
app.use((req, _res, next) => {
  const header = req.headers.cookie;
  req.cookies = {};
  if (!header) return next();
  header.split(';').forEach((part) => {
    const [k, ...v] = part.trim().split('=');
    if (!k) return;
    req.cookies[k] = decodeURIComponent(v.join('='));
  });
  next();
});

app.use(
  cors({
    origin: ['https://praroz-50094.web.app', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);

app.use(
    express.static(
        path.join(__dirname, "../public"),
        {
            index: false
        }
    )
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// API routers
app.use('/api', recipesRouter);
app.use('/api', commentsRouter);
app.use('/api', adminRouter);
app.use('/api', contactRoutes);

// Serve static HTML with meta injection & SPA-style fallbacks
app.use(pagesRouter);

// Quick admin views guard (so /admin/* is never mistaken for /public/*.html)
app.use('/admin', express.Router());

// Extra static guard (keeps existing behavior)
app.use((req, res, next) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Let API routes & static assets fall through
  if (pathname.startsWith('/api/') || pathname.startsWith('/uploads/') || pathname.startsWith('/images/')) {
    return next();
  }

  if (!path.extname(pathname)) {
    const htmlPath = path.join(__dirname, '../public', `${pathname}.html`);
    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }
  }
  next();
});

// Final 404 handler (covers any unavailable URL/route)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

const PORT = process.env.PORT || 3000;


async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

startServer();

