# ⚡ Quick Start - Deploy in 15 Minutes

## Step 1: Get Cloudinary Credentials (5 min)

1. Go to https://cloudinary.com/users/register_free
2. Sign up with email
3. Copy these 3 values from dashboard:
   - **Cloud Name**: e.g., `dxyz123abc`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `abc123xyz789`

## Step 2: Push to GitHub (2 min)

```bash
git add .
git commit -m "feat: Production deployment ready with PostgreSQL, Cloudinary, Resend"
git push origin main
```

## Step 3: Deploy to Railway (8 min)

### A. Create Project (2 min)
1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `ak-chauffage` repository
4. Wait for initial deployment (will fail - that's OK!)

### B. Add Database (1 min)
1. Click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically sets `DATABASE_URL`

### C. Run Migration (2 min)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link
railway login
railway link

# Run migration
railway run npm run migrate:postgres
```

### D. Set Environment Variables (3 min)

Go to **Settings → Variables**, paste this:

```bash
NODE_ENV=production
JWT_SECRET=ak-chauffage-super-secret-key-change-this-in-production-32chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$jEvPE.yetxDmiTvfZGi2GuSMb0ggxDP3TVBb68sL9Mn81qrvipZM6
RESEND_API_KEY=re_EFYzQgEe_F9xeTZpk9HibmzRXobHbkVCG
SMTP_FROM=AK CHAUFFAGE <noreply@ak-chauffage.be>
CLOUDINARY_CLOUD_NAME=<paste-your-cloud-name>
CLOUDINARY_API_KEY=<paste-your-api-key>
CLOUDINARY_API_SECRET=<paste-your-api-secret>
```

**Important:** Replace the Cloudinary values with yours from Step 1!

### E. Redeploy (1 min)
1. Go to **Deployments**
2. Click **"Redeploy"** on latest deployment
3. Wait for green checkmark ✅

## Step 4: Test Your Deployment

Visit: `https://your-app.railway.app`

**Test Login:**
- URL: `https://your-app.railway.app/admin`
- Username: `admin`
- Password: `admin`

## 🎉 Done!

Your app is live! Now you can:
- Show client the demo
- Create test invoices
- Upload images (stored in Cloudinary)
- Send invoice emails (via Resend)
- Track visitor analytics

## 📝 Create Better Admin Password

```bash
# Generate new password hash
node -e "require('bcrypt').hash('YourSecurePassword123!', 10, (e,h) => console.log(h))"

# Update in Railway: Settings → Variables → ADMIN_PASSWORD_HASH
```

## 🌐 Add Custom Domain (Optional)

1. Railway: **Settings → Domains → + Custom Domain**
2. Enter: `ak-chauffage.be`
3. Add CNAME in your DNS:
   ```
   Type: CNAME
   Name: @
   Value: <your-railway-domain>.up.railway.app
   ```

## 💰 Cost: $5/month

Railway Hobby plan includes:
- ✅ PostgreSQL database
- ✅ App hosting
- ✅ SSL certificate
- ✅ Automatic deployments

Resend + Cloudinary = **FREE** (within limits)

## ❓ Problems?

```bash
# Check logs
railway logs

# Verify setup
npm run verify

# Test email
railway run node test-invoice-email.cjs
```

## 📚 More Details

- Full guide: `DEPLOYMENT_GUIDE.md`
- Summary: `DEPLOYMENT_SUMMARY.md`
- Environment variables: `.env.production.example`

---

**Questions?** Everything is documented in the files above! 🚀
