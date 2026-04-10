const express = require('express');
const authMiddleware = require('../middleware/auth.cjs');
const { readJSON, writeJSON } = require('../utils/fileManager.cjs');
const { sanitizeObject } = require('../utils/sanitizer.cjs');
const ERRORS = require('../utils/errors.cjs');
const { contentCache } = require('../utils/cache.cjs');

const router = express.Router();
const CONTENT_FILE = 'content.json';

/**
 * GET /api/content
 * Get all content (public endpoint)
 */
router.get('/', async (req, res) => {
  try {
    // Try cache first
    const cached = contentCache.get('all');
    if (cached) return res.json(cached);

    const content = await readJSON(CONTENT_FILE);

    if (!content) {
      return res.status(404).json({ error: ERRORS.CONTENT.NOT_FOUND });
    }

    contentCache.set('all', content);
    res.json(content);
  } catch (error) {
    console.error('Error reading content:', error);
    res.status(500).json({ error: ERRORS.CONTENT.LOAD_FAILED });
  }
});

/**
 * GET /api/content/:type
 * Get specific content type (public endpoint)
 */
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    // Try cache first
    const cached = contentCache.get(`type_${type}`);
    if (cached) return res.json(cached);

    const content = await readJSON(CONTENT_FILE);

    if (!content || !content[type]) {
      return res.status(404).json({ error: ERRORS.CONTENT.TYPE_NOT_FOUND });
    }

    contentCache.set(`type_${type}`, content[type]);
    res.json(content[type]);
  } catch (error) {
    console.error('Error reading content type:', error);
    res.status(500).json({ error: ERRORS.CONTENT.LOAD_FAILED });
  }
});

/**
 * PUT /api/content
 * Update all content (protected)
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    const newContent = sanitizeObject(req.body);

    // Basic validation
    if (!newContent || typeof newContent !== 'object') {
      return res.status(400).json({ error: ERRORS.CONTENT.INVALID_DATA });
    }

    await writeJSON(CONTENT_FILE, newContent);
    
    // Invalidate cache
    contentCache.flush();

    res.json({ success: true, message: 'Content updated successfully' });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: ERRORS.CONTENT.UPDATE_FAILED });
  }
});

/**
 * PUT /api/content/:type
 * Update specific content type (protected)
 */
router.put('/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const newData = sanitizeObject(req.body);

    const content = await readJSON(CONTENT_FILE);
    if (!content) {
      return res.status(404).json({ error: ERRORS.CONTENT.NOT_FOUND });
    }

    content[type] = newData;
    await writeJSON(CONTENT_FILE, content);
    
    // Invalidate cache
    contentCache.flush();

    res.json({ success: true, message: `${type} updated successfully` });
  } catch (error) {
    console.error('Error updating content type:', error);
    res.status(500).json({ error: ERRORS.CONTENT.UPDATE_FAILED });
  }
});

/**
 * PUT /api/content/:type/:id
 * Update specific item in content type (protected)
 */
router.put('/:type/:id', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const updatedItem = sanitizeObject(req.body);

    const content = await readJSON(CONTENT_FILE);
    if (!content || !Array.isArray(content[type])) {
      return res.status(404).json({ error: ERRORS.CONTENT.TYPE_NOT_FOUND });
    }

    const index = parseInt(id);
    if (isNaN(index) || index < 0 || index >= content[type].length) {
      return res.status(404).json({ error: ERRORS.GENERAL.NOT_FOUND });
    }

    content[type][index] = updatedItem;
    await writeJSON(CONTENT_FILE, content);
    
    // Invalidate cache
    contentCache.flush();

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: ERRORS.CONTENT.UPDATE_FAILED });
  }
});

module.exports = router;
