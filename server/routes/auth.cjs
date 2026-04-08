const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth.cjs');
const AdminService = require('../database/adminService.cjs');
const AuditLogService = require('../database/auditLogService.cjs');

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
        loginAttempts.set(ip, { count: 1, resetTime: Date.now() + 15 * 60 * 1000 });
      } else {
        attempts.count++;
        loginAttempts.set(ip, attempts);
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(ip);

    // Log successful login (only if database admin)
    if (authSource === 'database' && admin.id) {
      try {
        AuditLogService.log({
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

    // Generate JWT token (expires in 8 hours)
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        authSource
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        authSource
      }
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

/**
 * GET /api/auth/profile
 * Get current admin profile
 */
router.get('/profile', authMiddleware, (req, res) => {
  try {
    // If .env admin, return basic info
    if (req.user.authSource === 'environment' || req.user.id === 0) {
      return res.json({
        id: 0,
        username: req.user.username,
        role: req.user.role,
        authSource: 'environment',
        canChangePassword: false,
        message: 'Using .env credentials. Create a database admin to enable profile management.'
      });
    }

    const admin = AdminService.getById(req.user.id);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({
      ...admin,
      canChangePassword: true,
      authSource: 'database'
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/auth/password
 * Change password
 */
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if .env admin
    if (req.user.authSource === 'environment' || req.user.id === 0) {
      return res.status(403).json({
        error: 'Cannot change .env password via dashboard. Please edit .env file directly or create a database admin account.'
      });
    }

    // Update password
    await AdminService.updatePassword(req.user.id, currentPassword, newPassword);

    // Log password change
    AuditLogService.log({
      adminId: req.user.id,
      action: 'change_password',
      entityType: 'admin',
      entityId: req.user.id.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Password updated successfully. Please login again.'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(400).json({ error: error.message || 'Failed to change password' });
  }
});

/**
 * PUT /api/auth/email
 * Update email address
 */
router.put('/email', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if .env admin
    if (req.user.authSource === 'environment' || req.user.id === 0) {
      return res.status(403).json({
        error: 'Cannot update email for .env admin. Please create a database admin account.'
      });
    }

    const updated = AdminService.updateEmail(req.user.id, email);

    // Log email change
    AuditLogService.log({
      adminId: req.user.id,
      action: 'update_email',
      entityType: 'admin',
      entityId: req.user.id.toString(),
      details: { newEmail: email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      admin: updated
    });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(400).json({ error: error.message || 'Failed to update email' });
  }
});

module.exports = router;
