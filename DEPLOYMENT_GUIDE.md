# 🚀 AK Chauffage - Deployment Guide

Complete guide for deploying AK Chauffage to production on Railway.

## 📋 Prerequisites

- Git repository on GitHub
- Railway account ([railway.app](https://railway.app))
- Resend account for emails ([resend.com](https://resend.com))
- Cloudinary account for images (optional but recommended) ([cloudinary.com](https://cloudinary.com))

## Runtime Storage Rules

- Do not commit `data/*.db`, `data/*.db-shm`, or `data/*.db-wal`; those are local runtime files.
- Keep `data/content.json`, `data/settings.json`, and `data/legal.json` in git.
- Production should use PostgreSQL via `DATABASE_URL`.
- Treat `uploads/` as persistent runtime storage or move uploads to Cloudinary.

## 🗂️ Part 1: Prepare Your Repository

### 1.1 Commit All Changes

```bash
git add .
git commit -m "feat: Production deployment preparation with PostgreSQL, Cloudinary, and Resend"
git push origin main
```

### 1.2 Verify Configuration Files

Ensure these files exist:
- ✅ `railway.json` - Railway configuration
- ✅ `.railwayignore` - Files to exclude from deployment
- ✅ `package.json` - Updated with `start:prod` script

## 🚂 Part 2: Deploy to Railway

### 2.1 Create New Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `ak-chauffage` repository
5. Wait for the initial deployment to complete

### 2.2 Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database" → "PostgreSQL"**
3. Railway will create a database and set `DATABASE_URL` automatically
4. Copy the `DATABASE_URL` (you'll need it for migration)

### 2.3 Run Database Migration

**Option A: Via Railway CLI (Recommended)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migration
railway run npm run migrate:postgres
```

**Option B: Via Local Connection**

```bash
# Set DATABASE_URL locally
export DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Run migration
npm run migrate:postgres
```

### 2.4 Configure Environment Variables

In Railway project **Settings → Variables**, add:

#### Required Variables

```bash
# JWT Secret (generate strong random string)
JWT_SECRET=your-very-long-random-secret-here-at-least-32-chars

# Admin Credentials (create secure credentials)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt-hash-here>

# Email Service - Resend (Production)
RESEND_API_KEY=re_EFYzQgEe_F9xeTZpk9HibmzRXobHbkVCG
SMTP_FROM=noreply@ak-chauffage.be

# Node Environment
NODE_ENV=production
PORT=3001
```

#### Optional Variables (Highly Recommended)

```bash
# Cloudinary for Image Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMTP Fallback (if Resend fails)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_EFYzQgEe_F9xeTZpk9HibmzRXobHbkVCG

# Admin Contact
ADMIN_EMAIL=contact@ak-chauffage.be
CONTACT_EMAIL=contact@ak-chauffage.be
```

### 2.5 Generate Admin Password Hash

```bash
# On your local machine
node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('YourSecurePassword123!', 10, (err, hash) => {
  console.log('ADMIN_PASSWORD_HASH=' + hash);
});
"
```

Copy the output and add it to Railway environment variables.

### 2.6 Redeploy

After setting all variables:
1. Go to **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Monitor logs for successful startup

## 📧 Part 3: Configure Email Service (Resend)

### 3.1 Verify Resend Domain

1. Go to [resend.com](https://resend.com/domains)
2. Add your domain: `ak-chauffage.be`
3. Add DNS records provided by Resend:
   - TXT record for verification
   - MX records for email receiving (optional)
   - CNAME for SPF/DKIM

### 3.2 Update Email Sender

Once domain is verified, update Railway variables:

```bash
SMTP_FROM=noreply@ak-chauffage.be
# or
SMTP_FROM=AK CHAUFFAGE <contact@ak-chauffage.be>
```

### 3.3 Test Email Sending

```bash
# Via Railway CLI
railway run node test-invoice-email.cjs
```

## ☁️ Part 4: Configure Cloudinary (Optional)

### 4.1 Get Cloudinary Credentials

1. Go to [cloudinary.com/console](https://cloudinary.com/console)
2. Copy:
   - Cloud Name
   - API Key
   - API Secret

### 4.2 Add to Railway

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-secret-key
```

### 4.3 Migrate Existing Images (Optional)

If you have existing local images, upload them to Cloudinary:

```bash
# Create migration script or upload manually via Cloudinary dashboard
```

## 🌐 Part 5: Custom Domain (Optional)

### 5.1 Add Domain in Railway

1. Go to **Settings → Domains**
2. Click **"+ Custom Domain"**
3. Enter: `ak-chauffage.be` and `www.ak-chauffage.be`

### 5.2 Update DNS Records

Add CNAME records in your domain registrar:

```
Type    Name    Value
CNAME   www     <your-railway-domain>.up.railway.app
CNAME   @       <your-railway-domain>.up.railway.app
```

### 5.3 SSL Certificate

Railway automatically provisions SSL certificates. Wait 5-10 minutes after DNS propagation.

## ✅ Part 6: Verify Deployment

### 6.1 Health Check

Visit: `https://your-app.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-04-09T..."
}
```

### 6.2 Admin Login

1. Visit: `https://your-app.railway.app/admin`
2. Login with your credentials
3. Verify dashboard loads

### 6.3 Test Key Features

- [ ] Admin dashboard displays
- [ ] Analytics widget shows data
- [ ] Services editor works
- [ ] Image upload (Cloudinary)
- [ ] Invoice creation
- [ ] Invoice email sending
- [ ] Contact form submission
- [ ] Public site loads

## 🔧 Part 7: Post-Deployment Setup

### 7.1 Create Admin User

If you need additional admin users:

```bash
railway run node server/database/adminService.cjs create <username> <password> <email>
```

### 7.2 Update Site Settings

1. Login to admin dashboard
2. Go to **Settings Editor**
3. Update:
   - Company information
   - Contact details
   - SMTP settings (if using fallback)

### 7.3 Backup Database

Setup automated backups in Railway:
1. Go to **Database → Settings**
2. Enable **"Automated Backups"**
3. Set retention period (7 days recommended)

## 📊 Part 8: Monitoring

### 8.1 Railway Logs

```bash
# View logs via CLI
railway logs

# Or via web dashboard
# Go to Deployments → Click deployment → View Logs
```

### 8.2 Error Monitoring

Watch for common issues:
- Database connection errors
- Email sending failures
- Image upload errors
- Authentication issues

### 8.3 Performance Monitoring

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Response times

Access via **Metrics** tab in Railway dashboard.

## 🐛 Part 9: Troubleshooting

### Database Connection Issues

```bash
# Check DATABASE_URL is set
railway variables

# Test connection
railway run node -e "const {db} = require('./server/database/connection.cjs'); console.log(db.type);"
```

### Email Not Sending

```bash
# Check Resend API key
railway variables | grep RESEND

# Test email service
railway run node test-email.cjs
```

### Images Not Uploading

```bash
# Check Cloudinary credentials
railway variables | grep CLOUDINARY

# Verify configuration
railway run node -e "const cloudinary = require('./server/utils/cloudinaryService.cjs'); console.log(cloudinary.isConfigured());"
```

### Build Failures

```bash
# Check package.json scripts
cat package.json | grep '"start:prod"'

# Verify Node version (should be 18+)
node --version
```

## 📈 Part 10: Scaling & Optimization

### 10.1 Database Optimization

```sql
-- Run via Railway PostgreSQL shell
-- Create additional indexes if needed
CREATE INDEX IF NOT EXISTS idx_invoices_created ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
```

### 10.2 Caching Strategy

Consider adding Redis for:
- Session storage
- Analytics caching
- Rate limiting

```bash
# Add Redis in Railway
railway add redis
```

### 10.3 CDN for Static Assets

Railway provides CDN automatically, but for additional optimization:
- Use Cloudinary CDN for images
- Enable Cloudinary transformations for responsive images

## 🔐 Part 11: Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Enable 2FA for admin accounts (future feature)
- [ ] Verify JWT_SECRET is strong (32+ characters)
- [ ] Check CORS settings are restrictive
- [ ] Enable rate limiting on all endpoints
- [ ] Verify HTTPS is enforced
- [ ] Setup database backups
- [ ] Review audit logs regularly
- [ ] Keep dependencies updated (`npm audit`)

## 🎯 Part 12: Going Live Checklist

- [ ] Deploy to Railway ✅
- [ ] Database migrated ✅
- [ ] Environment variables set ✅
- [ ] Email service configured ✅
- [ ] Custom domain connected (optional)
- [ ] SSL certificate active
- [ ] Admin account created
- [ ] Test all features
- [ ] Backup strategy in place
- [ ] Monitoring enabled
- [ ] Error alerting configured

## 💰 Part 13: Cost Estimation

### Railway (recommended tier)

- **Hobby Plan**: $5/month
  - Includes: PostgreSQL database, App hosting
  - Good for testing and small businesses

- **Pro Plan**: $20/month
  - Includes: Better performance, more resources
  - Recommended for production

### External Services

- **Resend**: Free tier (100 emails/day) or $20/month (50k emails)
- **Cloudinary**: Free tier (25 GB/month) or $99/month (100 GB)

**Total estimated cost**: $5-50/month depending on usage

## 📞 Support & Resources

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Resend Docs: [resend.com/docs](https://resend.com/docs)
- Cloudinary Docs: [cloudinary.com/documentation](https://cloudinary.com/documentation)

## 🎉 Success!

Your AK Chauffage application is now deployed and ready for production use!

**Next Steps**:
1. Send demo URL to client
2. Get feedback on features
3. Prepare sales proposal
4. Launch! 🚀
