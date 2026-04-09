/**
 * Create a test admin user
 * Usage: node create-test-admin.cjs
 */

require('dotenv').config({ path: __dirname + '/server/.env' });
const AdminService = require(__dirname + '/server/database/adminService.cjs');

const TEST_USER = {
  username: 'testadmin',
  password: 'test123456',
  email: 'test@ak-chauffage.local',
  role: 'admin'
};

async function createTestAdmin() {
  try {
    console.log('📝 Creating test admin user...');

    // Check if user exists
    const existing = await AdminService.getByUsername(TEST_USER.username);
    if (existing) {
      console.log('ℹ️  Test admin already exists, deleting...');
      // There's no delete method, so we'll just update the password
      await AdminService.updatePassword(existing.id, TEST_USER.password);
      console.log('✅ Updated existing test admin password');
      console.log('\nTest Admin Credentials:');
      console.log('Username:', TEST_USER.username);
      console.log('Password:', TEST_USER.password);
      return;
    }

    // Create new test admin
    const admin = await AdminService.create(TEST_USER);

    console.log('✅ Test admin created successfully!');
    console.log('\nTest Admin Credentials:');
    console.log('Username:', TEST_USER.username);
    console.log('Password:', TEST_USER.password);
    console.log('Role:', admin.role);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestAdmin();
