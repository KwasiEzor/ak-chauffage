/**
 * PostgreSQL Migration Script
 * Creates all tables in PostgreSQL database
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

async function migrate() {
  console.log('🚀 Starting PostgreSQL migration...\n');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected\n');

    // Create admins table
    console.log('📦 Creating admins table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ admins table created\n');

    // Create system_settings table
    console.log('📦 Creating system_settings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ system_settings table created\n');

    // Create audit_logs table
    console.log('📦 Creating audit_logs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admins(id),
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(100),
        entity_id TEXT,
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_logs(admin_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at)');
    console.log('✅ audit_logs table created\n');

    // Create contacts table
    console.log('📦 Creating contacts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at DESC)');
    console.log('✅ contacts table created\n');

    // Create invoices table
    console.log('📦 Creating invoices table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50),
        client_address TEXT,
        issue_date DATE NOT NULL,
        due_date DATE,
        subtotal DECIMAL(10, 2) NOT NULL,
        tax_rate DECIMAL(5, 2) DEFAULT 21.00,
        tax_amount DECIMAL(10, 2) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        notes TEXT,
        paid_at TIMESTAMP,
        sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_invoices_client_email ON invoices(client_email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC)');
    console.log('✅ invoices table created\n');

    // Create invoice_items table
    console.log('📦 Creating invoice_items table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id)');
    console.log('✅ invoice_items table created\n');

    // Create visitor_analytics table
    console.log('📦 Creating visitor_analytics table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitor_analytics (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        page_path VARCHAR(500) NOT NULL,
        referrer VARCHAR(1000),
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_type VARCHAR(50),
        country VARCHAR(2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_analytics_created ON visitor_analytics(created_at DESC)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_analytics_page ON visitor_analytics(page_path)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_analytics_session ON visitor_analytics(session_id)');
    console.log('✅ visitor_analytics table created\n');

    console.log('🎉 Migration completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Set DATABASE_URL in your Railway environment variables');
    console.log('   2. Create an admin user using the admin service');
    console.log('   3. Deploy your application\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if executed directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;
