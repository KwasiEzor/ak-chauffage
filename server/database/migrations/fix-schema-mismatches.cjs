const { db, DB_TYPE } = require('../connection.cjs');

/**
 * Migration: Fix schema mismatches between SQLite and PostgreSQL
 * Fixes column names and missing columns in existing PostgreSQL databases
 */
async function fixSchemaMismatches() {
  try {
    // Skip for SQLite (schema is already correct)
    if (DB_TYPE === 'sqlite') {
      console.log('✅ SQLite schema is correct, skipping');
      return;
    }

    console.log('🔧 Fixing PostgreSQL schema mismatches...');

    // Fix contacts table
    try {
      // Check if subject column exists (wrong name)
      const contactsCheck = await db.prepare(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'contacts'
        AND column_name IN ('subject', 'service', 'ip_address', 'user_agent')
      `).all();

      const contactColumns = contactsCheck.map(c => c.column_name);

      if (contactColumns.includes('subject') && !contactColumns.includes('service')) {
        await db.exec('ALTER TABLE contacts RENAME COLUMN subject TO service');
        console.log('✅ Renamed contacts.subject → service');
      }

      if (!contactColumns.includes('ip_address')) {
        await db.exec('ALTER TABLE contacts ADD COLUMN ip_address VARCHAR(45)');
        console.log('✅ Added contacts.ip_address column');
      }

      if (!contactColumns.includes('user_agent')) {
        await db.exec('ALTER TABLE contacts ADD COLUMN user_agent TEXT');
        console.log('✅ Added contacts.user_agent column');
      }

      // Fix default status value
      await db.exec(`ALTER TABLE contacts ALTER COLUMN status SET DEFAULT 'pending'`);
      console.log('✅ Updated contacts.status default to pending');
    } catch (error) {
      console.log('⚠️  Contacts table fixes:', error.message);
    }

    // Fix invoices table
    try {
      const invoicesCheck = await db.prepare(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'invoices'
        AND column_name IN ('paid_at', 'paid_date', 'sent_at', 'created_by')
      `).all();

      const invoiceColumns = invoicesCheck.map(c => c.column_name);

      if (invoiceColumns.includes('paid_at') && !invoiceColumns.includes('paid_date')) {
        await db.exec('ALTER TABLE invoices RENAME COLUMN paid_at TO paid_date');
        console.log('✅ Renamed invoices.paid_at → paid_date');
      }

      if (invoiceColumns.includes('sent_at')) {
        await db.exec('ALTER TABLE invoices DROP COLUMN sent_at');
        console.log('✅ Removed invoices.sent_at column');
      }

      if (!invoiceColumns.includes('created_by')) {
        await db.exec('ALTER TABLE invoices ADD COLUMN created_by INTEGER REFERENCES admins(id)');
        console.log('✅ Added invoices.created_by column');
      }
    } catch (error) {
      console.log('⚠️  Invoices table fixes:', error.message);
    }

    // Fix invoice_items → invoice_line_items table rename
    try {
      const tablesCheck = await db.prepare(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('invoice_items', 'invoice_line_items')
      `).all();

      const tableNames = tablesCheck.map(t => t.table_name);

      if (tableNames.includes('invoice_items') && !tableNames.includes('invoice_line_items')) {
        await db.exec('ALTER TABLE invoice_items RENAME TO invoice_line_items');
        console.log('✅ Renamed table invoice_items → invoice_line_items');

        // Rename index too
        await db.exec('ALTER INDEX idx_invoice_items_invoice_id RENAME TO idx_line_items_invoice');
        console.log('✅ Renamed index');
      }

      // Add line_order column if missing
      const lineItemsCheck = await db.prepare(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'invoice_line_items'
        AND column_name = 'line_order'
      `).all();

      if (lineItemsCheck.length === 0) {
        await db.exec('ALTER TABLE invoice_line_items ADD COLUMN line_order INTEGER DEFAULT 0');
        console.log('✅ Added invoice_line_items.line_order column');
      }
    } catch (error) {
      console.log('⚠️  Invoice line items table fixes:', error.message);
    }

    console.log('🎉 Schema mismatch fixes completed!');
  } catch (error) {
    console.error('❌ Failed to fix schema mismatches:', error.message);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  fixSchemaMismatches()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = fixSchemaMismatches;
