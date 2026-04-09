const bcrypt = require('bcrypt');

const hash = '$2b$10$jEvPE.yetxDmiTvfZGi2GuSMb0ggxDP3TVBb68sL9Mn81qrvipZM6';
const commonPasswords = [
  'admin',
  'admin123',
  'Admin123',
  'password',
  'password123',
  '123456',
  'akchauf',
  'AKChauffage',
  'test123',
];

async function checkPasswords() {
  console.log('🔍 Checking common passwords...\n');

  for (const password of commonPasswords) {
    const match = await bcrypt.compare(password, hash);
    if (match) {
      console.log(`✅ FOUND: "${password}"`);
      return password;
    } else {
      console.log(`❌ Not: "${password}"`);
    }
  }

  console.log('\n⚠️  None of the common passwords match.');
  console.log('Please provide the admin password manually.');
}

checkPasswords();
