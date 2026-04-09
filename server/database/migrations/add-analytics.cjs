const { db, DB_TYPE } = require('../connection.cjs');

/**
 * Migration: Add visitor analytics table
 * Creates a table for tracking page views and visitor behavior
 */
function addAnalyticsTable() {
  try {
    // Skip for PostgreSQL (handled by migrate-to-postgres.cjs)
    if (DB_TYPE === 'postgres') {
      console.log('✅ visitor_analytics table already exists');
      return;
    }

    // Check if table already exists (SQLite only)
    const tableExists = db.sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='visitor_analytics'")
      .get();

    if (tableExists) {
      console.log('✅ visitor_analytics table already exists');
      return;
    }

    // Create visitor_analytics table
    db.exec(`
      CREATE TABLE visitor_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        page_path TEXT NOT NULL,
        referrer TEXT,
        ip_address TEXT,
        user_agent TEXT,
        device_type TEXT CHECK(device_type IN ('desktop', 'mobile', 'tablet')),
        country TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    db.exec(`
      CREATE INDEX idx_analytics_created_at ON visitor_analytics(created_at DESC);
      CREATE INDEX idx_analytics_page_path ON visitor_analytics(page_path);
      CREATE INDEX idx_analytics_session ON visitor_analytics(session_id);
    `);

    console.log('✅ Created visitor_analytics table with indexes');
  } catch (error) {
    console.error('❌ Failed to create visitor_analytics table:', error.message);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  addAnalyticsTable();
}

module.exports = addAnalyticsTable;
