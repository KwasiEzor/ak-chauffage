const express = require('express');
const InvoiceService = require('../database/invoiceService.cjs');
const authMiddleware = require('../middleware/auth.cjs');
const { sendInvoiceEmail } = require('../utils/mailer.cjs');
const { generateInvoicePDF } = require('../utils/invoicePdfGenerator.cjs');

const router = express.Router();

// All routes are protected with auth middleware
router.use(authMiddleware);

/**
 * GET /api/invoices
 * Get all invoices (with filters and pagination)
 */
router.get('/', (req, res) => {
  try {
    const { status, search, limit, offset } = req.query;

    const result = InvoiceService.getAll({
      status,
      search,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

/**
 * GET /api/invoices/stats
 * Get invoice statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = InvoiceService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * GET /api/invoices/:id
 * Get a single invoice with line items
 */
router.get('/:id', (req, res) => {
  try {
    const invoice = InvoiceService.getById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

/**
 * POST /api/invoices
 * Create a new invoice
 */
router.post('/', (req, res) => {
  try {
    const { invoice, lineItems } = req.body;

    // Validation
    if (!invoice || !lineItems || lineItems.length === 0) {
      return res.status(400).json({ error: 'Invoice and line items are required' });
    }

    if (!invoice.client_name || !invoice.client_email || !invoice.issue_date) {
      return res.status(400).json({ error: 'Client name, email, and issue date are required' });
    }

    // Create invoice with current admin user
    const createdInvoice = InvoiceService.create({
      invoice,
      lineItems,
      createdBy: req.user.id, // From auth middleware
    });

    res.status(201).json(createdInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

/**
 * PATCH /api/invoices/:id/status
 * Update invoice status
 */
router.patch('/:id/status', (req, res) => {
  try {
    const { status, paidDate } = req.body;

    // Validate status
    const validStatuses = ['draft', 'sent', 'paid', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const invoice = InvoiceService.updateStatus(req.params.id, status, paidDate);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

/**
 * POST /api/invoices/:id/send
 * Send invoice via email
 */
router.post('/:id/send', async (req, res) => {
  try {
    // Get invoice with line items
    const invoice = InvoiceService.getById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Validate client email
    if (!invoice.client_email) {
      return res.status(400).json({ error: 'Invoice has no client email address' });
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
      InvoiceService.updateStatus(req.params.id, 'sent');
    }

    res.json({
      success: true,
      message: `Invoice sent to ${invoice.client_email}`,
    });

  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({
      error: 'Failed to send invoice',
      details: error.message
    });
  }
});

/**
 * DELETE /api/invoices/:id
 * Delete an invoice
 */
router.delete('/:id', (req, res) => {
  try {
    const success = InvoiceService.delete(req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

module.exports = router;
