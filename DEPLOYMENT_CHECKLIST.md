# 🚀 Pre-Deployment Checklist - AK CHAUFFAGE

## ✅ Completed Improvements

### 1. Security Hardening ✅
- [x] Helmet middleware for security headers
- [x] HTTPS enforcement in production
- [x] Environment variable validation
- [x] Enhanced rate limiting (100 req/15min general, 5 req/hour contact form)
- [x] Strong JWT secret generation example
- [x] Strong password hash example
- [x] CORS configuration
- [x] Input validation (phone/email formats)
- [x] Anti-spam protection (honeypot + time-based)

### 2. Email Integration ✅
- [x] Nodemailer installed and configured
- [x] Professional HTML email templates
- [x] Contact form sends to business owner
- [x] Auto-response email to customer
- [x] SMTP configuration in .env
- [x] Graceful fallback if email not configured

### 3. SEO Optimization ✅
- [x] Comprehensive meta tags (title, description, keywords)
- [x] Open Graph tags (Facebook/LinkedIn sharing)
- [x] Twitter Card tags
- [x] Geo tags for local SEO (Charleroi)
- [x] Structured data (JSON-LD) - LocalBusiness schema
- [x] sitemap.xml created
- [x] robots.txt created
- [x] Web manifest for PWA support
- [x] Canonical URLs
- [x] Language declaration (fr-BE)
- [x] Preconnect to external resources

### 4. Error Handling ✅
- [x] 404 Not Found page with helpful links
- [x] Error Boundary component (catches React errors)
- [x] User-friendly error messages
- [x] Error logging for debugging

### 5. Performance Optimization ✅
- [x] Lazy loading on all below-the-fold images
- [x] Eager loading on hero image (above-fold)
- [x] Async image decoding
- [x] Loading states for images
- [x] Error handling for failed images
- [x] OptimizedImage component created

---

## 📋 MANDATORY Pre-Deployment Tasks

### Step 1: Environment Configuration (CRITICAL)

**File:** `server/.env`

```bash
# 1. Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output to JWT_SECRET=

# 2. Generate strong password hash
node -e "const pw = 'YOUR_STRONG_PASSWORD'; console.log(require('bcrypt').hashSync(pw, 10))"
# Copy output to ADMIN_PASSWORD_HASH=

# 3. Update .env file
NODE_ENV=production
PORT=3000
JWT_SECRET=<your-generated-secret>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<your-generated-hash>
ALLOWED_ORIGINS=https://www.ak-chauffage.be,https://ak-chauffage.be

# 4. Configure SMTP (required for contact form)
SMTP_HOST=smtp.gmail.com  # or your SMTP provider
SMTP_PORT=465
SMTP_USER=contact@ak-chauffage.be
SMTP_PASS=your-app-password  # Get from Gmail App Passwords
CONTACT_EMAIL=contact@ak-chauffage.be
```

**Verification:**
```bash
# Test that all required env vars are set
node -e "require('dotenv').config({ path: './server/.env' }); const required = ['JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH']; required.forEach(v => { if (!process.env[v]) console.error('Missing:', v); else console.log('✓', v); });"
```

---

### Step 2: Domain Configuration

**Update these files with your actual domain:**

1. **index.html** (lines with ak-chauffage.be)
2. **sitemap.xml** (all URLs)
3. **robots.txt** (sitemap URL)
4. **src/components/StructuredData.tsx** (all URLs)

**Find and replace:**
```bash
# Search for placeholder domain
grep -r "www.ak-chauffage.be" src/ public/

# Replace with actual domain (if different)
find src/ public/ -type f -exec sed -i 's/www.ak-chauffage.be/YOUR-DOMAIN.com/g' {} +
```

---

### Step 3: Email Testing

**Test contact form email sending:**

```bash
# Start server
npm run server

# Test API endpoint
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0488123456",
    "service": "Installation",
    "message": "Test message"
  }'

# Expected: Success response + email received
```

**Gmail App Password Setup** (if using Gmail):
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Go to "App passwords"
4. Generate password for "Mail"
5. Use this password in `SMTP_PASS`

---

### Step 4: Favicon Generation

**Current:** Only SVG favicon exists
**Needed:** PNG versions for better compatibility

```bash
# Option 1: Online tool (easiest)
# Go to https://realfavicongenerator.net/
# Upload public/favicon.svg
# Download and extract to public/

# Option 2: Using ImageMagick
cd public/
convert favicon.svg -resize 16x16 favicon-16x16.png
convert favicon.svg -resize 32x32 favicon-32x32.png
convert favicon.svg -resize 180x180 apple-touch-icon.png
convert favicon.svg -resize 192x192 android-chrome-192x192.png
convert favicon.svg -resize 512x512 android-chrome-512x512.png
convert favicon.svg -define icon:auto-resize=16,32,48 favicon.ico
```

**See:** `public/FAVICON_INSTRUCTIONS.md` for detailed instructions

---

### Step 5: Build and Test

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Build frontend
npm run build

# Expected output: dist/ folder created

# 3. Test production build locally
npm start

# Expected: Server running on port 3000
# Visit: http://localhost:3000

# 4. Test all critical paths:
# - Homepage loads ✓
# - Contact form works ✓
# - Admin login works ✓
# - Legal pages load ✓
# - 404 page shows for invalid URL ✓
# - Images load correctly ✓
```

---

### Step 6: Security Verification

```bash
# 1. Verify .env is NOT in git
git status | grep .env
# Should output nothing (or only .env.example)

# 2. Check .gitignore
cat .gitignore | grep .env
# Should show: server/.env

# 3. Test rate limiting
# Make 6 rapid requests to /api/contact
# Expected: 6th request gets 429 error

# 4. Test honeypot protection
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Bot","email":"bot@test.com","phone":"0488","service":"Test","website":"spam"}'
# Expected: 200 success but email NOT sent (check server logs)

# 5. Test admin access
# Try logging in with old password (admin/admin)
# Expected: Should fail if you changed password
```

---

### Step 7: SEO Verification

**Test with tools:**
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
   - Test homepage URL
   - Should detect LocalBusiness schema ✓

2. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
   - Test homepage URL
   - Should show Open Graph preview ✓

3. **Schema Markup Validator**: https://validator.schema.org/
   - Test homepage
   - Should validate JSON-LD ✓

4. **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
   - Should pass ✓

**Manual checks:**
```bash
# 1. Check sitemap.xml
curl http://localhost:3000/sitemap.xml
# Should return valid XML

# 2. Check robots.txt
curl http://localhost:3000/robots.txt
# Should return robots directives

# 3. Check meta tags
curl -s http://localhost:3000 | grep -i "meta name=\"description\""
# Should show description tag
```

---

### Step 8: Performance Verification

**Test with Lighthouse:**
```bash
# Install Lighthouse CLI (optional)
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view

# Expected scores:
# Performance: 90+ ✓
# Accessibility: 90+ ✓
# Best Practices: 90+ ✓
# SEO: 90+ ✓
```

**Check image loading:**
1. Open DevTools → Network
2. Filter: Img
3. Scroll page
4. Images should load only when near viewport (lazy loading) ✓
5. Hero image should load immediately ✓

---

## 🌐 Deployment Options

### Option 1: VPS (DigitalOcean, Linode, etc.)

```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install Node.js 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 (process manager)
sudo npm install -g pm2

# 4. Clone repository
git clone your-repo-url
cd ak-chauffage

# 5. Install dependencies
npm install

# 6. Create .env file
nano server/.env
# Paste production environment variables

# 7. Build frontend
npm run build

# 8. Start with PM2
pm2 start server/index.cjs --name ak-chauffage
pm2 save
pm2 startup

# 9. Install Nginx as reverse proxy
sudo apt-get install nginx

# 10. Configure Nginx
sudo nano /etc/nginx/sites-available/ak-chauffage
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name ak-chauffage.be www.ak-chauffage.be;

    # Serve static files
    location / {
        root /path/to/ak-chauffage/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve uploads
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}
```

```bash
# 11. Enable site
sudo ln -s /etc/nginx/sites-available/ak-chauffage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 12. Install SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d ak-chauffage.be -d www.ak-chauffage.be

# 13. Firewall
sudo ufw allow 22  # SSH
sudo ufw allow 80  # HTTP
sudo ufw allow 443 # HTTPS
sudo ufw enable
```

---

### Option 2: Vercel (Frontend) + VPS (Backend)

**Frontend (Vercel):**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod

# 3. Configure environment variables in Vercel dashboard
# VITE_API_URL=https://api.ak-chauffage.be
```

**Backend (separate VPS):**
- Follow VPS instructions above for backend only
- Point Vercel frontend to backend API

---

### Option 3: Docker Deployment

```dockerfile
# Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

```bash
# Build image
docker build -t ak-chauffage .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file server/.env \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  --name ak-chauffage \
  ak-chauffage
```

---

## 📊 Post-Deployment Monitoring

### 1. Set up Google Analytics (Optional)

**Already configured:** Cookie consent system ready for GA

```typescript
// When ready, add to src/utils/analytics.ts
export function loadGoogleAnalytics(measurementId: string) {
  const { hasConsent } = useConsent();
  if (!hasConsent('analytics')) return;

  // Load GA script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', measurementId);
}
```

### 2. Monitor Server Logs

```bash
# With PM2
pm2 logs ak-chauffage

# Check for errors
pm2 logs ak-chauffage --err

# Monitor real-time
pm2 monit
```

### 3. Set up Automated Backups

```bash
# Create backup script
nano /home/user/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"
PROJECT_DIR="/path/to/ak-chauffage"

# Create backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz \
  $PROJECT_DIR/data \
  $PROJECT_DIR/uploads \
  $PROJECT_DIR/server/.env

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

```bash
# Make executable
chmod +x /home/user/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /home/user/backup.sh
```

---

## 🔒 Security Maintenance

### Weekly Tasks:
- [ ] Review server logs for suspicious activity
- [ ] Check rate limiting triggers
- [ ] Monitor failed login attempts

### Monthly Tasks:
- [ ] Update npm dependencies: `npm audit fix`
- [ ] Review and rotate JWT secrets if needed
- [ ] Check SSL certificate expiry
- [ ] Test backup restoration

### Quarterly Tasks:
- [ ] Security audit
- [ ] Performance review
- [ ] Update admin password
- [ ] Review GDPR compliance

---

## 📞 Support Contacts

**Hosting Issues:**
- VPS Provider support
- Domain registrar support

**Email Issues:**
- SMTP provider support
- Check server logs: `pm2 logs ak-chauffage`

**SSL Certificate Issues:**
- Let's Encrypt renewal: `sudo certbot renew`

**Code Issues:**
- Check error logs
- Review Error Boundary component
- Test in development: `npm run dev:all`

---

## ✅ Final Checklist Before Going Live

- [ ] All environment variables configured
- [ ] Strong password set (not admin/admin)
- [ ] Email sending tested and working
- [ ] Favicons generated
- [ ] Domain configured correctly
- [ ] SSL certificate installed
- [ ] Backup system in place
- [ ] Firewall configured
- [ ] Google Search Console verified
- [ ] Contact form tested end-to-end
- [ ] All pages load correctly
- [ ] Mobile responsiveness verified
- [ ] Lighthouse scores acceptable
- [ ] SEO tags verified with tools
- [ ] 404 page works
- [ ] Error handling tested

---

## 🎉 Ready for Launch!

Once all items are checked, you're ready to deploy AK CHAUFFAGE to production.

**Next steps after launch:**
1. Submit sitemap to Google Search Console
2. Test contact form from real customer perspective
3. Monitor server logs for first 24-48 hours
4. Set up Google Analytics (if desired)
5. Share website on social media
6. Monitor email deliverability

**Good luck with the launch! 🚀**
