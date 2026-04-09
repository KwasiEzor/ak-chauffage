/**
 * Test script to create and send a test invoice via email
 * Usage: node test-invoice-email.cjs
 */

require('dotenv').config({ path: './server/.env' });

const API_URL = 'http://localhost:3001/api';
const TEST_EMAIL = 'test-client@example.com'; // This will be caught by Mailpit

async function getAuthToken() {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

async function createTestInvoice(token) {
  const testInvoice = {
    invoice: {
      status: 'draft',
      client_name: 'Test Client',
      client_email: TEST_EMAIL,
      client_phone: '+32 488 12 34 56',
      client_address: 'Rue de Test 123, 6000 Charleroi',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      subtotal: 500.00,
      tax_rate: 21,
      tax_amount: 105.00,
      total: 605.00,
      notes: 'Ceci est une facture de test envoyée via Mailpit. Merci de vérifier la réception et la mise en forme.',
    },
    lineItems: [
      {
        description: 'Installation chaudière à condensation',
        quantity: 1,
        unit_price: 300.00,
        amount: 300.00,
      },
      {
        description: 'Entretien annuel (2 visites)',
        quantity: 2,
        unit_price: 100.00,
        amount: 200.00,
      },
    ],
  };

  try {
    const response = await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInvoice),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create invoice');
    }

    const data = await response.json();
    console.log('✅ Test invoice created:', data.invoice_number);
    return data;
  } catch (error) {
    console.error('❌ Failed to create invoice:', error.message);
    throw error;
  }
}

async function sendInvoice(token, invoiceId) {
  try {
    const response = await fetch(`${API_URL}/invoices/${invoiceId}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send invoice');
    }

    const data = await response.json();
    console.log('✅ Invoice sent successfully:', data.message);
    return data;
  } catch (error) {
    console.error('❌ Failed to send invoice:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🧪 Testing Invoice Email Feature\n');

  try {
    // Step 1: Login
    console.log('1️⃣  Logging in as admin...');
    const token = await getAuthToken();
    console.log('✅ Login successful\n');

    // Step 2: Create test invoice
    console.log('2️⃣  Creating test invoice...');
    const invoice = await createTestInvoice(token);
    console.log(`✅ Invoice created: ${invoice.invoice_number}\n`);

    // Step 3: Send invoice via email
    console.log('3️⃣  Sending invoice via email...');
    await sendInvoice(token, invoice.id);
    console.log('✅ Invoice sent!\n');

    console.log('📬 Check your Mailpit inbox at: http://localhost:8025');
    console.log(`📧 Email sent to: ${TEST_EMAIL}`);
    console.log(`📄 Invoice number: ${invoice.invoice_number}`);
    console.log(`💰 Total amount: €${invoice.total.toFixed(2)}\n`);

    console.log('✨ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
(async () => {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log('❌ Server is not running on port 3001');
    console.log('Please start the server first: npm run dev');
    process.exit(1);
  }

  await main();
})();
