const { db } = require('./connection.cjs');

/**
 * Invoice Service
 * Handles all database operations for invoices
 */

class InvoiceService {
  /**
   * Generate next invoice number in format AK-YYYY-XXX
   */
  static async generateInvoiceNumber(tx = null) {
    const year = new Date().getFullYear();
    const prefix = `AK-${year}-`;
    const connection = tx || db;

    // Get the last invoice number for this year
    const lastInvoice = await connection
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
  static async create({ invoice, lineItems, createdBy }) {
    const tx = await db.beginTransaction();
    try {
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(tx);

      // Insert invoice
      const insertInvoice = tx.prepare(`
        INSERT INTO invoices (
          invoice_number, status, client_name, client_email, client_phone,
          client_address, issue_date, due_date, paid_date, subtotal,
          tax_rate, tax_amount, total, notes, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const invoiceResult = await insertInvoice.run(
        invoiceNumber,
        invoice.status,
        invoice.client_name,
        invoice.client_email,
        invoice.client_phone || null,
        invoice.client_address || null,
        invoice.issue_date,
        invoice.due_date || null,
        invoice.paid_date || null,
        invoice.subtotal,
        invoice.tax_rate,
        invoice.tax_amount,
        invoice.total,
        invoice.notes || null,
        createdBy
      );

      // Use the transaction-specific result or fetch ID manually if needed
      // Postgres returns res.rows[0].id via the run() wrapper I added
      const invoiceId = invoiceResult.lastInsertRowid;

      if (!invoiceId && db.type === 'sqlite') {
        // Better-sqlite3 .run() returns .lastInsertRowid on the result object directly
      }

      // Insert line items
      const insertLineItem = tx.prepare(`
        INSERT INTO invoice_line_items (
          invoice_id, description, quantity, unit_price, amount, line_order
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (let index = 0; index < lineItems.length; index++) {
        const item = lineItems[index];
        await insertLineItem.run(
          invoiceId,
          item.description,
          item.quantity,
          item.unit_price,
          item.amount,
          index
        );
      }

      await tx.commit();
      return await this.getById(invoiceId);
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  /**
   * Get invoice by ID with line items
   */
  static async getById(id) {
    // Get invoice
    const invoice = await db
      .prepare('SELECT * FROM invoices WHERE id = ?')
      .get(id);

    if (!invoice) {
      return null;
    }

    // Get line items
    const lineItems = await db
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
  static async getAll({ status, search, limit = 50, offset = 0 } = {}) {
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
    const invoices = await stmt.all(...params);

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
    const { total } = await countStmt.get(...countParams);

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
  static async updateStatus(id, status, paidDate = null) {
    const updates = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status];

    if (status === 'paid' && paidDate) {
      updates.push('paid_date = ?');
      params.push(paidDate);
    }

    const query = `UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    const stmt = db.prepare(query);
    await stmt.run(...params);

    return await this.getById(id);
  }

  /**
   * Delete an invoice (cascades to line items)
   */
  static async delete(id) {
    const stmt = db.prepare('DELETE FROM invoices WHERE id = ?');
    const result = await stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Get invoice statistics
   */
  static async getStats() {
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

    const statusCounts = await statusStmt.all();
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
    const totalResult = await totalRevenueStmt.get();
    stats.totalRevenue = totalResult.total || 0;

    return stats;
  }
}

module.exports = InvoiceService;
