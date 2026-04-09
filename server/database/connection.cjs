/**
 * Database Connection Abstraction Layer
 * Supports both SQLite (development) and PostgreSQL (production)
 */

const path = require('path');

// Determine database type from environment
const DB_TYPE = process.env.DATABASE_URL ? 'postgres' : 'sqlite';

let db;

if (DB_TYPE === 'postgres') {
  // PostgreSQL connection
  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased for Render free tier
    statement_timeout: 30000, // 30 second query timeout
    query_timeout: 30000,
  });

  // Test connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ PostgreSQL connection failed:', err.message);
      process.exit(1);
    } else {
      console.log('✅ PostgreSQL connected successfully');
    }
  });

  // PostgreSQL wrapper to match SQLite API
  db = {
    type: 'postgres',
    pool,

    prepare(sql) {
      // Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
      let paramCount = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++paramCount}`);

      return {
        get(...args) {
          const params = Array.isArray(args[0]) ? args[0] : args;
          return pool.query(pgSql, params).then(res => res.rows[0] || null);
        },
        all(...args) {
          const params = Array.isArray(args[0]) ? args[0] : args;
          return pool.query(pgSql, params).then(res => res.rows);
        },
        run(...args) {
          const params = Array.isArray(args[0]) ? args[0] : args;
          return pool.query(pgSql, params).then(res => ({
            changes: res.rowCount,
            lastInsertRowid: res.rows[0]?.id || null
          }));
        }
      };
    },

    exec(sql) {
      return pool.query(sql);
    },

    close() {
      return pool.end();
    }
  };

} else {
  // SQLite connection (development)
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, '../../data/contacts.db');

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  console.log('✅ SQLite connected:', dbPath);

  db = {
    type: 'sqlite',
    sqlite,

    prepare(sql) {
      const stmt = sqlite.prepare(sql);
      return {
        get: stmt.get.bind(stmt),
        all: stmt.all.bind(stmt),
        run: stmt.run.bind(stmt)
      };
    },

    exec(sql) {
      return sqlite.exec(sql);
    },

    close() {
      return sqlite.close();
    }
  };
}

/**
 * Helper to get database type-specific SQL
 */
function getSQL(sqliteQuery, postgresQuery) {
  return DB_TYPE === 'postgres' ? postgresQuery : sqliteQuery;
}

/**
 * Helper to get current timestamp
 */
function getCurrentTimestamp() {
  return DB_TYPE === 'postgres' ? 'CURRENT_TIMESTAMP' : "datetime('now')";
}

/**
 * Helper for auto-increment ID
 */
function getAutoIncrement() {
  return DB_TYPE === 'postgres' ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
}

module.exports = {
  db,
  DB_TYPE,
  getSQL,
  getCurrentTimestamp,
  getAutoIncrement
};
