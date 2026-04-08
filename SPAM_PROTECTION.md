# Spam Protection Implementation Guide

## ✅ **Currently Implemented: Honeypot + Time-based**

### How it works:
1. **Honeypot Field** (`website`) - Hidden field that bots fill but humans don't see
2. **Time-based Check** - Rejects forms submitted faster than 3 seconds (bot behavior)
3. **Server-side Validation** - Phone/email format validation

### Advantages:
- ✅ 100% privacy-friendly (no Google tracking)
- ✅ GDPR compliant (no consent needed)
- ✅ Zero UX friction (invisible to users)
- ✅ No external dependencies
- ✅ Blocks 70-80% of spam bots

### Test the Protection:
```javascript
// This will be rejected (honeypot triggered):
formData = { name: "Test", email: "test@test.com", phone: "0488123456", service: "Installation", website: "spam.com" }

// This will be rejected (too fast):
// Submit form immediately after page load (< 3 seconds)
```

---

## 🔒 **OPTION 2: Google reCAPTCHA v3 (If spam becomes a problem)**

### When to add reCAPTCHA:
- ✅ You're receiving 10+ spam submissions per day
- ✅ Honeypot isn't blocking enough spam
- ✅ You need 95%+ spam blocking rate
- ❌ Don't add if privacy is a top concern (GDPR requires cookie consent)

### Implementation Steps:

#### 1. Get reCAPTCHA Keys
1. Go to https://www.google.com/recaptcha/admin
2. Register your site
3. Choose **reCAPTCHA v3** (invisible, no challenges)
4. Add domain: `ak-chauffage.be` (and `localhost` for testing)
5. Get **Site Key** and **Secret Key**

#### 2. Add to Environment Variables

**server/.env**:
```env
RECAPTCHA_SECRET_KEY=your-secret-key-here
```

**src/config/recaptcha.ts** (new file):
```typescript
export const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Replace with your site key
export const RECAPTCHA_MIN_SCORE = 0.5; // Threshold: 0.0 (bot) to 1.0 (human)
```

#### 3. Add reCAPTCHA Script to index.html

```html
<head>
  <!-- ... existing tags ... -->
  <script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY" async defer></script>
</head>
```

#### 4. Update Contact Component

**src/components/Contact.tsx**:
```typescript
import { RECAPTCHA_SITE_KEY } from '../config/recaptcha';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Honeypot check (keep this)
  if (formData.website) {
    console.warn('Honeypot triggered');
    return;
  }

  // Time check (keep this)
  const timeSpent = Date.now() - formStartTime;
  if (timeSpent < 3000) {
    console.warn('Form submitted too fast');
    return;
  }

  setIsSubmitting(true);

  try {
    // Get reCAPTCHA token
    const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit_contact' });

    // Send to API with token
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        recaptchaToken: token,
      }),
    });

    if (!response.ok) throw new Error('Submission failed');

    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', service: '', message: '', website: '' });
  } catch (error) {
    console.error('Form submission error:', error);
    alert('Une erreur est survenue. Veuillez réessayer.');
  } finally {
    setIsSubmitting(false);
  }
};
```

**Add TypeScript declaration** in `src/vite-env.d.ts`:
```typescript
interface Window {
  grecaptcha: {
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };
}
```

#### 5. Update Backend Validation

**Install dependency**:
```bash
npm install axios
```

**server/routes/contact.cjs**:
```javascript
const axios = require('axios');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message, recaptchaToken } = req.body;

    // Verify reCAPTCHA token with Google
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
          remoteip: req.ip,
        },
      }
    );

    const { success, score, action } = recaptchaResponse.data;

    // Check reCAPTCHA result
    if (!success) {
      console.warn('reCAPTCHA verification failed');
      return res.status(400).json({ error: 'Vérification de sécurité échouée' });
    }

    // Check score (0.0 = bot, 1.0 = human)
    if (score < 0.5) {
      console.warn(`Low reCAPTCHA score: ${score} for IP: ${req.ip}`);
      return res.status(400).json({ error: 'Score de sécurité trop faible' });
    }

    // Check action matches
    if (action !== 'submit_contact') {
      console.warn('reCAPTCHA action mismatch');
      return res.status(400).json({ error: 'Action invalide' });
    }

    // Continue with existing validation...
    // ... rest of your code
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Une erreur est survenue' });
  }
});
```

#### 6. GDPR Compliance

**Update cookie consent** to include reCAPTCHA:

**src/config/cookies.ts**:
```typescript
{
  name: '_GRECAPTCHA',
  category: 'essential', // or 'analytics' depending on your interpretation
  provider: 'Google',
  description: 'Ce cookie est utilisé par reCAPTCHA pour protéger le formulaire de contact contre le spam',
  expiry: '6 mois',
},
```

**Add to Cookie Policy** (`data/legal.json`):
```json
{
  "heading": "Cookies de sécurité",
  "content": "<p>Nous utilisons Google reCAPTCHA v3 pour protéger notre formulaire de contact contre les soumissions automatisées. reCAPTCHA collecte des informations matérielles et logicielles et les envoie à Google pour analyse.</p><p>Pour plus d'informations : <a href='https://policies.google.com/privacy'>Politique de confidentialité Google</a></p>"
}
```

---

## 📊 **Comparison: Which Should You Use?**

### Recommended Approach for AK CHAUFFAGE:

**Phase 1: Start with Honeypot** ✅ (Already implemented)
- Monitor spam levels for 2-4 weeks
- Track false positives in server logs

**Phase 2: Add reCAPTCHA only if needed**
- If receiving 10+ spam/day
- If honeypot blocks legitimate users (rare)

### Hybrid Approach (Best of Both Worlds):
```javascript
// Keep honeypot + time check as first line of defense
// Add reCAPTCHA as second layer only for suspicious submissions

if (honeypotFilled || submittedTooFast) {
  return reject(); // Fast rejection, no reCAPTCHA needed
}

if (enableRecaptcha) {
  const token = await grecaptcha.execute(...);
  // Verify token on server
}
```

---

## 🧪 **Testing**

### Test Honeypot Protection:
```bash
# Should be rejected (honeypot filled)
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bot",
    "email": "bot@test.com",
    "phone": "0488123456",
    "service": "Installation",
    "website": "spam.com"
  }'
```

### Test Time-based Protection:
1. Open contact form
2. Fill and submit within 2 seconds
3. Should be silently rejected

### Test reCAPTCHA (if implemented):
1. Open browser DevTools → Console
2. Submit form
3. Check for reCAPTCHA token in network request
4. Server logs should show score (0.0-1.0)

---

## 🔍 **Monitoring**

### Server Logs to Watch:
```javascript
// Add to server/routes/contact.cjs
console.log('Contact submission:', {
  ip: req.ip,
  honeypot: req.body.website ? 'TRIGGERED' : 'OK',
  timestamp: new Date(),
  userAgent: req.headers['user-agent'],
});
```

### Analytics to Track:
- Total submissions per day
- Spam blocked by honeypot
- Spam blocked by time check
- reCAPTCHA scores (if implemented)
- False positive rate

---

## 💡 **Best Practices**

1. **Don't announce anti-spam measures** - Bots will adapt
2. **Log everything** - Helps identify patterns
3. **Monitor false positives** - Legitimate users getting blocked
4. **Update thresholds** - Adjust time limits, reCAPTCHA scores based on data
5. **Keep honeypot simple** - Field name like "website" or "company" (common bot targets)
6. **Multiple layers** - Combine honeypot + time + reCAPTCHA for best results

---

## ⚠️ **Privacy Considerations**

### Honeypot + Time-based:
- ✅ No data leaves your server
- ✅ No cookies
- ✅ No consent needed
- ✅ GDPR compliant by default

### reCAPTCHA v3:
- ❌ Sends data to Google (IP, user agent, browser info)
- ❌ Sets cookies (`_GRECAPTCHA`)
- ⚠️ Requires cookie consent (GDPR)
- ⚠️ Some privacy-focused users block reCAPTCHA

### Recommendation for Belgian Market:
**Start with Honeypot** (privacy-friendly), only add reCAPTCHA if absolutely necessary.
