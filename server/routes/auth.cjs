const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.cjs');
const AdminService = require('../database/adminService.cjs');
const AuditLogService = require('../database/auditLogService.cjs');
const { AUTH, RATE_LIMIT } = require('../config/constants.cjs');
const ERRORS = require('../utils/errors.cjs');

const router = express.Router();

// Rate limiting storage (simple in-memory for development)
const loginAttempts = new Map();

// Periodic cleanup of loginAttempts to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now > data.resetTime) {
      loginAttempts.delete(ip);
    }
  }
}, RATE_LIMIT.WINDOW_MS);

/**
 * POST /api/auth/login
 * Login with username and password
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: ERRORS.AUTH.REQUIRED });
    }

    // Check rate limiting
    const ip = req.ip;
    const attempts = loginAttempts.get(ip) || { count: 0, resetTime: Date.now() + RATE_LIMIT.WINDOW_MS };

    if (Date.now() < attempts.resetTime && attempts.count >= RATE_LIMIT.LOGIN_MAX_ATTEMPTS) {
      return res.status(429).json({ error: ERRORS.AUTH.TOO_MANY_ATTEMPTS });
    }

    // Try database authentication first
    let admin = await AdminService.verify(username, password);
    let authSource = 'database';

    // Fallback to .env if database auth fails
    if (!admin) {
      const isValidUsername = username === process.env.ADMIN_USERNAME;
      const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

      if (isValidUsername && isValidPassword) {
        admin = {
          id: 0, // Special ID for .env admin
          username,
          role: 'super_admin'
        };
        authSource = 'environment';
      }
    }

    if (!admin) {
      // Increment failed attempts
      if (Date.now() >= attempts.resetTime) {
        loginAttempts.set(ip, { count: 1, resetTime: Date.now() + RATE_LIMIT.WINDOW_MS });
      } else {
        attempts.count++;
        loginAttempts.set(ip, attempts);
      }

      return res.status(401).json({ error: ERRORS.AUTH.INVALID_CREDENTIALS });
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(ip);

    // Log successful login (only if database admin)
    if (authSource === 'database' && admin.id) {
      try {
        await AuditLogService.log({
          adminId: admin.id,
          action: 'login',
          entityType: 'auth',
          details: { authSource },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      } catch (error) {
        console.error('Failed to log audit entry:', error);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        authSource
      },
      AUTH.JWT_SECRET,
      { expiresIn: AUTH.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        authSource
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: ERRORS.AUTH.INTERNAL_ERROR });
  }
});

/**
 * POST /api/auth/logout
 * Dummy logout (client just discards token)
 */
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

/**
 * GET /api/auth/verify
 * Verify token and return user data
 */
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * GET /api/auth/profile
 * Get current admin profile
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // If it's the .env admin
    if (req.user.authSource === 'environment') {
      return res.json({
        id: 0,
        username: req.user.username,
        role: 'super_admin',
        authSource: 'environment',
        canChangePassword: false
      });
    }

    const admin = await AdminService.getById(req.user.id);

    if (!admin) {
      return res.status(404).json({ error: ERRORS.AUTH.ADMIN_NOT_FOUND });
    }

    res.json({
      ...admin,
      canChangePassword: true,
      authSource: 'database'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: ERRORS.AUTH.INTERNAL_ERROR });
  }
});

/**
 * PUT /api/auth/password
 * Change current admin password
 */
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: ERRORS.AUTH.REQUIRED });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: ERRORS.AUTH.PASSWORDS_DONT_MATCH });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: ERRORS.AUTH.PASSWORD_TOO_SHORT });
    }

    // Check if .env admin
    if (req.user.authSource === 'environment') {
      return res.status(403).json({
        error: ERRORS.AUTH.ENV_PASS_CHANGE_RESTRICTED
      });
    }

    await AdminService.updatePassword(req.user.id, currentPassword, newPassword);

    // Log password change
    await AuditLogService.log({
      adminId: req.user.id,
      action: 'change_password',
      entityType: 'admin',
      entityId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/auth/email
 * Update admin email
 */
router.put('/email', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: ERRORS.AUTH.REQUIRED });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: ERRORS.CONTACT.INVALID_EMAIL });
    }

    // Check if .env admin
    if (req.user.authSource === 'environment') {
      return res.status(403).json({
        error: ERRORS.AUTH.ENV_EMAIL_CHANGE_RESTRICTED
      });
    }

    const updated = await AdminService.updateEmail(req.user.id, email);

    // Log email change
    await AuditLogService.log({
      adminId: req.user.id,
      action: 'update_email',
      entityType: 'admin',
      entityId: req.user.id,
      details: { email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Email update error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
