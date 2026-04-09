# ⚡ Render Quick Start - Deploy in 10 Minutes

**Cost:** FREE
**Time:** 10 minutes
**Perfect for:** Testing and client demos

---

## 🚀 4 Simple Steps

### Step 1: Push to GitHub (2 min)

```bash
git add .
git commit -m "feat: Render deployment ready"
git push origin main
```

### Step 2: Deploy with Blueprint (3 min)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect repository: `ak-chauffage`
4. Click **"Apply"**

**Render auto-creates:**
- PostgreSQL database (free)
- Web service
- DATABASE_URL connection

### Step 3: Add Environment Variables (3 min)

Go to your web service → **Environment** tab, add:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$jEvPE.yetxDmiTvfZGi2GuSMb0ggxDP3TVBb68sL9Mn81qrvipZM6
RESEND_API_KEY=re_EFYzQgEe_F9xeTZpk9HibmzRXobHbkVCG
CLOUDINARY_CLOUD_NAME=ds3rdinun
CLOUDINARY_API_KEY=369197668198916
CLOUDINARY_API_SECRET=3sWADJ51O1QTeLS2Q5n8hXGKYGw
```

Click **"Save Changes"**

### Step 4: Run Migration (2 min)

Go to **Shell** tab, run:

```bash
npm run migrate:postgres
```

---

## 🎉 Done! Your App is Live

**URL:** `https://ak-chauffage.onrender.com`

### Test It:

1. **Health:** `https://ak-chauffage.onrender.com/api/health`
2. **Admin:** `https://ak-chauffage.onrender.com/admin`
   - Username: `admin`
   - Password: `admin`

---

## ⚠️ Free Tier Note

- **Spins down** after 15 min idle
- **30 second** cold start on first visit
- Perfect for demos!

**Want no cold starts?** Upgrade to Starter ($7/month)

---

## 🐛 Issues?

See full guide: `RENDER_DEPLOYMENT.md`

**Common fixes:**
```bash
# View logs
Click "Logs" tab in Render dashboard

# Restart service
Click "Manual Deploy" → "Deploy latest commit"

# Check database
Click PostgreSQL service → "Connect" tab
```

---

## 🎯 Next Steps

1. ✅ Test all features
2. ✅ Show client demo
3. ✅ When ready, upgrade to $7/month (no sleep)

**That's it! You're deployed!** 🚀
