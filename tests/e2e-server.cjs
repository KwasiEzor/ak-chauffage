const bcrypt = require('bcrypt');

process.env.PORT = process.env.PORT || '4020';
process.env.NODE_ENV = 'production';
process.env.ALLOWED_ORIGINS =
  process.env.ALLOWED_ORIGINS || 'https://akchauffage.localhost:4443';
process.env.DISABLE_HTTPS_REDIRECT = process.env.DISABLE_HTTPS_REDIRECT || 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'playwright-secret';
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'playwright-admin';
process.env.ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('PlaywrightPassword123!', 10);
process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'playwright-admin@example.com';

require('../server.cjs');
