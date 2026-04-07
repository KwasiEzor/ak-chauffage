const express = require('express');
const authMiddleware = require('../middleware/auth.cjs');
const { readJSON, writeJSON } = require('../utils/fileManager.cjs');

const router = express.Router();
const SETTINGS_FILE = 'settings.json';

/**
 * GET /api/settings
 * Get site settings (public endpoint)
 */
router.get('/', async (req, res) => {
  try {
    const settings = await readJSON(SETTINGS_FILE);

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

/**
 * PUT /api/settings
 * Update site settings (protected)
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    const newSettings = req.body;

    // Basic validation
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' });
    }

    await writeJSON(SETTINGS_FILE, newSettings);

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
