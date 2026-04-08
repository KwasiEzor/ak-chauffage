const db = require('./init.cjs');
const bcrypt = require('bcrypt');

class AdminService {
  /**
   * Get admin by username
   */
  static getByUsername(username) {
    return db.prepare('SELECT * FROM admins WHERE username = ? AND active = 1').get(username);
  }

  /**
   * Get admin by ID
   */
  static getById(id) {
    return db.prepare('SELECT id, username, email, role, active, last_login, created_at FROM admins WHERE id = ?').get(id);
  }

  /**
   * Get all admins
   */
  static getAll() {
    return db.prepare('SELECT id, username, email, role, active, last_login, created_at FROM admins ORDER BY created_at DESC').all();
  }

  /**
   * Create new admin
   */
  static async create({ username, email, password, role = 'admin' }) {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const stmt = db.prepare(`
      INSERT INTO admins (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(username, email, passwordHash, role);

    return this.getById(result.lastInsertRowid);
  }

  /**
   * Update admin password
   */
  static async updatePassword(id, currentPassword, newPassword) {
    // Get current admin
    const admin = db.prepare('SELECT password_hash FROM admins WHERE id = ?').get(id);

    if (!admin) {
      throw new Error('Admin not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    const stmt = db.prepare(`
      UPDATE admins
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(newPasswordHash, id);

    return true;
  }

  /**
   * Update admin email
   */
  static updateEmail(id, email) {
    const stmt = db.prepare(`
      UPDATE admins
      SET email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(email, id);

    return this.getById(id);
  }

  /**
   * Update last login timestamp
   */
  static updateLastLogin(id) {
    const stmt = db.prepare(`
      UPDATE admins
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(id);
  }

  /**
   * Verify admin credentials (for authentication)
   */
  static async verify(username, password) {
    const admin = this.getByUsername(username);

    if (!admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return null;
    }

    // Update last login
    this.updateLastLogin(admin.id);

    // Return admin without password hash
    const { password_hash, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  /**
   * Deactivate admin (soft delete)
   */
  static deactivate(id) {
    const stmt = db.prepare(`
      UPDATE admins
      SET active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(id);

    return true;
  }

  /**
   * Reactivate admin
   */
  static reactivate(id) {
    const stmt = db.prepare(`
      UPDATE admins
      SET active = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(id);

    return true;
  }
}

module.exports = AdminService;
