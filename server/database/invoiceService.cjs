const { db } = require('./connection.cjs');

/**
 * Invoice Service
 * Handles all database operations for invoices
 */

class InvoiceService {
  /**
   * Generate next invoice number in format AK-YYYY-XXX
   */
  static generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const prefix = `AK-${year}-`;

    // Get the last invoice number for this year
    const lastInvoice = db
      .prepare(`
        SELECT invoice_number
        FROM invoices
        WHERE invoice_number LIKE ?
        ORDER BY invoice_number DESC
        LIMIT 1
      `)
      .get(`${prefix}%`);

    if (!lastInvoice) {
      return `${prefix}001`;
    }

    // Extract the sequence number and increment
    const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0');

    return `${prefix}${nextNumber}`;
  }

  /**
   * Create a new invoice with line items (transaction-based)
   */
  static create({ invoice, lineItems, createdBy }) {
    const createTransaction = db.transaction((invoiceData, items, adminId) => {
      // Generate invoice number
      const invoiceNumber = this.generateInvoiceNumber();

      // Insert invoice
      const insertInvoice = db.prepare(`
        INSERT INTO invoices (
          invoice_number, status, client_name, client_email, client_phone,
          client_address, issue_date, due_date, paid_date, subtotal,
          tax_rate, tax_amount, total, notes, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const invoiceResult = insertInvoice.run(
        invoiceNumber,
        invoiceData.status,
        invoiceData.client_name,
        invoiceData.client_email,
        invoiceData.client_phone || null,
        invoiceData.client_address || null,
        invoiceData.issue_date,
        invoiceData.due_date || null,
        invoiceData.paid_date || null,
        invoiceData.subtotal,
        invoiceData.tax_rate,
        invoiceData.tax_amount,
        invoiceData.total,
        invoiceData.notes || null,
        adminId
      );

      const invoiceId = invoiceResult.lastInsertRowid;

      // Insert line items
      const insertLineItem = db.prepare(`
        INSERT INTO invoice_line_items (
          invoice_id, description, quantity, unit_price, amount, line_order
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      items.forEach((item, index) => {
        insertLineItem.run(
          invoiceId,
          item.description,
          item.quantity,
          item.unit_price,
          item.amount,
          index
        );
      });

      return invoiceId;
    });

    const invoiceId = createTransaction(invoice, lineItems, createdBy);
    return this.getById(invoiceId);
  }

  /**
   * Get invoice by ID with line items
   */
  static getById(id) {
    // Get invoice
    const invoice = db
      .prepare('SELECT * FROM invoices WHERE id = ?')
      .get(id);

    if (!invoice) {
      return null;
    }

    // Get line items
    const lineItems = db
      .prepare('SELECT * FROM invoice_line_items WHERE invoice_id = ? ORDER BY line_order')
      .all(id);

    return {
      ...invoice,
      line_items: lineItems,
    };
  }

  /**
   * Get all invoices with optional filters
   */
  static getAll({ status, search, limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM invoices WHERE 1=1';
    const params = [];

    // Filter by status
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    // Search by invoice number, client name, or email
    if (search) {
      query += ' AND (invoice_number LIKE ? OR client_name LIKE ? OR client_email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Order by most recent first
    query += ' ORDER BY issue_date DESC, created_at DESC';

    // Pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const invoices = stmt.all(...params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM invoices WHERE 1=1';
    const countParams = [];

    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (search) {
      countQuery += ' AND (invoice_number LIKE ? OR client_name LIKE ? OR client_email LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    const countStmt = db.prepare(countQuery);
    const { total } = countStmt.get(...countParams);

    return {
      invoices,
      total,
      limit,
      offset,
    };
  }

  /**
   * Update invoice status
   */
  static updateStatus(id, status, paidDate = null) {
    const updates = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status];

    if (status === 'paid' && paidDate) {
      updates.push('paid_date = ?');
      params.push(paidDate);
    }

    const query = `UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    const stmt = db.prepare(query);
    stmt.run(...params);

    return this.getById(id);
  }

  /**
   * Delete an invoice (cascades to line items)
   */
  static delete(id) {
    const stmt = db.prepare('DELETE FROM invoices WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Get invoice statistics
   */
  static getStats() {
    const stats = {
      total: 0,
      draft: 0,
      sent: 0,
      paid: 0,
      cancelled: 0,
      totalRevenue: 0,
      paidRevenue: 0,
      pendingRevenue: 0,
    };

    // Count by status
    const statusStmt = db.prepare(`
      SELECT status, COUNT(*) as count, SUM(total) as revenue
      FROM invoices
      GROUP BY status
    `);

    const statusCounts = statusStmt.all();
    statusCounts.forEach(({ status, count, revenue }) => {
      stats[status] = count;
      stats.total += count;

      if (status === 'paid') {
        stats.paidRevenue = revenue || 0;
      } else if (status === 'sent') {
        stats.pendingRevenue += revenue || 0;
      }
    });

    // Total revenue (all invoices except cancelled)
    const totalRevenueStmt = db.prepare(`
      SELECT SUM(total) as total
      FROM invoices
      WHERE status != 'cancelled'
    `);
    stats.totalRevenue = totalRevenueStmt.get().total || 0;

    return stats;
  }
}

module.exports = InvoiceService;
