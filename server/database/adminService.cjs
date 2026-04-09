const { db } = require('./connection.cjs');
const bcrypt = require('bcrypt');

class AdminService {
  /**
   * Get admin by username
   */
  static async getByUsername(username) {
    return await db.prepare('SELECT * FROM admins WHERE username = ? AND is_active = 1').get(username);
  }

  /**
   * Get admin by ID
   */
  static async getById(id) {
    return await db.prepare('SELECT id, username, email, role, is_active, last_login, created_at FROM admins WHERE id = ?').get(id);
  }

  /**
   * Get all admins
   */
  static async getAll() {
    return await db.prepare('SELECT id, username, email, role, is_active, last_login, created_at FROM admins ORDER BY created_at DESC').all();
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

    const result = await stmt.run(username, email, passwordHash, role);

    return await this.getById(result.lastInsertRowid);
  }

  /**
   * Update admin password
   */
  static async updatePassword(id, currentPassword, newPassword) {
    // Get current admin
    const admin = await db.prepare('SELECT password_hash FROM admins WHERE id = ?').get(id);

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

    await stmt.run(newPasswordHash, id);

    return true;
  }

  /**
   * Update admin email
   */
  static async updateEmail(id, email) {
    const stmt = db.prepare(`
      UPDATE admins
      SET email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    await stmt.run(email, id);

    return await this.getById(id);
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id) {
    const stmt = db.prepare(`
      UPDATE admins
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    await stmt.run(id);
  }

  /**
   * Verify admin credentials (for authentication)
   */
  static async verify(username, password) {
    const admin = await this.getByUsername(username);

    if (!admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return null;
    }

    // Update last login
    await this.updateLastLogin(admin.id);

    // Return admin without password hash
    const { password_hash, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  /**
   * Deactivate admin (soft delete)
   */
  static async deactivate(id) {
    const stmt = db.prepare(`
      UPDATE admins
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    await stmt.run(id);

    return true;
  }

  /**
   * Reactivate admin
   */
  static async reactivate(id) {
    const stmt = db.prepare(`
      UPDATE admins
      SET is_active = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    await stmt.run(id);

    return true;
  }
}

module.exports = AdminService;
