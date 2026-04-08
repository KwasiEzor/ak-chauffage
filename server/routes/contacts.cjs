const express = require('express');
const ContactService = require('../database/contactService.cjs');
const authMiddleware = require('../middleware/auth.cjs');

const router = express.Router();

/**
 * GET /api/contacts
 * Get all contacts (with filters and pagination)
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const { status, search, limit, offset } = req.query;

    const result = ContactService.getAll({
      status,
      search,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

/**
 * GET /api/contacts/stats
 * Get contact statistics
 */
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const stats = ContactService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * GET /api/contacts/export
 * Export contacts to CSV
 */
router.get('/export', authMiddleware, (req, res) => {
  try {
    const csvData = ContactService.exportToCSV();

    // Convert to CSV string
    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({ error: 'Failed to export contacts' });
  }
});

/**
 * GET /api/contacts/:id
 * Get a single contact
 */
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const contact = ContactService.getById(req.params.id);

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

/**
 * PUT /api/contacts/:id
 * Update contact status and notes
 */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'contacted', 'completed', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const contact = ContactService.update(req.params.id, { status, notes });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

/**
 * DELETE /api/contacts/:id
 * Delete a contact
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const success = ContactService.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;
