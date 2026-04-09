# 🚀 Deploy to Render - Complete Guide

**Deployment Time:** 10-15 minutes
**Cost:** FREE (with limitations) or $7/month for no sleep

---

## ✅ Prerequisites

- [x] Render account (you're already logged in!)
- [x] GitHub repository
- [x] All configuration complete (verified!)

---

## 🚀 Quick Deploy (10 Minutes)

### Step 1: Push to GitHub (2 min)

```bash
# Commit all changes
git add .
git commit -m "feat: Render deployment configuration"
git push origin main
```

### Step 2: Create New Web Service (3 min)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository: `ak-chauffage`
4. Render will detect `render.yaml` automatically
5. Click **"Apply"**

**What happens:**
- ✅ Creates PostgreSQL database (free)
- ✅ Creates web service
- ✅ Auto-configures DATABASE_URL
- ✅ Starts first deployment

### Step 3: Set Environment Variables (3 min)

While deployment is running, go to **Environment** tab and add:

```env
# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$jEvPE.yetxDmiTvfZGi2GuSMb0ggxDP3TVBb68sL9Mn81qrvipZM6

# Email Service (Resend)
RESEND_API_KEY=re_EFYzQgEe_F9xeTZpk9HibmzRXobHbkVCG

# Cloudinary Image Storage
CLOUDINARY_CLOUD_NAME=ds3rdinun
CLOUDINARY_API_KEY=369197668198916
CLOUDINARY_API_SECRET=3sWADJ51O1QTeLS2Q5n8hXGKYGw
```

**Note:** `DATABASE_URL`, `JWT_SECRET`, and `PORT` are auto-set by Render!

### Step 4: Run Database Migration (2 min)

After first deployment completes:

1. Go to **Shell** tab in your web service
2. Run this command:

```bash
npm run migrate:postgres
```

Or use Render CLI:

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Find your service
render services list

# Run migration
render shell <your-service-name>
# Then run: npm run migrate:postgres
```

### Step 5: Redeploy (1 min)

1. Go to **Manual Deploy** → **Deploy latest commit**
2. Wait for green checkmark ✅

---

## 🎉 Your App is Live!

**URL:** `https://ak-chauffage.onrender.com`

### Test Your Deployment

1. **Health Check:**
   ```
   https://ak-chauffage.onrender.com/api/health
   ```

2. **Admin Login:**
   ```
   https://ak-chauffage.onrender.com/admin
   Username: admin
   Password: admin
   ```

3. **Public Site:**
   ```
   https://ak-chauffage.onrender.com
   ```

---

## ⚠️ Free Tier Limitations

### What You Get (FREE):
- ✅ PostgreSQL database (90 days, then expires)
- ✅ 512 MB RAM
- ✅ Shared CPU
- ✅ HTTPS included
- ✅ Automatic deployments

### Limitations:
- ❌ **Spins down after 15 minutes of inactivity**
- ⏱️ **30-second cold start** when waking up
- ⏰ **750 hours/month** (enough for testing)

**Impact:**
- First visit after 15 min idle = 30s wait
- Good for demos and testing
- NOT ideal for production

---

## 💰 Upgrade Options

### Starter Plan ($7/month)
- ✅ No sleep/cold starts
- ✅ Always-on
- ✅ Better performance
- **Recommended for production**

### To upgrade:
1. Go to your web service
2. Click **"Upgrade"**
3. Select **"Starter"** plan

---

## 🔧 Alternative Setup: Manual Configuration

If Blueprint doesn't work, use manual setup:

### A. Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Name: `ak-chauffage-db`
3. Database: `ak_chauffage`
4. Region: **Frankfurt** (closest to Belgium)
5. Plan: **Free**
6. Create database

**Copy the Internal Database URL** - you'll need it!

### B. Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repo: `ak-chauffage`
3. Configure:

```yaml
Name: ak-chauffage
Region: Frankfurt
Branch: main
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run start:prod
Plan: Free
```

4. **Advanced** → Add environment variables (see Step 3 above)
5. Add the PostgreSQL `DATABASE_URL` from step A
6. Create web service

### C. Run Migration

Use Shell or CLI to run:
```bash
npm run migrate:postgres
```

---

## 🌐 Custom Domain (Optional)

### Add Your Domain

1. Go to **Settings** → **Custom Domains**
2. Add domain: `ak-chauffage.be`
3. Add DNS records at your registrar:

```dns
Type: CNAME
Name: @
Value: ak-chauffage.onrender.com
```

4. SSL certificate auto-provisions in ~10 minutes

---

## 📊 Monitoring & Logs

### View Logs
1. Go to **Logs** tab
2. Real-time log streaming
3. Filter by level (info, error, etc.)

### Metrics
1. Go to **Metrics** tab
2. View:
   - CPU usage
   - Memory usage
   - Response times
   - HTTP requests

### Alerts
1. Go to **Alerts**
2. Set up email notifications for:
   - Deployment failures
   - Service downtime
   - High error rates

---

## 🐛 Troubleshooting

### Service Won't Start

**Check logs for:**
```bash
# Database connection error
Error: connect ECONNREFUSED
→ Make sure DATABASE_URL is set

# Port binding error
Error: listen EADDRINUSE
→ Render auto-sets PORT, don't override it

# Missing env vars
Error: Missing required environment variable
→ Check all variables are set in Environment tab
```

### Database Migration Failed

```bash
# Connect to database shell
render psql <database-name>

# Check if tables exist
\dt

# If tables don't exist, run migration again
npm run migrate:postgres
```

### Cold Starts Too Slow

**Solutions:**
1. Upgrade to Starter plan ($7/month)
2. Use external uptime monitoring (pings every 5 min)
3. Add loading indicator on frontend

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to random value
- [ ] Update `ADMIN_PASSWORD_HASH` for production
- [ ] Enable **Auto-Deploy** only from main branch
- [ ] Set up **Deploy Hooks** for protected deployments
- [ ] Review **Environment Groups** for secret management
- [ ] Enable **PR Previews** for testing

---

## 📈 Performance Optimization

### Enable Caching

In your web service settings:
```yaml
# Add to render.yaml
headers:
  - path: /uploads/*
    name: Cache-Control
    value: public, max-age=31536000, immutable
```

### Use Render CDN

Render automatically provides CDN for static assets. Your images served from Cloudinary are already optimized!

### Database Connection Pooling

Already configured in your PostgreSQL connection! (max 20 connections)

---

## 🔄 Continuous Deployment

### Auto-Deploy Setup

1. Go to **Settings** → **Build & Deploy**
2. Enable **Auto-Deploy**
3. Set branch: `main`

Now every `git push` automatically deploys!

### PR Previews

1. Enable **PR Previews** in settings
2. Each PR gets a unique URL
3. Perfect for testing before merging

---

## 💾 Database Backups

### Manual Backup

```bash
# Using Render dashboard
1. Go to PostgreSQL database
2. Click "Backups"
3. Create snapshot

# Using pg_dump
render psql <db-name>
pg_dump <database_url> > backup.sql
```

### Automated Backups

Free tier: No automated backups
Paid tier: Daily automated backups

**Recommendation:** Set up weekly manual backups for free tier.

---

## 🚀 Post-Deployment Checklist

- [ ] Test health endpoint
- [ ] Login to admin dashboard
- [ ] Create test invoice
- [ ] Send test email
- [ ] Upload test image (Cloudinary)
- [ ] Test contact form
- [ ] Verify analytics tracking
- [ ] Check public website loads
- [ ] Test on mobile device
- [ ] Verify HTTPS works

---

## 📚 Useful Render Commands

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# List services
render services list

# View logs
render logs <service-name>

# Open shell
render shell <service-name>

# Trigger deploy
render deploy <service-name>

# List environment variables
render env-vars list <service-name>

# Set environment variable
render env-vars set KEY=value <service-name>
```

---

## 💡 Tips & Best Practices

1. **Free Tier is Great for:**
   - Testing and development
   - Client demos
   - MVP launches
   - Portfolio projects

2. **Upgrade When:**
   - Getting real traffic
   - Cold starts annoying users
   - Need 99.9% uptime
   - Serving paying customers

3. **Cost Optimization:**
   - Start with free tier
   - Upgrade only web service ($7/mo)
   - Keep database on free tier initially
   - Cloudinary & Resend stay free

4. **Performance:**
   - Use Cloudinary for all images
   - Enable database connection pooling
   - Implement caching where needed
   - Monitor with Render metrics

---

## 🆚 Render vs Railway Comparison

| Feature | Render (Free) | Render (Starter) | Railway |
|---------|---------------|------------------|---------|
| Cost | FREE | $7/month | $5/month |
| Cold Starts | Yes (30s) | No | No |
| PostgreSQL | Free (90 days) | $7/month | $5/month (included) |
| Uptime | Limited hours | 99.9% SLA | 99.9% SLA |
| Best For | Testing/Demos | Production | Production |

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Health endpoint returns `{"status": "ok"}`
- ✅ Admin dashboard loads and displays data
- ✅ Can create and send invoices
- ✅ Images upload to Cloudinary
- ✅ Emails send via Resend
- ✅ Analytics track visitors
- ✅ Public site loads correctly

---

## 🎉 You're Live on Render!

**What You've Achieved:**
- ✅ Free PostgreSQL database
- ✅ Free web hosting
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ✅ Professional infrastructure

**Next Steps:**
1. Test all features thoroughly
2. Show client the demo
3. Collect feedback
4. When ready for production, upgrade to Starter ($7/mo)

---

## 📞 Need Help?

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Status Page:** https://status.render.com

---

**Happy Deploying! 🚀**
