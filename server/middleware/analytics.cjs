const VisitorAnalyticsService = require('../database/visitorAnalyticsService.cjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Analytics Tracking Middleware
 * Tracks page views server-side without cookies (GDPR-friendly)
 * Uses session cookie only for tracking unique visitors
 */

function analyticsMiddleware(req, res, next) {
  // Skip tracking for:
  // - API routes
  // - Admin routes
  // - Static assets (.js, .css, images, etc.)
  const skipPatterns = [
    /^\/api\//,
    /^\/admin\//,
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i,
  ];

  const shouldSkip = skipPatterns.some((pattern) => pattern.test(req.path));

  if (shouldSkip) {
    return next();
  }

  // Track in background (non-blocking)
  setImmediate(() => {
    try {
      // Get or create session ID
      let sessionId = req.cookies?.analytics_session;

      if (!sessionId) {
        sessionId = uuidv4();
        // Set session cookie (30 minutes expiry)
        res.cookie('analytics_session', sessionId, {
          maxAge: 30 * 60 * 1000, // 30 minutes
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
      }

      // Track the page view
      VisitorAnalyticsService.track({
        sessionId,
        pagePath: req.path,
        referrer: req.get('Referer'),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });
    } catch (error) {
      // Log error but don't break the request
      console.error('Analytics tracking error:', error.message);
    }
  });

  next();
}

module.exports = analyticsMiddleware;
