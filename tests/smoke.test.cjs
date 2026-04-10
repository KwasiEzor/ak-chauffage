const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const bcrypt = require('bcrypt');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_FILES = ['contacts.db', 'contacts.db-shm', 'contacts.db-wal'];

process.env.JWT_SECRET = process.env.JWT_SECRET || 'smoke-test-secret';
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'smoke-admin';
process.env.ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('SmokePassword123!', 10);

const ContactService = require('../server/database/contactService.cjs');
const AdminService = require('../server/database/adminService.cjs');
const InvoiceService = require('../server/database/invoiceService.cjs');
const { readJSON } = require('../server/utils/fileManager.cjs');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function snapshotDatabase(snapshotDir) {
  const snapshot = new Map();

  for (const filename of DB_FILES) {
    const sourcePath = path.join(DATA_DIR, filename);
    const backupPath = path.join(snapshotDir, filename);

    try {
      await fs.copyFile(sourcePath, backupPath);
      snapshot.set(filename, true);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      snapshot.set(filename, false);
    }
  }

  return snapshot;
}

async function restoreDatabase(snapshotDir, snapshot) {
  for (const filename of DB_FILES) {
    const sourcePath = path.join(snapshotDir, filename);
    const targetPath = path.join(DATA_DIR, filename);

    if (snapshot.get(filename)) {
      await fs.copyFile(sourcePath, targetPath);
      continue;
    }

    await fs.rm(targetPath, { force: true });
  }
}

async function waitForOutput(outputRef, pattern) {
  const start = Date.now();

  while (Date.now() - start < 10000) {
    if (pattern.test(outputRef())) {
      return;
    }

    await wait(200);
  }

  throw new Error(`Timed out waiting for pattern ${pattern}`);
}

async function startServer() {
  const port = 4100 + Math.floor(Math.random() * 400);
  const password = 'SmokePassword123!';
  const passwordHash = bcrypt.hashSync(password, 10);
  const server = spawn('node', ['server.cjs'], {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      PORT: String(port),
      NODE_ENV: 'test',
      JWT_SECRET: 'smoke-test-secret',
      ADMIN_USERNAME: 'smoke-admin',
      ADMIN_PASSWORD_HASH: passwordHash,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  server.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  await waitForOutput(() => output, /Server running on port/);

  return { server, outputRef: () => output };
}

async function stopServer(server) {
  if (server.exitCode !== null) {
    return;
  }

  server.kill('SIGTERM');
  await new Promise((resolve) => {
    const timer = setTimeout(resolve, 5000);
    server.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

test('critical runtime smoke checks pass', async () => {
  const snapshotDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ak-chauffage-smoke-'));
  const snapshot = await snapshotDatabase(snapshotDir);
  const uniqueId = Date.now();

  let serverContext;

  try {
    const contact = await ContactService.create({
      name: `Smoke Contact ${uniqueId}`,
      email: `smoke-contact-${uniqueId}@example.com`,
      phone: '+32475123456',
      service: 'Depannage',
      message: 'Smoke contact message',
      ipAddress: '127.0.0.1',
      userAgent: 'smoke-test',
    });

    assert.ok(contact.id, 'expected contact insert to return an id');

    const csvRows = await ContactService.exportToCSV();
    const csvText = csvRows.map((row) => row.join(',')).join('\n');
    assert.match(csvText, new RegExp(`Smoke Contact ${uniqueId}`));

    const admin = await AdminService.create({
      username: `smoke-admin-${uniqueId}`,
      email: `smoke-admin-${uniqueId}@example.com`,
      password: 'SmokePassword123!',
      role: 'admin',
    });

    assert.ok(admin.id, 'expected admin insert to return an id');

    const verifiedAdmin = await AdminService.verify(
      `smoke-admin-${uniqueId}`,
      'SmokePassword123!'
    );
    assert.equal(verifiedAdmin.username, `smoke-admin-${uniqueId}`);

    const invoice = await InvoiceService.create({
      createdBy: admin.id,
      invoice: {
        status: 'draft',
        client_name: `Smoke Client ${uniqueId}`,
        client_email: `smoke-client-${uniqueId}@example.com`,
        client_phone: '+32475123456',
        client_address: 'Rue du Test 1, 1000 Bruxelles',
        issue_date: '2026-04-10',
        due_date: '2026-04-20',
        paid_date: null,
        subtotal: 100,
        tax_rate: 21,
        tax_amount: 21,
        total: 121,
        notes: 'Smoke invoice',
      },
      lineItems: [
        {
          description: 'Diagnostic',
          quantity: 1,
          unit_price: 100,
          amount: 100,
        },
      ],
    });

    assert.ok(invoice.id, 'expected invoice insert to return an id');
    assert.equal(invoice.line_items.length, 1);

    const legalData = await readJSON('legal.json');
    assert.ok(Array.isArray(legalData.pages));
    assert.ok(legalData.pages.length > 0);

    serverContext = await startServer();
    assert.match(serverContext.outputRef(), /Server running on port/);
  } finally {
    if (serverContext?.server) {
      await stopServer(serverContext.server);
    }
    await restoreDatabase(snapshotDir, snapshot);
    await fs.rm(snapshotDir, { recursive: true, force: true });
  }
});
