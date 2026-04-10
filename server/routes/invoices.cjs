const express = require('express');
const InvoiceService = require('../database/invoiceService.cjs');
const authMiddleware = require('../middleware/auth.cjs');
const { sendInvoiceEmail } = require('../utils/mailer.cjs');
const { generateInvoicePDF } = require('../utils/invoicePdfGenerator.cjs');
const ERRORS = require('../utils/errors.cjs');

const router = express.Router();

// All routes are protected with auth middleware
router.use(authMiddleware);

/**
 * GET /api/invoices
 * Get all invoices (with filters and pagination)
 */
router.get('/', async (req, res) => {
  try {
    const { status, search, limit, offset } = req.query;

    const result = await InvoiceService.getAll({
      status,
      search,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: ERRORS.GENERAL.INTERNAL_ERROR });
  }
});

/**
 * GET /api/invoices/stats
 * Get invoice statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await InvoiceService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({ error: ERRORS.GENERAL.INTERNAL_ERROR });
  }
});

/**
 * GET /api/invoices/:id
 * Get a single invoice with line items
 */
router.get('/:id', async (req, res) => {
  try {
    const invoice = await InvoiceService.getById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: ERRORS.INVOICE.NOT_FOUND });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: ERRORS.GENERAL.INTERNAL_ERROR });
  }
});

/**
 * POST /api/invoices
 * Create a new invoice
 */
router.post('/', async (req, res) => {
  try {
    const { invoice, lineItems } = req.body;

    // Validation
    if (!invoice || !lineItems || lineItems.length === 0) {
      return res.status(400).json({ error: ERRORS.INVOICE.FIELDS_REQUIRED });
    }

    if (!invoice.client_name || !invoice.client_email || !invoice.issue_date) {
      return res.status(400).json({ error: ERRORS.INVOICE.CLIENT_REQUIRED });
    }

    // Create invoice with current admin user
    const createdInvoice = await InvoiceService.create({
      invoice,
      lineItems,
      createdBy: req.user.id, // From auth middleware
    });

    res.status(201).json(createdInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: ERRORS.INVOICE.CREATE_FAILED });
  }
});

/**
 * PATCH /api/invoices/:id/status
 * Update invoice status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, paidDate } = req.body;

    // Validate status
    const validStatuses = ['draft', 'sent', 'paid', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: ERRORS.CONTACT.INVALID_STATUS });
    }

    const invoice = await InvoiceService.updateStatus(req.params.id, status, paidDate);

    if (!invoice) {
      return res.status(404).json({ error: ERRORS.INVOICE.NOT_FOUND });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ error: ERRORS.INVOICE.UPDATE_FAILED });
  }
});

/**
 * POST /api/invoices/:id/send
 * Send invoice via email
 */
router.post('/:id/send', async (req, res) => {
  try {
    // Get invoice with line items
    const invoice = await InvoiceService.getById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: ERRORS.INVOICE.NOT_FOUND });
    }

    // Validate client email
    if (!invoice.client_email) {
      return res.status(400).json({ error: ERRORS.INVOICE.NO_EMAIL });
    }

    // Generate PDF
    console.log('📄 Generating invoice PDF...');
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Send email
    console.log('📧 Sending invoice email to:', invoice.client_email);
    await sendInvoiceEmail({
      invoice,
      pdfBuffer,
      clientEmail: invoice.client_email,
    });

    // Update invoice status to 'sent' if it was 'draft'
    if (invoice.status === 'draft') {
      await InvoiceService.updateStatus(req.params.id, 'sent');
    }

    res.json({
      success: true,
      message: `Invoice sent to ${invoice.client_email}`,
    });

  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({
      error: ERRORS.INVOICE.SEND_FAILED,
      details: error.message
    });
  }
});

/**
 * DELETE /api/invoices/:id
 * Delete an invoice
 */
router.delete('/:id', async (req, res) => {
  try {
    const success = await InvoiceService.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: ERRORS.INVOICE.NOT_FOUND });
    }

    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: ERRORS.INVOICE.DELETE_FAILED });
  }
});

module.exports = router;
