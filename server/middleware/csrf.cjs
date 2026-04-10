/**
 * CSRF Protection Middleware
 * 
 * This middleware protects state-changing operations (POST, PUT, DELETE, PATCH)
 * from Cross-Site Request Forgery (CSRF) attacks.
 */

const crypto = require('crypto');
const { SECURITY } = require('../config/constants.cjs');

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
  // 1. Skip check for safe methods or login route
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const excludedRoutes = ['/api/auth/login', '/api/auth/logout'];
  
  // Debug log
  if (process.env.NODE_ENV === 'production') {
    console.log(`CSRF Check: ${req.method} ${req.originalUrl}`);
  }

  if (safeMethods.includes(req.method) || excludedRoutes.includes(req.originalUrl)) {
    // For safe methods or excluded routes, just ensure the cookie exists if missing
    if (!req.cookies || !req.cookies[SECURITY.CSRF_COOKIE_NAME]) {
      const token = generateToken();
      res.cookie(SECURITY.CSRF_COOKIE_NAME, token, {
        path: '/',
        httpOnly: false, // Must be readable by frontend to send in header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: SECURITY.CSRF_MAX_AGE
      });
    }
    return next();
  }

  // 2. Check token for unsafe methods
  const cookieToken = req.cookies[SECURITY.CSRF_COOKIE_NAME];
  const headerToken = req.headers[SECURITY.CSRF_HEADER_NAME.toLowerCase()];

  // 3. Validation
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    console.warn(`CSRF validation failed for ${req.method} ${req.originalUrl} from ${req.ip}`);
    console.warn(`Cookie Token: ${cookieToken ? 'Present' : 'Missing'}`);
    console.warn(`Header Token: ${headerToken ? 'Present' : 'Missing'}`);
    
    return res.status(403).json({
      error: 'CSRF token validation failed. Please refresh the page.',
      code: 'CSRF_ERROR'
    });
  }

  next();
};

module.exports = csrfMiddleware;
