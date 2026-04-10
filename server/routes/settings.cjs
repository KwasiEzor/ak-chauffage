const express = require('express');
const authMiddleware = require('../middleware/auth.cjs');
const { readJSON, writeJSON } = require('../utils/fileManager.cjs');
const { sanitizeObject } = require('../utils/sanitizer.cjs');
const ERRORS = require('../utils/errors.cjs');
const { settingsCache } = require('../utils/cache.cjs');

const router = express.Router();
const SETTINGS_FILE = 'settings.json';

/**
 * GET /api/settings
 * Get all site settings (public endpoint)
 */
router.get('/', async (req, res) => {
  try {
    const cached = settingsCache.get('public');
    if (cached) return res.json(cached);

    const settings = await readJSON(SETTINGS_FILE);

    if (!settings) {
      return res.status(404).json({ error: ERRORS.CONTENT.NOT_FOUND });
    }

    settingsCache.set('public', settings);
    res.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    res.status(500).json({ error: ERRORS.SYSTEM.LOAD_SETTINGS_FAILED });
  }
});

/**
 * PUT /api/settings
 * Update all site settings (protected)
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    const newSettings = sanitizeObject(req.body);

    // Basic validation
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: ERRORS.SYSTEM.INVALID_DATA });
    }

    await writeJSON(SETTINGS_FILE, newSettings);
    
    // Invalidate cache
    settingsCache.flush();

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: ERRORS.SYSTEM.UPDATE_SETTINGS_FAILED });
  }
});

module.exports = router;
