#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, data, headers: res.headers }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    const urlObj = new URL(url);
    const result = await makeRequest({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
    });

    if (result.statusCode === expectedStatus) {
      log(`✓ ${name}`, colors.green);
      return true;
    } else {
      log(`✗ ${name} (got ${result.statusCode}, expected ${expectedStatus})`, colors.red);
      return false;
    }
  } catch (error) {
    log(`✗ ${name} (${error.message})`, colors.red);
    return false;
  }
}

async function testJSONEndpoint(name, url) {
  try {
    const urlObj = new URL(url);
    const result = await makeRequest({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
    });

    if (result.statusCode !== 200) {
      log(`✗ ${name} (HTTP ${result.statusCode})`, colors.red);
      return false;
    }

    const json = JSON.parse(result.data);
    log(`✓ ${name}`, colors.green);
    return true;
  } catch (error) {
    log(`✗ ${name} (${error.message})`, colors.red);
    return false;
  }
}

function testFileExists(name, filePath) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${name}`, colors.green);
    return true;
  } else {
    log(`✗ ${name} (file not found)`, colors.red);
    return false;
  }
}

function testJSONFile(name, filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      log(`✗ ${name} (file not found)`, colors.red);
      return false;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    JSON.parse(content);
    log(`✓ ${name}`, colors.green);
    return true;
  } catch (error) {
    log(`✗ ${name} (${error.message})`, colors.red);
    return false;
  }
}

async function runTests() {
  log('\n🧪 Running System Tests for AK CHAUFFAGE CMS\n', colors.cyan);

  let passed = 0;
  let failed = 0;

  // File Structure Tests
  log('📁 File Structure Tests:', colors.blue);
  const fileTests = [
    ['Data directory exists', path.join(__dirname, 'data')],
    ['Content JSON exists', path.join(__dirname, 'data/content.json')],
    ['Settings JSON exists', path.join(__dirname, 'data/settings.json')],
    ['Server .env exists', path.join(__dirname, 'server/.env')],
    ['Uploads directory exists', path.join(__dirname, 'uploads')],
    ['Server index exists', path.join(__dirname, 'server/index.cjs')],
  ];

  for (const [name, file] of fileTests) {
    if (testFileExists(name, file)) passed++;
    else failed++;
  }

  // JSON Validation Tests
  log('\n📄 JSON Validation Tests:', colors.blue);
  const jsonTests = [
    ['Content JSON valid', path.join(__dirname, 'data/content.json')],
    ['Settings JSON valid', path.join(__dirname, 'data/settings.json')],
  ];

  for (const [name, file] of jsonTests) {
    if (testJSONFile(name, file)) passed++;
    else failed++;
  }

  // API Tests
  log('\n🌐 API Tests (Backend):', colors.blue);
  const apiTests = [
    ['API health check', 'http://localhost:3001/api/health'],
    ['Get content endpoint', 'http://localhost:3001/api/content'],
    ['Get settings endpoint', 'http://localhost:3001/api/settings'],
  ];

  for (const [name, url] of apiTests) {
    if (await testEndpoint(name, url)) passed++;
    else failed++;
  }

  // JSON API Response Tests
  log('\n📊 API JSON Response Tests:', colors.blue);
  const jsonApiTests = [
    ['Content API returns valid JSON', 'http://localhost:3001/api/content'],
    ['Settings API returns valid JSON', 'http://localhost:3001/api/settings'],
  ];

  for (const [name, url] of jsonApiTests) {
    if (await testJSONEndpoint(name, url)) passed++;
    else failed++;
  }

  // Frontend Tests
  log('\n⚛️  Frontend Tests (Vite):', colors.blue);
  const frontendTests = [
    ['Vite dev server responding', 'http://localhost:5173/'],
    ['Admin route accessible', 'http://localhost:5173/admin'],
  ];

  for (const [name, url] of frontendTests) {
    if (await testEndpoint(name, url)) passed++;
    else failed++;
  }

  // Content Data Validation
  log('\n✅ Content Data Validation:', colors.blue);
  try {
    const contentData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data/content.json'), 'utf-8')
    );

    const contentChecks = [
      ['Services array exists', Array.isArray(contentData.services)],
      ['FAQs array exists', Array.isArray(contentData.faqs)],
      ['Testimonials array exists', Array.isArray(contentData.testimonials)],
      ['Projects array exists', Array.isArray(contentData.projects)],
      ['Advantages array exists', Array.isArray(contentData.advantages)],
      ['Hero content exists', contentData.hero && typeof contentData.hero === 'object'],
      ['CTA Banner exists', contentData.ctaBanner && typeof contentData.ctaBanner === 'object'],
    ];

    for (const [name, condition] of contentChecks) {
      if (condition) {
        log(`✓ ${name}`, colors.green);
        passed++;
      } else {
        log(`✗ ${name}`, colors.red);
        failed++;
      }
    }
  } catch (error) {
    log(`✗ Content validation failed (${error.message})`, colors.red);
    failed += 7;
  }

  // Settings Data Validation
  log('\n⚙️  Settings Data Validation:', colors.blue);
  try {
    const settingsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data/settings.json'), 'utf-8')
    );

    const settingsChecks = [
      ['Contact info exists', settingsData.contact && typeof settingsData.contact === 'object'],
      ['Phone number exists', settingsData.contact?.phone],
      ['Email exists', settingsData.contact?.email],
      ['Hours config exists', settingsData.hours && typeof settingsData.hours === 'object'],
      ['Navigation array exists', Array.isArray(settingsData.navigation)],
    ];

    for (const [name, condition] of settingsChecks) {
      if (condition) {
        log(`✓ ${name}`, colors.green);
        passed++;
      } else {
        log(`✗ ${name}`, colors.red);
        failed++;
      }
    }
  } catch (error) {
    log(`✗ Settings validation failed (${error.message})`, colors.red);
    failed += 5;
  }

  // Summary
  log('\n' + '='.repeat(50), colors.cyan);
  const total = passed + failed;
  const percentage = ((passed / total) * 100).toFixed(1);

  if (failed === 0) {
    log(`\n🎉 All tests passed! (${passed}/${total})`, colors.green);
  } else {
    log(`\n📊 Test Results: ${passed}/${total} passed (${percentage}%)`, colors.yellow);
    log(`   ✓ Passed: ${passed}`, colors.green);
    log(`   ✗ Failed: ${failed}`, colors.red);
  }

  log('='.repeat(50) + '\n', colors.cyan);

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Test runner error: ${error.message}`, colors.red);
  process.exit(1);
});
