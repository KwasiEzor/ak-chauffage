const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const path = require('node:path');
const { spawn } = require('node:child_process');

const APP_PORT = 4020;
const PROXY_PORT = 4443;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(outputRef) {
  const start = Date.now();

  while (Date.now() - start < 30000) {
    if (/Server running on port/.test(outputRef())) {
      return;
    }

    await wait(200);
  }

  throw new Error(`Timed out waiting for server startup.\n${outputRef()}`);
}

async function startHttpsProxy() {
  const key = fs.readFileSync(path.join(__dirname, 'fixtures/e2e-key.pem'));
  const cert = fs.readFileSync(path.join(__dirname, 'fixtures/e2e-cert.pem'));

  const proxy = https.createServer({ key, cert }, (req, res) => {
    const proxyReq = http.request(
      {
        hostname: 'localhost',
        port: APP_PORT,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `localhost:${APP_PORT}`,
          'x-forwarded-proto': 'https',
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (error) => {
      res.writeHead(502, { 'content-type': 'text/plain' });
      res.end(`Proxy error: ${error.message}`);
    });

    req.pipe(proxyReq);
  });

  await new Promise((resolve, reject) => {
    proxy.once('error', reject);
    proxy.listen(PROXY_PORT, '0.0.0.0', resolve);
  });

  return proxy;
}

async function run() {
  const server = spawn('node', ['tests/e2e-server.cjs'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
  let proxy;

  let serverOutput = '';
  server.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    serverOutput += text;
    process.stdout.write(text);
  });
  server.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    serverOutput += text;
    process.stderr.write(text);
  });

  try {
    await waitForServer(() => serverOutput);
    proxy = await startHttpsProxy();

    const testProcess = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['playwright', 'test', '--config', 'playwright.config.js'],
      {
        stdio: 'inherit',
        env: process.env,
      }
    );

    const exitCode = await new Promise((resolve) => {
      testProcess.on('exit', resolve);
    });

    process.exit(exitCode ?? 1);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  } finally {
    if (proxy) {
      proxy.close();
    }
    if (server.exitCode === null) {
      server.kill('SIGTERM');
    }
  }
}

run();
