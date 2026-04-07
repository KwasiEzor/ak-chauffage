const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.cjs');

const router = express.Router();

// Rate limiting storage (simple in-memory for development)
const loginAttempts = new Map();

/**
 * POST /api/auth/login
 * Login with username and password
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check rate limiting
    const ip = req.ip;
    const attempts = loginAttempts.get(ip) || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };

    if (Date.now() < attempts.resetTime && attempts.count >= 5) {
      return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
    }

    // Verify credentials
    const isValidUsername = username === process.env.ADMIN_USERNAME;
    const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

    if (!isValidUsername || !isValidPassword) {
      // Increment failed attempts
      if (Date.now() >= attempts.resetTime) {
        loginAttempts.set(ip, { count: 1, resetTime: Date.now() + 15 * 60 * 1000 });
      } else {
        attempts.count++;
        loginAttempts.set(ip, attempts);
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(ip);

    // Generate JWT token (expires in 8 hours)
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      user: { username, role: 'admin' }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true });
});

/**
 * GET /api/auth/verify
 * Verify JWT token
 */
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
