/**
 * Setup Verification Script
 * Verifies all services are configured correctly before deployment
 */

require('dotenv').config({ path: './server/.env' });

const checks = [];

console.log('🔍 Verifying AK Chauffage Setup\n');
console.log('=' .repeat(50));

// Check 1: Node Version
console.log('\n📦 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].slice(1));
if (majorVersion >= 18) {
  console.log(`✅ Node.js ${nodeVersion} (OK)`);
  checks.push(true);
} else {
  console.log(`❌ Node.js ${nodeVersion} (Need 18+)`);
  checks.push(false);
}

// Check 2: Required Dependencies
console.log('\n📚 Checking dependencies...');
const requiredPackages = [
  'express',
  'better-sqlite3',
  'pg',
  'cloudinary',
  'resend',
  'bcrypt',
  'jsonwebtoken',
  'nodemailer',
  'pdfkit'
];

let missingPackages = [];
requiredPackages.forEach(pkg => {
  try {
    require.resolve(pkg);
    console.log(`✅ ${pkg}`);
  } catch {
    console.log(`❌ ${pkg} (missing)`);
    missingPackages.push(pkg);
  }
});

checks.push(missingPackages.length === 0);

// Check 3: Environment Variables
console.log('\n🔑 Checking environment variables...');

const requiredEnvVars = {
  'JWT_SECRET': 'JWT secret for authentication',
  'ADMIN_USERNAME': 'Admin username',
  'ADMIN_PASSWORD_HASH': 'Admin password hash',
};

const optionalEnvVars = {
  'RESEND_API_KEY': 'Resend email service',
  'CLOUDINARY_CLOUD_NAME': 'Cloudinary cloud name',
  'CLOUDINARY_API_KEY': 'Cloudinary API key',
  'CLOUDINARY_API_SECRET': 'Cloudinary API secret',
  'DATABASE_URL': 'PostgreSQL connection (production)',
};

let envComplete = true;
Object.entries(requiredEnvVars).forEach(([key, description]) => {
  if (process.env[key]) {
    const value = process.env[key];
    const masked = value.length > 10 ? value.substring(0, 8) + '...' : '***';
    console.log(`✅ ${key}: ${masked} (${description})`);
  } else {
    console.log(`❌ ${key}: missing (${description})`);
    envComplete = false;
  }
});

checks.push(envComplete);

console.log('\n🔧 Optional variables:');
Object.entries(optionalEnvVars).forEach(([key, description]) => {
  if (process.env[key]) {
    const value = process.env[key];
    const masked = value.length > 10 ? value.substring(0, 8) + '...' : '***';
    console.log(`✅ ${key}: ${masked} (${description})`);
  } else {
    console.log(`⚠️  ${key}: not set (${description})`);
  }
});

// Check 4: Database Connection
console.log('\n🗄️  Checking database connection...');
try {
  const { db, DB_TYPE } = require('./server/database/connection.cjs');
  console.log(`✅ Database: ${DB_TYPE.toUpperCase()}`);

  if (DB_TYPE === 'postgres') {
    console.log('⚠️  PostgreSQL detected - make sure to run migrations:');
    console.log('   npm run migrate:postgres');
  } else {
    console.log('✅ SQLite ready for development');
  }
  checks.push(true);
} catch (error) {
  console.log(`❌ Database connection failed: ${error.message}`);
  checks.push(false);
}

// Check 5: Email Service
console.log('\n📧 Checking email service...');
if (process.env.RESEND_API_KEY) {
  console.log('✅ Resend API key configured');
  console.log('   Primary: Resend');
  checks.push(true);
} else if (process.env.SMTP_HOST) {
  console.log('⚠️  Using SMTP fallback (Nodemailer)');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log('   Consider adding Resend for production');
  checks.push(true);
} else {
  console.log('❌ No email service configured');
  checks.push(false);
}

// Check 6: Image Storage
console.log('\n🖼️  Checking image storage...');
const cloudinaryService = require('./server/utils/cloudinaryService.cjs');
if (cloudinaryService.isConfigured()) {
  console.log('✅ Cloudinary configured');
  console.log('   Images will be stored in cloud');
  checks.push(true);
} else {
  console.log('⚠️  Cloudinary not configured');
  console.log('   Images will be stored locally');
  console.log('   This won\'t work on Railway - configure Cloudinary');
  checks.push(false);
}

// Check 7: Configuration Files
console.log('\n📄 Checking configuration files...');
const fs = require('fs');
const configFiles = [
  'railway.json',
  '.railwayignore',
  'package.json',
  'DEPLOYMENT_GUIDE.md'
];

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (missing)`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 SUMMARY\n');

const passedChecks = checks.filter(Boolean).length;
const totalChecks = checks.length;
const percentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`Checks passed: ${passedChecks}/${totalChecks} (${percentage}%)`);

if (percentage === 100) {
  console.log('\n🎉 All checks passed! Ready for deployment!');
  console.log('\n📖 Next steps:');
  console.log('   1. Commit your changes: git add . && git commit');
  console.log('   2. Push to GitHub: git push');
  console.log('   3. Deploy to Railway: Follow DEPLOYMENT_GUIDE.md');
  process.exit(0);
} else if (percentage >= 70) {
  console.log('\n⚠️  Most checks passed, but some issues need attention');
  console.log('\n📖 Review the failed checks above and fix them before deploying');
  process.exit(1);
} else {
  console.log('\n❌ Multiple issues detected. Please fix them before deploying.');
  console.log('\n📖 See DEPLOYMENT_GUIDE.md for detailed setup instructions');
  process.exit(1);
}
