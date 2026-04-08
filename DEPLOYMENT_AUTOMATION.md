# 🚀 Automatic Deployment System

This document explains the automated deployment options for AK CHAUFFAGE.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Option 1: GitHub Actions (Recommended)](#option-1-github-actions-recommended)
3. [Option 2: Webhook Server](#option-2-webhook-server)
4. [Option 3: Manual Deployment](#option-3-manual-deployment)
5. [PM2 Configuration](#pm2-configuration)
6. [Troubleshooting](#troubleshooting)

---

## Overview

Three deployment methods are available:

| Method | Complexity | Speed | Reliability | Best For |
|--------|-----------|-------|-------------|----------|
| **GitHub Actions** | Medium | Fast | ⭐⭐⭐⭐⭐ | Production deployments |
| **Webhook Server** | Low | Fast | ⭐⭐⭐⭐ | Simple VPS setups |
| **Manual Script** | Very Low | Medium | ⭐⭐⭐ | Testing, troubleshooting |

---

## Option 1: GitHub Actions (Recommended)

### ✅ Advantages
- Runs on GitHub's infrastructure (no webhook server needed)
- Build happens in isolated environment
- Can run tests before deploying
- Deployment logs saved in GitHub
- Manual trigger option from GitHub UI
- Most secure option

### 📝 Setup Steps

#### 1. Generate SSH Key on Your Server

```bash
# On your VPS
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github-deploy
cat ~/.ssh/github-deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-deploy  # Copy this private key
```

#### 2. Add Secrets to GitHub

Go to: `https://github.com/your-username/ak-chauffage/settings/secrets/actions`

Add these secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `VPS_HOST` | Your server IP or domain | `123.45.67.89` or `ak-chauffage.be` |
| `VPS_USERNAME` | SSH username | `www-data` or `ubuntu` |
| `VPS_SSH_KEY` | Private key from step 1 | Contents of `github-deploy` |
| `VPS_PORT` | SSH port (optional) | `22` (default) |

#### 3. Configure Server Path

Edit `.github/workflows/deploy.yml` and update the path:

```yaml
script: |
  cd /var/www/ak-chauffage  # ← Update this path
```

#### 4. Test Deployment

```bash
# Push to main branch
git push origin main

# Or trigger manually from GitHub:
# Go to: Actions → Deploy to Production → Run workflow
```

#### 5. Monitor Deployment

- View logs: `https://github.com/your-username/ak-chauffage/actions`
- Each push shows build status and deployment logs

### 🔧 Customize Workflow

Edit `.github/workflows/deploy.yml` to:
- Add tests: `npm test`
- Add linting: `npm run lint`
- Deploy to staging first
- Send notifications (Slack, Discord, Email)

---

## Option 2: Webhook Server

### ✅ Advantages
- Runs on your server (no GitHub Actions minutes)
- Instant deployment on push
- Simple to understand
- Good for small teams

### 📝 Setup Steps

#### 1. Configure Environment

Add to `server/.env`:

```env
WEBHOOK_PORT=9000
WEBHOOK_SECRET=your-secure-random-secret-here
```

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. Start Webhook Server

```bash
# Install PM2 if not already installed
npm install -g pm2

# Start webhook server
pm2 start webhook-server.cjs --name webhook

# Save PM2 process list
pm2 save

# Set to start on boot
pm2 startup
```

#### 3. Configure Firewall

```bash
# Allow webhook port
sudo ufw allow 9000/tcp

# Or only from GitHub IPs (more secure)
# GitHub webhook IPs: https://api.github.com/meta
```

#### 4. Add Webhook to GitHub

Go to: `https://github.com/your-username/ak-chauffage/settings/hooks`

Click **Add webhook**:

| Field | Value |
|-------|-------|
| Payload URL | `http://your-server-ip:9000/webhook` |
| Content type | `application/json` |
| Secret | Same as `WEBHOOK_SECRET` in .env |
| Events | Just the push event |
| Active | ✓ Checked |

#### 5. Test Webhook

```bash
# Make a test commit
echo "test" >> README.md
git add README.md
git commit -m "test: webhook deployment"
git push origin main

# Check webhook server logs
pm2 logs webhook
```

### 🔒 Security Notes

- **Use HTTPS**: Set up reverse proxy with Nginx
- **Strong secret**: Generate a random 32+ character secret
- **IP whitelist**: Only allow GitHub IPs in firewall
- **Signature verification**: Webhook server verifies all requests

---

## Option 3: Manual Deployment

### ✅ Advantages
- Full control over deployment
- Good for testing
- No setup required
- Can be run via SSH

### 📝 Usage

#### On Server

```bash
# SSH into server
ssh user@your-server

# Navigate to project
cd /var/www/ak-chauffage

# Run deployment script
./deploy.sh
```

#### Via SSH (Remote)

```bash
# Deploy from your local machine
ssh user@your-server 'cd /var/www/ak-chauffage && ./deploy.sh'
```

#### Create Alias (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias deploy-ak='ssh user@your-server "cd /var/www/ak-chauffage && ./deploy.sh"'
```

Then just run:
```bash
deploy-ak
```

---

## PM2 Configuration

### Using Ecosystem File

The `ecosystem.config.cjs` file provides advanced PM2 configuration.

#### Start with Ecosystem

```bash
# Development
pm2 start ecosystem.config.cjs

# Production
pm2 start ecosystem.config.cjs --env production
```

#### Features Enabled

- ✅ Auto-restart on crash
- ✅ Memory limit (500MB)
- ✅ Daily restart at 3 AM
- ✅ Log rotation
- ✅ Graceful shutdown
- ✅ Environment-specific configs

#### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs ak-chauffage

# Monitor in real-time
pm2 monit

# Restart (zero-downtime)
pm2 reload ak-chauffage

# Stop
pm2 stop ak-chauffage

# Delete
pm2 delete ak-chauffage

# View detailed info
pm2 describe ak-chauffage

# Save process list
pm2 save

# Resurrect after reboot
pm2 resurrect
```

---

## Deployment Flow

### What Happens on Deploy

1. **Backup** 📦
   - Creates backup of `data/`, `uploads/`, `.env`
   - Stored in `backups/` directory
   - Keeps last 10 backups

2. **Pull Code** 📥
   - Fetches latest from GitHub
   - Shows commit changes
   - Aborts if no changes

3. **Install Dependencies** 📦
   - Runs `npm ci --only=production`
   - Ensures clean install

4. **Build Frontend** 🏗️
   - Runs `npm run build`
   - Creates optimized `dist/` folder

5. **Restart Backend** 🔄
   - PM2 reload (zero-downtime)
   - Old process waits for new to be ready
   - Seamless transition

6. **Cleanup** 🧹
   - Removes old backups
   - Shows deployment summary

### Rollback on Failure

If deployment fails:

```bash
# Restore from latest backup
cd /var/www/ak-chauffage
tar -xzf backups/backup_YYYYMMDD_HHMMSS.tar.gz

# Restart application
pm2 reload ak-chauffage
```

Or rollback git:

```bash
# Find previous commit
git log --oneline

# Rollback to specific commit
git reset --hard <commit-hash>

# Deploy
./deploy.sh
```

---

## Environment Variables for Deployment

Add to `server/.env` or GitHub Secrets:

```env
# GitHub Actions only
VPS_HOST=your-server-ip
VPS_USERNAME=www-data
VPS_SSH_KEY=your-private-key
VPS_PORT=22

# Webhook Server only
WEBHOOK_PORT=9000
WEBHOOK_SECRET=your-secret-key

# Both
NODE_ENV=production
PORT=3000
```

---

## Troubleshooting

### GitHub Actions Issues

**Problem:** SSH connection refused
```bash
# Check if SSH key is added to server
cat ~/.ssh/authorized_keys | grep github-deploy

# Check SSH port
sudo netstat -tlnp | grep ssh
```

**Problem:** Permission denied
```bash
# Check file permissions
ls -la /var/www/ak-chauffage

# Fix ownership
sudo chown -R www-data:www-data /var/www/ak-chauffage
```

### Webhook Server Issues

**Problem:** Webhook not receiving events
```bash
# Check webhook server is running
pm2 status webhook

# Check logs
pm2 logs webhook

# Test webhook manually
curl -X POST http://localhost:9000/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Problem:** Invalid signature
```bash
# Verify secret matches in both places:
# 1. server/.env
cat server/.env | grep WEBHOOK_SECRET

# 2. GitHub webhook settings
# Check on: https://github.com/your-repo/settings/hooks
```

### Deployment Script Issues

**Problem:** Git pull fails
```bash
# Check if there are local changes
git status

# Stash or discard local changes
git stash
# or
git reset --hard origin/main
```

**Problem:** Build fails
```bash
# Check Node version
node --version  # Should be 22+

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Problem:** PM2 not found
```bash
# Install PM2 globally
npm install -g pm2

# Or use npx
npx pm2 start server/index.cjs --name ak-chauffage
```

---

## Nginx Reverse Proxy (Recommended)

For webhook server behind Nginx:

```nginx
# /etc/nginx/sites-available/ak-chauffage
server {
    listen 80;
    server_name ak-chauffage.be;

    # Webhook endpoint
    location /webhook {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Main application
    location / {
        root /var/www/ak-chauffage/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
    }
}
```

Then use `https://ak-chauffage.be/webhook` instead of `http://server-ip:9000/webhook`

---

## Monitoring Deployments

### Set up Notifications

#### Slack Notifications

Add to GitHub Actions workflow:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### Email Notifications

GitHub automatically sends emails on failed workflows to repository admins.

#### Discord Webhook

```yaml
- name: Discord notification
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
```

---

## Best Practices

1. **Test in Staging First**
   - Create staging branch
   - Deploy to staging server
   - Test thoroughly
   - Then merge to main

2. **Use Environment Variables**
   - Never hardcode secrets
   - Use GitHub Secrets for CI/CD
   - Use .env files for server config

3. **Monitor Deployments**
   - Check logs after each deployment
   - Set up error tracking (Sentry)
   - Monitor server resources

4. **Keep Backups**
   - Automated backups before each deploy
   - Daily database backups
   - Off-site backup storage

5. **Version Tags**
   ```bash
   # Tag releases
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

---

## Quick Reference

### Deploy Commands

```bash
# Push to trigger GitHub Actions
git push origin main

# Manual deployment
./deploy.sh

# PM2 restart
pm2 reload ak-chauffage

# View logs
pm2 logs ak-chauffage

# Monitor
pm2 monit
```

### Useful PM2 Commands

```bash
pm2 list              # List all processes
pm2 restart all       # Restart all
pm2 reload all        # Reload all (zero-downtime)
pm2 logs              # View all logs
pm2 flush             # Clear logs
pm2 save              # Save process list
pm2 resurrect         # Restore saved processes
```

---

## 🎉 Ready to Deploy!

Choose your deployment method and follow the setup steps above. For most use cases, **GitHub Actions** is recommended for its reliability and ease of use.

**Need help?** Check the [Troubleshooting](#troubleshooting) section or review the deployment logs.
