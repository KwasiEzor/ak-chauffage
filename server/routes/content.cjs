const express = require('express');
const authMiddleware = require('../middleware/auth.cjs');
const { readJSON, writeJSON } = require('../utils/fileManager.cjs');

const router = express.Router();
const CONTENT_FILE = 'content.json';

/**
 * GET /api/content
 * Get all content (public endpoint)
 */
router.get('/', async (req, res) => {
  try {
    const content = await readJSON(CONTENT_FILE);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Error reading content:', error);
    res.status(500).json({ error: 'Failed to load content' });
  }
});

/**
 * GET /api/content/:type
 * Get specific content type (public endpoint)
 */
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const content = await readJSON(CONTENT_FILE);

    if (!content || !content[type]) {
      return res.status(404).json({ error: 'Content type not found' });
    }

    res.json(content[type]);
  } catch (error) {
    console.error('Error reading content type:', error);
    res.status(500).json({ error: 'Failed to load content type' });
  }
});

/**
 * PUT /api/content
 * Update all content (protected)
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    const newContent = req.body;

    // Basic validation
    if (!newContent || typeof newContent !== 'object') {
      return res.status(400).json({ error: 'Invalid content data' });
    }

    await writeJSON(CONTENT_FILE, newContent);

    res.json({ success: true, message: 'Content updated successfully' });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

/**
 * PUT /api/content/:type
 * Update specific content type (protected)
 */
router.put('/:type', authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    const newData = req.body;

    const content = await readJSON(CONTENT_FILE);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    content[type] = newData;
    await writeJSON(CONTENT_FILE, content);

    res.json({ success: true, message: `${type} updated successfully` });
  } catch (error) {
    console.error('Error updating content type:', error);
    res.status(500).json({ error: 'Failed to update content type' });
  }
});

/**
 * PUT /api/content/:type/:id
 * Update specific item in content type (protected)
 */
router.put('/:type/:id', authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const updatedItem = req.body;

    const content = await readJSON(CONTENT_FILE);
    if (!content || !Array.isArray(content[type])) {
      return res.status(404).json({ error: 'Content type not found' });
    }

    const index = parseInt(id);
    if (isNaN(index) || index < 0 || index >= content[type].length) {
      return res.status(404).json({ error: 'Item not found' });
    }

    content[type][index] = updatedItem;
    await writeJSON(CONTENT_FILE, content);

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

module.exports = router;
