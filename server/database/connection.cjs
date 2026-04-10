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
    max: 10, // Reduced from 20 to be safer on free tiers
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 60000, // Increased to 60s for slow wakeups
    statement_timeout: 60000, // 60s
    query_timeout: 60000,
  });

  // Test connection (non-blocking, don't exit here to allow retries during migrations)
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('⚠️ PostgreSQL connection test warning:', err.message);
      console.log('   The server will still attempt to run migrations...');
    } else {
      console.log('✅ PostgreSQL connected successfully');
    }
  });

  const convertPlaceholders = (sql) => {
    let paramCount = 0;
    return sql.replace(/\?/g, () => `$${++paramCount}`);
  };

  const getRunSql = (sql) => {
    const trimmedSql = sql.trim();
    if (!/^insert\s+/i.test(trimmedSql) || /\breturning\b/i.test(trimmedSql)) {
      return trimmedSql;
    }

    return `${trimmedSql} RETURNING id`;
  };

  // PostgreSQL wrapper to match SQLite API
  db = {
    type: 'postgres',
    pool,

    prepare(sql) {
      const pgSql = convertPlaceholders(sql);
      const pgRunSql = getRunSql(pgSql);

      const queryObj = {
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
          return pool.query(pgRunSql, params).then(res => ({
            changes: res.rowCount,
            lastInsertRowid: res.rows[0]?.id || null
          }));
        }
      };

      // Support both db.prepare(sql).all() and db.prepare(sql)(params).all()
      const fn = (...args) => queryObj;
      Object.assign(fn, queryObj);
      return fn;
    },

    exec(sql) {
      return pool.query(sql);
    },

    async beginTransaction() {
      const client = await pool.connect();
      await client.query('BEGIN');
      return {
        prepare(sql) {
          const pgSql = convertPlaceholders(sql);
          const pgRunSql = getRunSql(pgSql);
          return {
            get(...args) {
              const params = Array.isArray(args[0]) ? args[0] : args;
              return client.query(pgSql, params).then(res => res.rows[0] || null);
            },
            all(...args) {
              const params = Array.isArray(args[0]) ? args[0] : args;
              return client.query(pgSql, params).then(res => res.rows);
            },
            run(...args) {
              const params = Array.isArray(args[0]) ? args[0] : args;
              return client.query(pgRunSql, params).then(res => ({
                changes: res.rowCount,
                lastInsertRowid: res.rows[0]?.id || null
              }));
            }
          };
        },
        async commit() {
          await client.query('COMMIT');
          client.release();
        },
        async rollback() {
          await client.query('ROLLBACK');
          client.release();
        }
      };
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
        get: async (...args) => {
          const params = Array.isArray(args[0]) ? args[0] : args;
          return stmt.get(...params);
        },
        all: async (...args) => {
          const params = Array.isArray(args[0]) ? args[0] : args;
          return stmt.all(...params);
        },
        run: async (...args) => {
          const params = Array.isArray(args[0]) ? args[0] : args;
          return stmt.run(...params);
        }
      };
    },

    exec(sql) {
      return sqlite.exec(sql);
    },

    async beginTransaction() {
      sqlite.prepare('BEGIN').run();
      return {
        prepare(sql) {
          const stmt = sqlite.prepare(sql);
          return {
            get: async (...args) => {
              const params = Array.isArray(args[0]) ? args[0] : args;
              return stmt.get(...params);
            },
            all: async (...args) => {
              const params = Array.isArray(args[0]) ? args[0] : args;
              return stmt.all(...params);
            },
            run: async (...args) => {
              const params = Array.isArray(args[0]) ? args[0] : args;
              return stmt.run(...params);
            }
          };
        },
        async commit() {
          sqlite.prepare('COMMIT').run();
        },
        async rollback() {
          sqlite.prepare('ROLLBACK').run();
        }
      };
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
 * Helper for date interval
 */
function getDateInterval(days) {
  const safeDays = Number(days);
  if (isNaN(safeDays)) {
    throw new Error('Invalid days parameter for getDateInterval');
  }
  return DB_TYPE === 'postgres' 
    ? `CURRENT_TIMESTAMP - INTERVAL '${safeDays} days'` 
    : `datetime('now', '-${safeDays} days')`;
}

/**
 * Helper for month truncation
 */
function getDateTruncMonth() {
  return DB_TYPE === 'postgres' 
    ? "DATE_TRUNC('month', CURRENT_DATE)" 
    : "date('now', 'start of month')";
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
  getDateInterval,
  getDateTruncMonth,
  getAutoIncrement
};
