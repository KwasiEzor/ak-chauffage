/**
 * GitHub Webhook Server
 * Listens for push events and triggers automatic deployment
 *
 * Setup:
 * 1. Install: npm install crypto
 * 2. Start: pm2 start webhook-server.cjs --name webhook
 * 3. Configure GitHub webhook: http://your-server:9000/webhook
 * 4. Set webhook secret in environment: WEBHOOK_SECRET=your-secret
 */

require('dotenv').config({ path: __dirname + '/server/.env' });
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'change-me-in-production';
const DEPLOY_SCRIPT = __dirname + '/deploy.sh';

// Verify GitHub webhook signature
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Execute deployment script
async function deploy() {
  console.log('🚀 Starting deployment...');

  try {
    const { stdout, stderr } = await execAsync(`bash ${DEPLOY_SCRIPT}`);

    if (stdout) console.log('📝 Deployment output:\n', stdout);
    if (stderr) console.error('⚠️  Deployment warnings:\n', stderr);

    console.log('✅ Deployment completed successfully!');
    return { success: true, output: stdout };
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Create webhook server
const server = http.createServer((req, res) => {
  // Only handle POST requests to /webhook
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
    return;
  }

  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      // Verify signature
      const signature = req.headers['x-hub-signature-256'];
      if (!signature || !verifySignature(body, signature)) {
        console.warn('⚠️  Invalid signature - possible unauthorized request');
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid signature' }));
        return;
      }

      // Parse payload
      const payload = JSON.parse(body);
      const event = req.headers['x-github-event'];

      console.log(`📬 Received GitHub event: ${event}`);

      // Only deploy on push to main branch
      if (event === 'push' && payload.ref === 'refs/heads/main') {
        console.log('🔔 Push to main branch detected!');
        console.log(`📝 Commit: ${payload.head_commit.message}`);
        console.log(`👤 Author: ${payload.head_commit.author.name}`);

        // Send immediate response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Deployment started',
          commit: payload.head_commit.id.substring(0, 7)
        }));

        // Deploy in background
        const result = await deploy();

        if (!result.success) {
          console.error('💥 Deployment failed, check logs above');
        }
      } else {
        console.log(`ℹ️  Ignoring event: ${event} (ref: ${payload.ref || 'N/A'})`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Event ignored' }));
      }
    } catch (error) {
      console.error('❌ Error processing webhook:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🎣 Webhook server started');
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🔒 Secret configured: ${SECRET !== 'change-me-in-production' ? 'Yes ✓' : 'No ✗ (CHANGE IT!)'}`);
  console.log(`🌐 Webhook URL: http://your-server:${PORT}/webhook`);
  console.log('');
  console.log('Configure GitHub webhook:');
  console.log(`  1. Go to: https://github.com/your-username/ak-chauffage/settings/hooks`);
  console.log(`  2. Add webhook: http://your-server:${PORT}/webhook`);
  console.log(`  3. Secret: ${SECRET}`);
  console.log(`  4. Events: Just the push event`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down webhook server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
