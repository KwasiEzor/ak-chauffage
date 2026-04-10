const express = require('express');
const VisitorAnalyticsService = require('../database/visitorAnalyticsService.cjs');
const authMiddleware = require('../middleware/auth.cjs');

const router = express.Router();

/**
 * GET /api/analytics/stats
 * Get visitor analytics statistics
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { days } = req.query;

    // Validate days parameter
    const daysInt = days ? parseInt(days) : 7;
    if (daysInt < 1 || daysInt > 365) {
      return res.status(400).json({ error: 'Days must be between 1 and 365' });
    }

    const stats = await VisitorAnalyticsService.getStats(daysInt);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
