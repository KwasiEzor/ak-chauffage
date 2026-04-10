const { db } = require('./connection.cjs');
const crypto = require('crypto');

// Encryption key from environment (must be 32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY ||
  crypto.createHash('sha256').update(process.env.JWT_SECRET || 'default-key').digest();

class SystemSettingsService {
  /**
   * Encrypt sensitive data
   */
  static encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Get setting by key
   */
  static async get(key) {
    const setting = await db.prepare('SELECT * FROM system_settings WHERE key = ?').get(key);

    if (!setting) {
      return null;
    }

    // Decrypt if encrypted
    if (setting.encrypted && setting.value) {
      try {
        setting.value = this.decrypt(setting.value);
      } catch (error) {
        console.error('Failed to decrypt setting:', key, error);
        return null;
      }
    }

    return setting;
  }

  /**
   * Get multiple settings by category
   */
  static async getByCategory(category) {
    const settings = await db.prepare('SELECT * FROM system_settings WHERE category = ?').all(category);

    // Decrypt encrypted settings
    return settings.map(setting => {
      if (setting.encrypted && setting.value) {
        try {
          setting.value = this.decrypt(setting.value);
        } catch (error) {
          console.error('Failed to decrypt setting:', setting.key, error);
        }
      }
      return setting;
    });
  }

  /**
   * Get all settings
   */
  static async getAll() {
    const settings = await db.prepare('SELECT * FROM system_settings').all();

    // Decrypt encrypted settings
    return settings.map(setting => {
      if (setting.encrypted && setting.value) {
        try {
          setting.value = this.decrypt(setting.value);
        } catch (error) {
          console.error('Failed to decrypt setting:', setting.key, error);
        }
      }
      return setting;
    });
  }

  /**
   * Set or update a setting
   */
  static async set(key, value, { encrypted = false, category = 'general', description = '', updatedBy = null } = {}) {
    // Encrypt if needed
    const finalValue = encrypted ? this.encrypt(value) : value;

    const stmt = db.prepare(`
      INSERT INTO system_settings (key, value, encrypted, category, description, updated_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        encrypted = excluded.encrypted,
        category = excluded.category,
        description = excluded.description,
        updated_by = excluded.updated_by,
        updated_at = CURRENT_TIMESTAMP
    `);

    await stmt.run(key, finalValue, encrypted ? 1 : 0, category, description, updatedBy);

    return await this.get(key);
  }

  /**
   * Delete a setting
   */
  static async delete(key) {
    const stmt = db.prepare('DELETE FROM system_settings WHERE key = ?');
    const result = await stmt.run(key);
    return result.changes > 0;
  }

  /**
   * Get SMTP configuration
   * Falls back to .env if not set in database
   */
  static async getSMTPConfig() {
    const host = await this.get('smtp_host');
    const port = await this.get('smtp_port');
    const user = await this.get('smtp_user');
    const pass = await this.get('smtp_pass');
    const from = await this.get('smtp_from');

    // If all settings exist in DB, use them
    if (host && port && user && pass) {
      return {
        host: host.value,
        port: parseInt(port.value),
        user: user.value,
        pass: pass.value,
        from: from?.value || user.value,
        source: 'database'
      };
    }

    // Fallback to .env
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 465,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      source: 'environment'
    };
  }

  /**
   * Update SMTP configuration
   */
  static async updateSMTPConfig({ host, port, user, pass, from }, updatedBy) {
    await this.set('smtp_host', host, { category: 'smtp', description: 'SMTP server host', updatedBy });
    await this.set('smtp_port', port.toString(), { category: 'smtp', description: 'SMTP server port', updatedBy });
    await this.set('smtp_user', user, { category: 'smtp', description: 'SMTP username', updatedBy });
    await this.set('smtp_pass', pass, { encrypted: true, category: 'smtp', description: 'SMTP password', updatedBy });
    await this.set('smtp_from', from, { category: 'smtp', description: 'Email from address', updatedBy });

    return await this.getSMTPConfig();
  }
}

module.exports = SystemSettingsService;
