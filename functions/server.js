require('dotenv').config();
const helmet = require("helmet");
const {connectDB} = require('./database');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
//const crypto = require("crypto");

const app = express();

const pagesRouter = require('./routes/pages');
const recipesRouter = require('./routes/recipes');
const commentsRouter = require('./routes/comments');
const adminRouter = require('./routes/admin');
const contactRoutes = require("./routes/contact");

const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5
});

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'",
            "https://www.googletagmanager.com",
            "https://www.google-analytics.com",
            "https://www.google.com/recaptcha/",
            "https://www.gstatic.com/recaptcha/"
        ],
    
        frameSrc: [
            "'self'",
            "https://www.google.com/recaptcha/",
            "https://recaptcha.google.com/recaptcha/"
        ],
        imgSrc: [
            "'self'",
            "data:",
            "http://127.0.0.1:3000",
            "http://localhost:3000",
            "https://res.cloudinary.com",
            "https://www.google-analytics.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],
        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "https://praroz-50094.web.app",
          "https://praroz.onrender.com",
          "https://www.google-analytics.com",
          "https://www.google.com",
          "https://www.google.com/recaptcha/"
        ]
      }
    },
    permissionsPolicy: {
      features: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: []
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);

/*app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString("base64");
    next();
});*/

app.use(
  cors({
    origin: ['https://praroz-50094.web.app', 'http://localhost:3000'],
    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api', apiLimiter, adminRouter);
app.use('/api', contactLimiter, contactRoutes);

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

