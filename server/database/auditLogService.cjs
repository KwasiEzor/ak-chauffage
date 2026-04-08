const db = require('./init.cjs');

class AuditLogService {
  /**
   * Create audit log entry
   */
  static log({ adminId, action, entityType, entityId = null, details = null, ipAddress = null, userAgent = null }) {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const detailsJson = typeof details === 'object' ? JSON.stringify(details) : details;

    const result = stmt.run(adminId, action, entityType, entityId, detailsJson, ipAddress, userAgent);

    return result.lastInsertRowid;
  }

  /**
   * Get all audit logs with pagination
   */
  static getAll({ limit = 50, offset = 0 } = {}) {
    const stmt = db.prepare(`
      SELECT
        al.*,
        a.username as admin_username
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const logs = stmt.all(limit, offset);

    // Parse JSON details
    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  }

  /**
   * Get audit logs for specific admin
   */
  static getByAdmin(adminId, { limit = 50, offset = 0 } = {}) {
    const stmt = db.prepare(`
      SELECT * FROM audit_logs
      WHERE admin_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const logs = stmt.all(adminId, limit, offset);

    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  }

  /**
   * Get audit logs by entity
   */
  static getByEntity(entityType, entityId, { limit = 50, offset = 0 } = {}) {
    const stmt = db.prepare(`
      SELECT
        al.*,
        a.username as admin_username
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      WHERE al.entity_type = ? AND al.entity_id = ?
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const logs = stmt.all(entityType, entityId, limit, offset);

    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  }

  /**
   * Get recent activity (last 24 hours)
   */
  static getRecentActivity({ limit = 100 } = {}) {
    const stmt = db.prepare(`
      SELECT
        al.*,
        a.username as admin_username
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      WHERE al.created_at >= datetime('now', '-24 hours')
      ORDER BY al.created_at DESC
      LIMIT ?
    `);

    const logs = stmt.all(limit);

    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  }

  /**
   * Delete old audit logs (cleanup)
   */
  static cleanup(daysToKeep = 90) {
    const stmt = db.prepare(`
      DELETE FROM audit_logs
      WHERE created_at < datetime('now', '-' || ? || ' days')
    `);

    const result = stmt.run(daysToKeep);

    return result.changes;
  }

  /**
   * Get statistics
   */
  static getStats() {
    const total = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get();
    const today = db.prepare(`
      SELECT COUNT(*) as count FROM audit_logs
      WHERE date(created_at) = date('now')
    `).get();
    const thisWeek = db.prepare(`
      SELECT COUNT(*) as count FROM audit_logs
      WHERE created_at >= datetime('now', '-7 days')
    `).get();

    const byAction = db.prepare(`
      SELECT action, COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY action
      ORDER BY count DESC
    `).all();

    return {
      total: total.count,
      today: today.count,
      thisWeek: thisWeek.count,
      byAction
    };
  }
}

module.exports = AuditLogService;
