# Admin Credentials & System Settings Management Guide

## 🎉 Overview

You can now manage admin credentials and core system settings directly from the admin dashboard! This eliminates the need to manually edit `.env` files for most configuration changes.

## ✅ What's New

### **1. Database-Managed Admin Users**
- Multiple admin accounts supported
- Change password via dashboard
- Update email address
- View login history
- Secure audit logging

### **2. SMTP Settings Editor**
- Configure email server settings
- Test connection before saving
- Encrypted password storage
- Automatic fallback to .env

### **3. Secure Architecture**
- Passwords hashed with bcrypt (12 rounds)
- Sensitive data encrypted with AES-256-CBC
- Audit logs track all changes
- .env remains as fallback

---

## 🚀 Getting Started

### **First Time Setup**

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Automatic Migration:**
   - Your current `.env` admin credentials are automatically imported to the database
   - Look for this message in console: `✅ Migrated admin from .env to database: [username]`

3. **Login:**
   - Go to `/admin/login`
   - Use your existing credentials from `.env`
   - You're now logged in with a database-managed admin account!

---

## 👤 Managing Your Profile

### **Access Profile Settings**
1. Login to admin dashboard
2. Click your username in the sidebar (bottom left)
3. Click **"Profile"**

### **Change Your Password**
1. Navigate to Profile
2. Scroll to "Change Password" section
3. Fill in:
   - **Current Password** - Your existing password
   - **New Password** - Must be at least 8 characters
   - **Confirm New Password** - Must match new password
4. Click **"Change Password"**
5. You'll be logged out automatically
6. Login again with your new password

### **Update Email Address**
1. Navigate to Profile
2. Find "Email Address" section
3. Enter your new email
4. Click **"Update Email"**

### **Profile Information**
View:
- Username
- Role (admin / super_admin)
- Authentication source (database / environment)
- Last login timestamp
- Account creation date

---

## 📧 Managing SMTP Settings

### **Access SMTP Settings**
1. Login to admin dashboard
2. Navigate to **System Settings** in the sidebar
3. View current SMTP configuration

### **Configure SMTP**
1. Fill in the form:
   - **SMTP Host** - e.g., `smtp.gmail.com`
   - **Port** - Usually `465` (SSL) or `587` (TLS)
   - **Username/Email** - Your SMTP username
   - **Password** - SMTP password (encrypted before saving)
   - **From Address** - Email that appears in "From" field

2. **Test Connection (Recommended):**
   - Click **"Test Connection"** button
   - Verifies credentials before saving
   - Shows success/error message

3. **Save Configuration:**
   - Click **"Save Configuration"**
   - Settings are encrypted and stored in database
   - All future emails use these settings

### **Common SMTP Providers**

| Provider | Host | Port | Notes |
|----------|------|------|-------|
| Gmail | smtp.gmail.com | 465 | Requires app-specific password |
| Outlook | smtp-mail.outlook.com | 587 | Use TLS |
| SendGrid | smtp.sendgrid.net | 465 | Use API key as password |
| Mailgun | smtp.mailgun.org | 587 | Use Mailgun credentials |

### **Gmail Setup (Most Common)**

1. **Enable 2FA** on your Google account
2. **Create App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "AK CHAUFFAGE Website"
   - Copy the 16-character password
3. **Configure in Admin:**
   - Host: `smtp.gmail.com`
   - Port: `465`
   - Username: `your-email@gmail.com`
   - Password: [paste app password]
   - From: `noreply@ak-chauffage.be` (or your email)
4. **Test & Save**

---

## 🔐 Security Features

### **Password Security**
- ✅ Minimum 8 characters required
- ✅ Hashed with bcrypt (12 rounds)
- ✅ Current password required for changes
- ✅ Automatic logout after password change

### **Data Encryption**
- ✅ SMTP passwords encrypted (AES-256-CBC)
- ✅ Encryption key derived from JWT_SECRET
- ✅ Passwords never exposed in API responses

### **Audit Logging**
All actions are logged:
- Login attempts (success/failure)
- Password changes
- Email updates
- SMTP configuration changes
- Includes: timestamp, IP address, user agent

View audit logs in database:
```bash
sqlite3 data/contacts.db "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;"
```

---

## 🔄 Configuration Hierarchy

### **How Settings Are Loaded**

```
1. Database (Priority 1)
   ↓
2. .env File (Fallback)
```

**Example:**
- If SMTP settings exist in database → Use database settings
- If SMTP settings missing in database → Use .env settings

### **Why This Is Good**
- ✅ Easy to update via dashboard (no SSH needed)
- ✅ .env remains as backup
- ✅ Can revert to .env by deleting database settings
- ✅ Backward compatible

---

## 📊 Admin Roles

### **Admin**
- Can edit content, media, contacts
- Can change own password
- Can update own email
- Cannot create other admins

### **Super Admin**
- All admin permissions
- Can view all system settings
- Can access audit logs
- Can create/manage other admins (future)

---

## ⚠️ Important Notes

### **.env Admin (Special Case)**
If you login with the `.env` credentials (not migrated yet):
- **Read-only profile** - Cannot change password via dashboard
- Must edit `.env` file directly to change password
- Shows "Using .env credentials" warning
- Solution: Server auto-migrates on first start

### **Password Reset**
If you forget your password:
1. **Option A (Recommended):** Use "Forgot Password" feature (coming soon)
2. **Option B:** Manually reset via database:
   ```bash
   # Generate new hash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('new-password', 12))"

   # Update database
   sqlite3 data/contacts.db "UPDATE admins SET password_hash='[hash]' WHERE username='admin';"
   ```
3. **Option C:** Use .env admin as fallback (if not migrated)

### **Backup Before Changes**
Always backup before changing critical settings:
```bash
# Backup database
cp data/contacts.db data/contacts.db.backup

# Backup .env
cp .env .env.backup
```

---

## 🐛 Troubleshooting

### **Cannot Login After Password Change**
- Clear browser cache and cookies
- Make sure you're using the NEW password
- Check console logs for auth errors

### **SMTP Connection Test Fails**
Common issues:
- Wrong host/port combination
- 2FA enabled but not using app password (Gmail)
- Firewall blocking port 465/587
- Wrong username format (should be full email)

### **Configuration Not Saving**
- Check browser console for errors
- Verify you're logged in as admin
- Ensure all required fields are filled
- Try refreshing the page

### **Email Not Sending**
1. Check SMTP config in System Settings
2. Test connection (should show success)
3. Check server logs: `npm run dev`
4. Verify contact form is submitting
5. Check spam folder

---

## 🎯 Best Practices

### **Security**
1. Use strong passwords (12+ characters, mixed case, numbers, symbols)
2. Don't share admin credentials
3. Review audit logs regularly
4. Keep .env file secure (never commit to git)
5. Use app-specific passwords for Gmail

### **SMTP Configuration**
1. Always test connection before saving
2. Use reputable SMTP providers (Gmail, SendGrid, Mailgun)
3. Monitor email delivery rates
4. Set up SPF/DKIM records for your domain
5. Use a dedicated email for "from" address

### **Maintenance**
1. Backup database before major changes
2. Test changes in development first
3. Keep audit logs for at least 90 days
4. Document any custom configurations

---

## 📚 API Endpoints (For Developers)

### **Authentication**
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current profile
- `PUT /api/auth/password` - Change password
- `PUT /api/auth/email` - Update email

### **System Settings**
- `GET /api/system-settings/smtp` - Get SMTP config
- `PUT /api/system-settings/smtp` - Update SMTP config
- `POST /api/system-settings/smtp/test` - Test SMTP connection

---

## ✨ What's Next?

Planned features:
- [ ] Forgot password via email
- [ ] Multi-admin management (create/edit/delete users)
- [ ] Two-factor authentication (2FA)
- [ ] Email template customization
- [ ] Audit log viewer in dashboard
- [ ] Export audit logs
- [ ] Rate limit configuration
- [ ] Advanced email analytics

---

## 🆘 Need Help?

- **Documentation:** This file
- **Rate Limiting:** See `RATE_LIMITING.md`
- **Server Logs:** `npm run dev` (check console)
- **Database:** `data/contacts.db` (SQLite)

---

**Last Updated:** $(date +%Y-%m-%d)
**Version:** 1.0.0
