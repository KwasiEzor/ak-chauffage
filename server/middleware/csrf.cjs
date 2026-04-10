/**
 * CSRF Protection Middleware
 * 
 * This middleware protects state-changing operations (POST, PUT, DELETE, PATCH)
 * from Cross-Site Request Forgery (CSRF) attacks.
 * 
 * It works by:
 * 1. Setting a CSRF token in a cookie on initial GET requests
 * 2. Requiring the client to send the same token in a custom header (X-CSRF-Token)
 *    on all state-changing requests.
 */

const crypto = require('crypto');

// Get secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

/**
 * Generate a random CSRF token
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * CSRF Middleware
 */
const csrfMiddleware = (req, res, next) => {
  // 1. Skip check for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    // For safe methods, just ensure the cookie exists
    if (!req.cookies || !req.cookies['XSRF-TOKEN']) {
      const token = generateToken();
      res.cookie('XSRF-TOKEN', token, {
        path: '/',
        httpOnly: false, // Must be readable by frontend to send in header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }
    return next();
  }

  // 2. Check token for unsafe methods
  const cookieToken = req.cookies['XSRF-TOKEN'];
  const headerToken = req.headers['x-csrf-token'];

  // 3. Validation
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    console.warn(`CSRF validation failed for ${req.method} ${req.originalUrl} from ${req.ip}`);
    return res.status(403).json({
      error: 'CSRF token validation failed. Please refresh the page.',
      code: 'CSRF_ERROR'
    });
  }

  next();
};

module.exports = csrfMiddleware;
