const express = require('express');
const authMiddleware = require('../middleware/auth.cjs');
const { readJSON, writeJSON } = require('../utils/fileManager.cjs');
const { sanitizeObject } = require('../utils/sanitizer.cjs');
const ERRORS = require('../utils/errors.cjs');

const router = express.Router();
const LEGAL_FILE = 'legal.json';

/**
 * GET /api/legal
 * Get all active legal pages (public endpoint)
 */
router.get('/', async (req, res) => {
  try {
    const data = await readJSON(LEGAL_FILE);

    if (!data || !data.pages) {
      return res.status(404).json({ error: ERRORS.LEGAL.NOT_FOUND });
    }

    // Filter to only return active pages
    const activePages = data.pages.filter(page => page.active);

    // Return minimal info for listing
    const pageList = activePages.map(page => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      lastUpdated: page.lastUpdated,
    }));

    res.json(pageList);
  } catch (error) {
    console.error('Error reading legal pages:', error);
    res.status(500).json({ error: ERRORS.GENERAL.INTERNAL_ERROR });
  }
});

/**
 * GET /api/legal/:slug
 * Get a specific legal page by slug (public endpoint)
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await readJSON(LEGAL_FILE);

    if (!data || !data.pages) {
      return res.status(404).json({ error: ERRORS.LEGAL.NOT_FOUND });
    }

    // Find the page by slug
    const page = data.pages.find(p => p.slug === slug && p.active);

    if (!page) {
      return res.status(404).json({ error: ERRORS.LEGAL.PAGE_NOT_FOUND });
    }

    res.json(page);
  } catch (error) {
    console.error('Error reading legal page:', error);
    res.status(500).json({ error: ERRORS.GENERAL.INTERNAL_ERROR });
  }
});

/**
 * PUT /api/legal/:id
 * Update a specific legal page (protected)
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPage = sanitizeObject(req.body);

    // Basic validation
    if (!updatedPage || typeof updatedPage !== 'object') {
      return res.status(400).json({ error: ERRORS.LEGAL.INVALID_DATA });
    }

    const data = await readJSON(LEGAL_FILE);

    if (!data || !data.pages) {
      return res.status(404).json({ error: ERRORS.LEGAL.NOT_FOUND });
    }

    // Find the index of the page to update
    const pageIndex = data.pages.findIndex(p => p.id === id);

    if (pageIndex === -1) {
      return res.status(404).json({ error: ERRORS.LEGAL.PAGE_NOT_FOUND });
    }

    // Update the page
    data.pages[pageIndex] = {
      ...data.pages[pageIndex],
      ...updatedPage,
      id, // Ensure ID doesn't change
      lastUpdated: new Date().toISOString().split('T')[0], // Update timestamp
    };

    await writeJSON(LEGAL_FILE, data);

    res.json({
      success: true,
      message: 'Legal page updated successfully',
      page: data.pages[pageIndex]
    });
  } catch (error) {
    console.error('Error updating legal page:', error);
    res.status(500).json({ error: ERRORS.LEGAL.UPDATE_FAILED });
  }
});

module.exports = router;
