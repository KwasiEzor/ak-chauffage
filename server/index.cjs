require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { ensureDataDir } = require('./utils/fileManager.cjs');
const { RATE_LIMIT } = require('./config/constants.cjs');

const app = express();
const PORT = process.env.PORT || 3001;
const { db } = require('./database/connection.cjs');

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🛑 Shutting down server gracefully...');
  try {
    if (db && db.close) {
      await db.close();
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Rate limiting - General API
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - Login (prevent brute force)
const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.LOGIN_MAX_ATTEMPTS,
  message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiting - Contact form
const contactLimiter = rateLimit({
  windowMs: RATE_LIMIT.CONTACT_WINDOW_MS,
  max: RATE_LIMIT.CONTACT_MAX_ATTEMPTS,
  message: 'Trop de soumissions. Veuillez réessayer dans une heure.',
  skipSuccessfulRequests: false,
});

// Apply rate limiting to general API (admin routes are protected by auth)
app.use('/api/', apiLimiter);

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// Enable Gzip/Brotli compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6 // Compression level (0-9, higher = better compression but slower)
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing
app.use(cookieParser());

// CSRF Protection
const csrfMiddleware = require('./middleware/csrf.cjs');
app.use(csrfMiddleware);

// Analytics tracking middleware (before static files)
const analyticsMiddleware = require('./middleware/analytics.cjs');
app.use(analyticsMiddleware);

// Serve uploaded files with caching
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y', // Cache for 1 year
  immutable: true,
  setHeaders: (res, path) => {
    // Set cache control headers based on file type
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') ||
        path.endsWith('.webp') || path.endsWith('.gif') || path.endsWith('.svg')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// API Routes
app.use('/api/auth', require('./routes/auth.cjs'));
app.use('/api/content', require('./routes/content.cjs'));
app.use('/api/settings', require('./routes/settings.cjs'));
app.use('/api/system-settings', require('./routes/systemSettings.cjs'));
app.use('/api/media', require('./routes/media.cjs'));
app.use('/api/legal', require('./routes/legal.cjs'));
app.use('/api/contact', contactLimiter, require('./routes/contact.cjs'));
app.use('/api/contacts', require('./routes/contacts.cjs'));
app.use('/api/analytics', require('./routes/analytics.cjs'));
app.use('/api/invoices', require('./routes/invoices.cjs'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from React build (production only)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');

  // Serve static assets
  app.use(express.static(distPath, {
    maxAge: '1y',
    immutable: true,
  }));

  // Catch-all handler - send React app for client-side routing
  // Using app.use() instead of app.get() for Express 5.x compatibility
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

// Initialize and start server
async function start() {
  try {
    // Ensure data directory exists
    await ensureDataDir();

    // Run database migrations
    console.log('📦 Running database migrations...');
    const migrateEnvAdmin = require('./database/migrations/migrate-env-admin.cjs');
    const addAnalyticsTable = require('./database/migrations/add-analytics.cjs');
    const addInvoiceTables = require('./database/migrations/add-invoices.cjs');
    const fixColumnNames = require('./database/migrations/fix-column-names.cjs');
    const fixSchemaMismatches = require('./database/migrations/fix-schema-mismatches.cjs');
    
    await migrateEnvAdmin();
    await addAnalyticsTable();
    await addInvoiceTables();
    await fixColumnNames();
    await fixSchemaMismatches();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 API: http://localhost:${PORT}/api`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
