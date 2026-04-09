const { db, DB_TYPE } = require('../connection.cjs');

/**
 * Migration: Fix column names to match SQLite schema
 * Renames PostgreSQL columns to match the SQLite naming convention
 */
async function fixColumnNames() {
  try {
    // Skip for SQLite (columns are already correct)
    if (DB_TYPE === 'sqlite') {
      console.log('✅ SQLite uses correct column names, skipping');
      return;
    }

    console.log('🔧 Fixing PostgreSQL column names to match SQLite...');

    // Check if columns need renaming (avoid re-running migration)
    const checkQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'audit_logs'
      AND column_name IN ('resource_type', 'resource_id', 'entity_type', 'entity_id')
    `;

    const columns = await db.prepare(checkQuery).all();
    const columnNames = columns.map(c => c.column_name);

    // Rename audit_logs columns if needed
    if (columnNames.includes('resource_type')) {
      await db.exec('ALTER TABLE audit_logs RENAME COLUMN resource_type TO entity_type');
      console.log('✅ Renamed resource_type → entity_type');
    }

    if (columnNames.includes('resource_id')) {
      await db.exec('ALTER TABLE audit_logs RENAME COLUMN resource_id TO entity_id');
      console.log('✅ Renamed resource_id → entity_id');
    }

    // Check admins table
    const checkAdmins = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'admins'
      AND column_name IN ('is_active', 'active')
    `;

    const adminColumns = await db.prepare(checkAdmins).all();
    const adminColumnNames = adminColumns.map(c => c.column_name);

    // Rename admins.is_active to active if needed
    if (adminColumnNames.includes('is_active')) {
      await db.exec('ALTER TABLE admins RENAME COLUMN is_active TO active');
      console.log('✅ Renamed is_active → active');
    }

    console.log('🎉 Column name fixes completed!');
  } catch (error) {
    console.error('❌ Failed to fix column names:', error.message);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  fixColumnNames()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = fixColumnNames;
