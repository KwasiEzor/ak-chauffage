/**
 * Application Constants and Configuration
 */

module.exports = {
  // Auth configuration
  AUTH: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-default-secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
    SALT_ROUNDS: 12,
  },

  // Database configuration
  DATABASE: {
    TYPE: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
    LOG_RETENTION_DAYS: parseInt(process.env.LOG_RETENTION_DAYS) || 90,
  },

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    LOGIN_MAX_ATTEMPTS: 5,
    CONTACT_MAX_ATTEMPTS: 10,
    CONTACT_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  },

  // Email configuration
  EMAIL: {
    DEFAULT_FROM: '"AK CHAUFFAGE" <noreply@ak-chauffage.be>',
    CONTACT_RECIPIENT: process.env.CONTACT_EMAIL || 'contact@ak-chauffage.be',
  },

  // Security
  SECURITY: {
    CSRF_COOKIE_NAME: 'XSRF-TOKEN',
    CSRF_HEADER_NAME: 'X-CSRF-Token',
    CSRF_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  }
};
