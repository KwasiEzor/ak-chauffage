require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const db = require('../init.cjs');

/**
 * Migrate admin credentials from .env to database
 * This runs once to create the initial admin user
 */
function migrateEnvAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!username || !passwordHash) {
    console.log('⚠️  No admin credentials in .env, skipping migration');
    return;
  }

  try {
    // Check if admin already exists
    const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);

    if (existing) {
      console.log('✅ Admin user already exists in database');
      return;
    }

    // Insert admin from .env
    const stmt = db.prepare(`
      INSERT INTO admins (username, password_hash, role, email)
      VALUES (?, ?, 'super_admin', ?)
    `);

    const result = stmt.run(username, passwordHash, 'admin@ak-chauffage.be');

    console.log('✅ Migrated admin from .env to database:', username);
    console.log('   Admin ID:', result.lastInsertRowid);
    console.log('   You can now manage admin users via the dashboard');
    console.log('   The .env credentials will remain as fallback');
  } catch (error) {
    console.error('❌ Failed to migrate admin:', error.message);
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrateEnvAdmin();
}

module.exports = migrateEnvAdmin;
