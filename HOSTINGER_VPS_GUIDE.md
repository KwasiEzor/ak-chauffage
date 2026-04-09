# ⚠️ Hostinger VPS Deployment (Advanced)

**Warning:** This is a complex manual setup. Only proceed if you have DevOps experience.

**Recommended Alternative:** Use Render (free) or Railway ($5/month) instead.

---

## 📋 Prerequisites

- Hostinger VPS 1 or higher ($5.99+/month)
- SSH access
- Linux command line experience
- 3-4 hours for setup

---

## 🛠️ Manual Setup Steps

### 1. SSH into Your VPS

```bash
ssh root@your-vps-ip
```

### 2. Update System

```bash
apt update && apt upgrade -y
```

### 3. Install Node.js

```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify
node --version
npm --version
```

### 4. Install PostgreSQL

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE ak_chauffage;
CREATE USER ak_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE ak_chauffage TO ak_user;
\q
EOF
```

### 5. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### 6. Install Nginx (Reverse Proxy)

```bash
apt install -y nginx
```

### 7. Configure Nginx

```bash
nano /etc/nginx/sites-available/ak-chauffage
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /var/www/ak-chauffage/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:

```bash
ln -s /etc/nginx/sites-available/ak-chauffage /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 8. Install SSL (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

### 9. Deploy Application

```bash
# Create app directory
mkdir -p /var/www/ak-chauffage
cd /var/www/ak-chauffage

# Clone repository
git clone https://github.com/your-username/ak-chauffage.git .

# Install dependencies
npm install

# Build frontend
npm run build

# Create .env file
nano server/.env
```

Add environment variables:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://ak_user:your-secure-password@localhost:5432/ak_chauffage
JWT_SECRET=your-random-secret-32-chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$jEvPE.yetxDmiTvfZGi2GuSMb0ggxDP3TVBb68sL9Mn81qrvipZM6
RESEND_API_KEY=re_EFYzQgEe_F9xeTZpk9HibmzRXobHbkVCG
SMTP_FROM=AK CHAUFFAGE <noreply@ak-chauffage.be>
CLOUDINARY_CLOUD_NAME=ds3rdinun
CLOUDINARY_API_KEY=369197668198916
CLOUDINARY_API_SECRET=3sWADJ51O1QTeLS2Q5n8hXGKYGw
```

### 10. Run Database Migration

```bash
npm run migrate:postgres
```

### 11. Start Application with PM2

```bash
pm2 start server/index.cjs --name ak-chauffage
pm2 save
pm2 startup
```

### 12. Configure Firewall

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

## 🔄 Deployment Updates

Every time you need to deploy updates:

```bash
cd /var/www/ak-chauffage
git pull
npm install
npm run build
pm2 restart ak-chauffage
```

---

## 📊 Monitoring

```bash
# View logs
pm2 logs ak-chauffage

# Monitor resources
pm2 monit

# Check status
pm2 status
```

---

## 🐛 Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs ak-chauffage --lines 100

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Check PostgreSQL
systemctl status postgresql
```

### Database connection issues

```bash
# Test PostgreSQL connection
sudo -u postgres psql -d ak_chauffage -c "SELECT 1;"

# Check if user can connect
psql -U ak_user -d ak_chauffage -h localhost
```

### Port already in use

```bash
# Find process using port 3001
lsof -i :3001

# Kill if needed
kill -9 <PID>
```

---

## 💰 Actual Cost

**Hostinger VPS:**
- VPS 1: $5.99/month
- VPS 2: $8.99/month (recommended)

**Your Time:**
- Initial setup: 3-4 hours
- Maintenance: 2-3 hours/month
- Learning curve: High

**Compare to Render:**
- Cost: FREE
- Setup time: 10 minutes
- Maintenance: 0 hours
- Learning curve: None

**Compare to Railway:**
- Cost: $5/month
- Setup time: 15 minutes
- Maintenance: 0 hours
- Learning curve: Minimal

---

## ⚠️ Why This is Not Recommended

1. **Time-consuming:** 3-4 hours vs 10 minutes
2. **Complex:** Requires SSH, Linux, Nginx knowledge
3. **Maintenance:** You're responsible for updates, security
4. **No auto-deploy:** Manual git pull every time
5. **Single point of failure:** No automatic scaling
6. **More expensive:** $8.99 vs $5 (Railway) or FREE (Render)
7. **Security:** You manage all patches and updates
8. **Backups:** Manual setup required
9. **Monitoring:** Self-configured
10. **Support:** Limited for Node.js apps

---

## ✅ Recommended Path

**Instead of Hostinger VPS:**

1. **Use Render (FREE)** for testing/demos
2. **Upgrade to Railway ($5/month)** when ready for production
3. **Save time and headaches**

**Your app is already configured for Render!**
- See: `RENDER_QUICK_START.md`
- Deploy in 10 minutes
- Zero maintenance

---

## 🎯 Bottom Line

**Hostinger is great for WordPress, but wrong tool for this job.**

Your Node.js + React + PostgreSQL app needs:
- Modern hosting platform (Render/Railway)
- Automatic deployments
- Managed database
- Built-in SSL/CDN
- Zero DevOps overhead

**Save yourself 3-4 hours and use Render (free) or Railway ($5/month).**

---

**Still want to proceed with Hostinger?** Follow the steps above, but expect significant complexity and time investment.
