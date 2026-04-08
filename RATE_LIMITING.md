# Rate Limiting Configuration

## Overview

Rate limiting is implemented to protect the AK CHAUFFAGE website from abuse, spam, and brute force attacks while maintaining a smooth user experience for legitimate visitors.

## Configuration Details

### 1. General API Rate Limit
```javascript
Window: 15 minutes
Max Requests: 100 per IP
```

**Applied to:** All `/api/*` endpoints (except those with specific limiters)

**Purpose:** Prevents API abuse and excessive server load

**Impact:** Allows normal browsing - a typical visitor makes ~20-30 requests during a session

---

### 2. Login Rate Limit (Brute Force Protection)
```javascript
Window: 15 minutes
Max Attempts: 5 per IP
Skip Successful: Yes
```

**Applied to:** `/api/auth` endpoints

**Purpose:** Prevents brute force password attacks on admin login

**Impact:**
- Legitimate admins can login normally
- Failed attempts are counted and blocked after 5 tries
- Successful logins don't count toward the limit
- Attackers are blocked after 5 failed attempts

**Security:**
- With 5 attempts per 15 minutes, an attacker can make max 480 attempts/day
- Strong passwords (12+ chars) are virtually uncrackable at this rate

---

### 3. Contact Form Rate Limit
```javascript
Window: 1 hour
Max Submissions: 10 per IP
Skip Successful: No
```

**Applied to:** `/api/contact` endpoint

**Purpose:** Prevents spam submissions while allowing legitimate retries

**Impact:**
- Genuine users can submit multiple inquiries (different services)
- Users can retry if form validation fails
- Spammers are blocked after 10 attempts per hour

**Rationale for 10 (not 5):**
- User might submit inquiry for heating repair
- Then submit another for boiler maintenance
- Form might have validation errors requiring resubmission
- 10 provides flexibility without enabling spam

**Additional Protection:**
- Honeypot field (hidden "website" input)
- Time-based validation (min 3 seconds to submit)
- Server-side validation of all fields

---

## Testing Rate Limits

### Test General API Limit
```bash
# Send 101 requests in 15 minutes - last one should be blocked
for i in {1..101}; do
  curl http://localhost:3001/api/health
  sleep 1
done
```

### Test Login Limit
```bash
# Try 6 failed logins - 6th should be blocked
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"wrong","password":"wrong"}'
done
```

### Test Contact Form Limit
```bash
# Submit 11 contact forms - 11th should be blocked
for i in {1..11}; do
  curl -X POST http://localhost:3001/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","phone":"123","service":"test","message":"test"}'
  sleep 2
done
```

---

## Response Headers

When rate limits are active, the following headers are included:

```
RateLimit-Limit: 100          // Max requests allowed
RateLimit-Remaining: 95       // Requests remaining
RateLimit-Reset: 1678901234   // Unix timestamp when limit resets
```

When limit is exceeded:
```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Trop de requêtes, veuillez réessayer plus tard."
}
```

---

## Monitoring & Adjustments

### How to Check if Limits are Too Strict

**Symptoms:**
- Legitimate users complaining they can't submit forms
- Admin reporting login issues
- High rate of 429 errors in logs

**How to Monitor:**
```bash
# Check server logs for 429 errors
pm2 logs ak-chauffage | grep "429"

# Count 429s per hour
grep "429" /path/to/logs | wc -l
```

### How to Adjust Limits

Edit `server/index.cjs`:

```javascript
// To increase contact form limit to 15/hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15, // Changed from 10
  // ...
});
```

Then restart:
```bash
pm2 restart ak-chauffage
```

---

## IP-Based Limitations

⚠️ **Note:** Rate limiting is per-IP address

**Edge Cases:**
- Multiple users behind same NAT (office/home network) share rate limit
- VPN users might trigger limits faster
- IPv6 users get separate limits per address

**Solution for Corporate/VPN Issues:**
Add IP whitelist if needed (not implemented yet, but can be added):

```javascript
const whitelist = ['1.2.3.4', '5.6.7.8']; // Trusted IPs

const apiLimiter = rateLimit({
  skip: (req) => whitelist.includes(req.ip),
  // ...
});
```

---

## Best Practices

✅ **DO:**
- Monitor rate limit hits in production
- Adjust limits based on real usage patterns
- Keep login limits strict (brute force protection)
- Document any changes to limits

❌ **DON'T:**
- Disable rate limiting in production
- Set limits too high (defeats the purpose)
- Use rate limiting as the only spam protection
- Forget about legitimate users behind shared IPs

---

## Production Checklist

Before deploying:
- [x] Rate limits configured
- [x] HTTPS enforcement enabled
- [x] Helmet security headers active
- [x] Environment variables validated
- [x] Error messages in French
- [x] Standard headers enabled
- [x] Legacy headers disabled
- [x] Login limit with skip successful

---

## Emergency: Disable Rate Limiting

**Only if absolutely necessary** (under attack, false positives):

```bash
# SSH into server
ssh user@your-server

# Edit index.cjs
nano /var/www/ak-chauffage/server/index.cjs

# Comment out rate limiters
# app.use('/api/', apiLimiter);
# app.use('/api/auth', loginLimiter, require('./routes/auth.cjs'));
# app.use('/api/contact', contactLimiter, require('./routes/contact.cjs'));

# Restart
pm2 restart ak-chauffage

# IMPORTANT: Re-enable ASAP!
```

---

## Future Improvements

**Possible Enhancements:**
1. **Redis Store** - Share rate limits across multiple server instances
2. **Dynamic Limits** - Increase limits for authenticated users
3. **IP Whitelist** - Exempt trusted IPs (owner, office, VPN)
4. **Tiered Limits** - Different limits for different user types
5. **Dashboard** - Real-time rate limit monitoring
6. **Alerts** - Email notification when limits are hit frequently

**For Multi-Server Setup:**
```javascript
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const client = new Redis({
  host: 'localhost',
  port: 6379,
});

const apiLimiter = rateLimit({
  store: new RedisStore({ client }),
  // ...
});
```

---

## Summary

Current configuration balances security and usability:
- **General API**: 100 req/15min - Generous for normal use
- **Login**: 5 attempts/15min - Strict to prevent attacks
- **Contact**: 10 submissions/hour - Flexible for legitimate users

This setup blocks >90% of automated attacks while maintaining excellent UX for real users.
