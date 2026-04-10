const { db, getDateInterval } = require('./connection.cjs');

class AuditLogService {
  /**
   * Create audit log entry
   */
  static async log({ adminId, action, entityType, entityId = null, details = null, ipAddress = null, userAgent = null }) {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const detailsJson = typeof details === 'object' ? JSON.stringify(details) : details;

    const result = await stmt.run(adminId, action, entityType, entityId, detailsJson, ipAddress, userAgent);

    return result.lastInsertRowid;
  }

  /**
   * Get all audit logs with pagination
   */
  static async getAll({ limit = 50, offset = 0 } = {}) {
    const stmt = db.prepare(`
      SELECT
        al.*,
        a.username as admin_username
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `);

    const logs = await stmt.all(limit, offset);

    // Parse JSON details
    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  }

  /**
   * Get audit logs for specific admin
   */
  static async getByAdmin(adminId, { limit = 50, offset = 0 } = {}) {
    const stmt = db.prepare(`
      SELECT * FROM audit_logs
      WHERE admin_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const logs = await stmt.all(adminId, limit, offset);

    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  }

  /**
   * Get audit logs by entity
   */
  static async getByEntity(entityType, entityId, { limit = 50, offset = 0 } = {}) {
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

    const logs = await stmt.all(entityType, entityId, limit, offset);

    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  }

  /**
   * Get recent activity (last 24 hours)
   */
  static async getRecentActivity({ limit = 100 } = {}) {
    const stmt = db.prepare(`
      SELECT
        al.*,
        a.username as admin_username
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      WHERE al.created_at >= ${getDateInterval(1)}
      ORDER BY al.created_at DESC
      LIMIT ?
    `);

    const logs = await stmt.all(limit);

    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  }

  /**
   * Delete old audit logs (cleanup)
   */
  static async cleanup(daysToKeep = 90) {
    const stmt = db.prepare(`
      DELETE FROM audit_logs
      WHERE created_at < ${getDateInterval(daysToKeep)}
    `);

    const result = await stmt.run();

    return result.changes;
  }

  /**
   * Get statistics
   */
  static async getStats() {
    const total = await db.prepare('SELECT COUNT(*) as count FROM audit_logs').get();
    
    const dateCast = db.type === 'postgres' ? 'created_at::date' : 'DATE(created_at)';
    const today = await db.prepare(`
      SELECT COUNT(*) as count FROM audit_logs
      WHERE ${dateCast} = CURRENT_DATE
    `).get();

    const thisWeek = await db.prepare(`
      SELECT COUNT(*) as count FROM audit_logs
      WHERE created_at >= ${getDateInterval(7)}
    `).get();

    const byAction = await db.prepare(`
      SELECT action, COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= ${getDateInterval(30)}
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
