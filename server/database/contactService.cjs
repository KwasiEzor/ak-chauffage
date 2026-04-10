const { db } = require('./connection.cjs');

/**
 * Contact Service
 * Handles all database operations for contacts
 */

class ContactService {
  /**
   * Create a new contact
   */
  static async create({ name, email, phone, service, message, ipAddress, userAgent }) {
    const stmt = db.prepare(`
      INSERT INTO contacts (name, email, phone, service, message, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.run(name, email, phone, service, message, ipAddress, userAgent);

    return {
      id: result.lastInsertRowid,
      name,
      email,
      phone,
      service,
      message,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Get all contacts with optional filters
   */
  static async getAll({ status, search, limit = 50, offset = 0 } = {}) {
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params = [];

    // Filter by status
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    // Search by name, email, or phone
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Order by most recent first
    query += ' ORDER BY created_at DESC';

    // Pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const contacts = await stmt.all(...params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM contacts WHERE 1=1';
    const countParams = [];

    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const countStmt = db.prepare(countQuery);
    const { total } = await countStmt.get(...countParams);

    return {
      contacts,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get a single contact by ID
   */
  static async getById(id) {
    const stmt = db.prepare('SELECT * FROM contacts WHERE id = ?');
    return await stmt.get(id);
  }

  /**
   * Update contact status and/or notes
   */
  static async update(id, { status, notes }) {
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return await this.getById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const query = `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    const stmt = db.prepare(query);
    await stmt.run(...params);

    return await this.getById(id);
  }

  /**
   * Delete a contact
   */
  static async delete(id) {
    const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
    const result = await stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Get contact statistics
   */
  static async getStats() {
    const stats = {
      total: 0,
      pending: 0,
      contacted: 0,
      completed: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
    };

    // Total counts by status
    const statusStmt = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM contacts
      GROUP BY status
    `);

    const statusCounts = await statusStmt.all();
    statusCounts.forEach(({ status, count }) => {
      stats[status] = count;
      stats.total += count;
    });

    // Today's contacts
    const todayStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM contacts
      WHERE DATE(created_at) = DATE('now')
    `);
    const todayResult = await todayStmt.get();
    stats.today = todayResult.count;

    // This week's contacts
    const weekStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM contacts
      WHERE created_at >= DATE('now', '-7 days')
    `);
    const weekResult = await weekStmt.get();
    stats.thisWeek = weekResult.count;

    // This month's contacts
    const monthStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM contacts
      WHERE created_at >= DATE('now', 'start of month')
    `);
    const monthResult = await monthStmt.get();
    stats.thisMonth = monthResult.count;

    // Popular services
    const servicesStmt = db.prepare(`
      SELECT service, COUNT(*) as count
      FROM contacts
      GROUP BY service
      ORDER BY count DESC
      LIMIT 5
    `);
    stats.popularServices = await servicesStmt.all();

    return stats;
  }

  /**
   * Export contacts to CSV
   */
  static async exportToCSV() {
    const stmt = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC');
    const contacts = await stmt.all();

    // CSV header
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Service', 'Message', 'Status', 'Notes', 'Created At'];
    const rows = contacts.map(c => [
      c.id,
      c.name,
      c.email,
      c.phone,
      c.service,
      c.message || '',
      c.status,
      c.notes || '',
      c.created_at,
    ]);

    return [headers, ...rows];
  }
}

module.exports = ContactService;
