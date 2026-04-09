const { db, DB_TYPE } = require('../connection.cjs');

/**
 * Migration: Add invoice tables
 * Creates tables for managing invoices and line items
 */
function addInvoiceTables() {
  try {
    // Skip for PostgreSQL (handled by migrate-to-postgres.cjs)
    if (DB_TYPE === 'postgres') {
      console.log('✅ invoices table already exists');
      console.log('✅ invoice_line_items table already exists');
      return;
    }

    // Check if invoices table already exists (SQLite only)
    const invoicesTableExists = db.sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='invoices'")
      .get();

    if (invoicesTableExists) {
      console.log('✅ invoices table already exists');
    } else {
      // Create invoices table
      db.exec(`
        CREATE TABLE invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_number TEXT UNIQUE NOT NULL,
          status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'paid', 'cancelled')),
          client_name TEXT NOT NULL,
          client_email TEXT NOT NULL,
          client_phone TEXT,
          client_address TEXT,
          issue_date DATE NOT NULL,
          due_date DATE,
          paid_date DATE,
          subtotal DECIMAL(10, 2) NOT NULL,
          tax_rate DECIMAL(5, 2) DEFAULT 21.00,
          tax_amount DECIMAL(10, 2),
          total DECIMAL(10, 2) NOT NULL,
          notes TEXT,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES admins(id)
        )
      `);

      // Create indexes for invoices
      db.exec(`
        CREATE INDEX idx_invoices_number ON invoices(invoice_number);
        CREATE INDEX idx_invoices_status ON invoices(status);
        CREATE INDEX idx_invoices_date ON invoices(issue_date DESC);
      `);

      console.log('✅ Created invoices table with indexes');
    }

    // Check if invoice_line_items table already exists (SQLite only)
    const lineItemsTableExists = db.sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='invoice_line_items'")
      .get();

    if (lineItemsTableExists) {
      console.log('✅ invoice_line_items table already exists');
    } else {
      // Create invoice_line_items table
      db.exec(`
        CREATE TABLE invoice_line_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_id INTEGER NOT NULL,
          description TEXT NOT NULL,
          quantity DECIMAL(10, 2) NOT NULL,
          unit_price DECIMAL(10, 2) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          line_order INTEGER DEFAULT 0,
          FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        )
      `);

      // Create index for line items
      db.exec(`
        CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);
      `);

      console.log('✅ Created invoice_line_items table with indexes');
    }
  } catch (error) {
    console.error('❌ Failed to create invoice tables:', error.message);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  addInvoiceTables();
}

module.exports = addInvoiceTables;
