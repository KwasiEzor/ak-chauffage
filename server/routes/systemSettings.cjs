const express = require('express');
const authMiddleware = require('../middleware/auth.cjs');
const SystemSettingsService = require('../database/systemSettingsService.cjs');
const AuditLogService = require('../database/auditLogService.cjs');
const nodemailer = require('nodemailer');

const router = express.Router();

/**
 * GET /api/system-settings/smtp
 * Get SMTP configuration
 */
router.get('/smtp', authMiddleware, (req, res) => {
  try {
    const config = SystemSettingsService.getSMTPConfig();

    // Don't send password to frontend (security)
    const { pass, ...safeConfig } = config;

    res.json({
      ...safeConfig,
      hasPassword: !!pass,
    });
  } catch (error) {
    console.error('Error fetching SMTP config:', error);
    res.status(500).json({ error: 'Failed to fetch SMTP configuration' });
  }
});

/**
 * PUT /api/system-settings/smtp
 * Update SMTP configuration
 */
router.put('/smtp', authMiddleware, async (req, res) => {
  try {
    const { host, port, user, pass, from } = req.body;

    // Validation
    if (!host || !port || !user) {
      return res.status(400).json({ error: 'Host, port, and user are required' });
    }

    // Update settings
    const config = SystemSettingsService.updateSMTPConfig(
      { host, port, user, pass: pass || '', from },
      req.user.id
    );

    // Log the change
    await AuditLogService.log({
      adminId: req.user.id,
      action: 'update_smtp_config',
      entityType: 'system_settings',
      entityId: 'smtp',
      details: { host, port, user, from },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      config: {
        host: config.host,
        port: config.port,
        user: config.user,
        from: config.from,
        source: config.source,
      },
    });
  } catch (error) {
    console.error('Error updating SMTP config:', error);
    res.status(500).json({ error: 'Failed to update SMTP configuration' });
  }
});

/**
 * POST /api/system-settings/smtp/test
 * Test SMTP connection
 */
router.post('/smtp/test', authMiddleware, async (req, res) => {
  try {
    const { host, port, user, pass } = req.body;

    if (!host || !port || !user) {
      return res.status(400).json({ error: 'Host, port, and user are required for testing' });
    }

    // Create test transporter
    const config = {
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
    };

    // Only add auth if password is provided (for testing new config)
    if (pass) {
      config.auth = { user, pass };
    }

    const transporter = nodemailer.createTransport(config);

    // Verify connection
    await transporter.verify();

    // Log test
    await AuditLogService.log({
      adminId: req.user.id,
      action: 'test_smtp_connection',
      entityType: 'system_settings',
      entityId: 'smtp',
      details: { host, port, user, success: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'SMTP connection successful!',
    });
  } catch (error) {
    console.error('SMTP test failed:', error);

    // Log failed test
    try {
      await AuditLogService.log({
        adminId: req.user.id,
        action: 'test_smtp_connection',
        entityType: 'system_settings',
        entityId: 'smtp',
        details: {
          host: req.body.host,
          port: req.body.port,
          user: req.body.user,
          success: false,
          error: error.message,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    } catch (logError) {
      console.error('Failed to log test failure:', logError);
    }

    res.status(400).json({
      success: false,
      error: error.message || 'SMTP connection failed',
    });
  }
});

/**
 * GET /api/system-settings/all
 * Get all system settings (super_admin only)
 */
router.get('/all', authMiddleware, (req, res) => {
  try {
    // Check if super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const settings = SystemSettingsService.getAll();

    res.json(settings);
  } catch (error) {
    console.error('Error fetching all settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

module.exports = router;
