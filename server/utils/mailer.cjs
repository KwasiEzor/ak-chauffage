const nodemailer = require('nodemailer');
const SystemSettingsService = require('../database/systemSettingsService.cjs');

/**
 * Email transporter configuration
 * Uses SMTP credentials from database (if set) or falls back to environment variables
 */
const createTransporter = () => {
  // Get SMTP config (database or .env fallback)
  const smtpConfig = SystemSettingsService.getSMTPConfig();

  // Check if email is configured
  if (!smtpConfig.host || !smtpConfig.user) {
    console.warn('⚠️  Email not configured. Contact form submissions will be logged but not sent.');
    return null;
  }

  const config = {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465, // true for 465, false for other ports
  };

  // Only add auth if password is provided (Mailpit doesn't need auth)
  if (smtpConfig.pass && smtpConfig.pass !== 'test') {
    config.auth = {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    };
  }

  console.log(`📧 Using SMTP config from: ${smtpConfig.source}`);

  return nodemailer.createTransport(config);
};

/**
 * Send contact form email to business owner
 * @param {Object} formData - Contact form data
 * @returns {Promise<boolean>} - Success status
 */
async function sendContactEmail(formData) {
  const { name, email, phone, service, message } = formData;

  const transporter = createTransporter();

  // If email not configured, just log
  if (!transporter) {
    console.log('📧 Contact form submission (email not configured):', {
      name,
      email,
      phone,
      service,
      message: message?.substring(0, 50) + '...',
    });
    return true; // Return true so form doesn't fail
  }

  const smtpConfig = SystemSettingsService.getSMTPConfig();
  const contactEmail = process.env.CONTACT_EMAIL || smtpConfig.from || smtpConfig.user;

  // Email to business owner
  const mailOptions = {
    from: `"AK CHAUFFAGE Website" <${smtpConfig.from || smtpConfig.user}>`,
    to: contactEmail,
    replyTo: email,
    subject: `🔥 Nouveau contact: ${service}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: bold; color: #f97316; text-transform: uppercase; font-size: 12px; margin-bottom: 5px; }
          .value { background: white; padding: 12px; border-left: 3px solid #f97316; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .cta { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🔥 Nouvelle demande de contact</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Site web AK CHAUFFAGE</p>
          </div>

          <div class="content">
            <div class="field">
              <div class="label">Nom complet</div>
              <div class="value">${name}</div>
            </div>

            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${email}" style="color: #f97316; text-decoration: none;">${email}</a></div>
            </div>

            <div class="field">
              <div class="label">Téléphone</div>
              <div class="value"><a href="tel:${phone}" style="color: #f97316; text-decoration: none;">${phone}</a></div>
            </div>

            <div class="field">
              <div class="label">Service demandé</div>
              <div class="value"><strong>${service}</strong></div>
            </div>

            ${message ? `
            <div class="field">
              <div class="label">Message</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
            ` : ''}

            <div style="text-align: center;">
              <a href="mailto:${email}" class="cta">Répondre au client</a>
            </div>
          </div>

          <div class="footer">
            <p>Cette demande provient du formulaire de contact sur www.ak-chauffage.be</p>
            <p>Reçu le ${new Date().toLocaleString('fr-BE', { dateStyle: 'full', timeStyle: 'short' })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Nouvelle demande de contact - AK CHAUFFAGE

Nom: ${name}
Email: ${email}
Téléphone: ${phone}
Service: ${service}
${message ? `\nMessage:\n${message}` : ''}

---
Reçu le ${new Date().toLocaleString('fr-BE')}
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
}

/**
 * Send auto-response email to customer
 * @param {Object} formData - Contact form data
 * @returns {Promise<boolean>} - Success status
 */
async function sendAutoResponse(formData) {
  const { name, email } = formData;

  const transporter = createTransporter();
  if (!transporter) return true;

  const smtpConfig = SystemSettingsService.getSMTPConfig();

  const mailOptions = {
    from: `"AK CHAUFFAGE" <${smtpConfig.from || smtpConfig.user}>`,
    to: email,
    subject: 'Nous avons bien reçu votre message - AK CHAUFFAGE',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #fff; border-radius: 6px; }
          .contact-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .highlight { color: #f97316; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🔥 AK CHAUFFAGE</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre expert en chauffage à Charleroi</p>
          </div>

          <div class="content">
            <h2 style="color: #f97316; margin-top: 0;">Bonjour ${name},</h2>

            <p>Merci de nous avoir contactés ! Nous avons bien reçu votre demande et nous vous répondrons dans les <span class="highlight">24 heures</span>.</p>

            <p>Notre équipe examine actuellement votre demande et vous contactera très bientôt pour discuter de votre projet.</p>

            <div class="contact-info">
              <h3 style="color: #f97316; margin-top: 0;">Besoin d'une réponse urgente ?</h3>
              <p style="margin: 10px 0;">
                📞 <strong>Téléphone:</strong> <a href="tel:+32488459976" style="color: #f97316; text-decoration: none;">+32 488 45 99 76</a><br>
                📧 <strong>Email:</strong> <a href="mailto:contact@ak-chauffage.be" style="color: #f97316; text-decoration: none;">contact@ak-chauffage.be</a>
              </p>
              <p style="margin: 10px 0; font-size: 14px; color: #666;">
                <strong>Horaires:</strong> Lun-Ven: 8h-18h | Service d'urgence 7j/7
              </p>
            </div>

            <p>À très bientôt,<br><strong>L'équipe AK CHAUFFAGE</strong></p>
          </div>

          <div class="footer">
            <p style="margin: 0; font-size: 12px; color: #666;">
              AK CHAUFFAGE - Chauffagiste expert à Charleroi<br>
              <a href="https://www.ak-chauffage.be" style="color: #f97316; text-decoration: none;">www.ak-chauffage.be</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bonjour ${name},

Merci de nous avoir contactés ! Nous avons bien reçu votre demande et nous vous répondrons dans les 24 heures.

Notre équipe examine actuellement votre demande et vous contactera très bientôt pour discuter de votre projet.

Besoin d'une réponse urgente ?
Téléphone: +32 488 45 99 76
Email: contact@ak-chauffage.be

Horaires: Lun-Ven: 8h-18h | Service d'urgence 7j/7

À très bientôt,
L'équipe AK CHAUFFAGE

---
AK CHAUFFAGE - Chauffagiste expert à Charleroi
www.ak-chauffage.be
    `.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Auto-response sent to:', email);
    return true;
  } catch (error) {
    console.error('⚠️  Auto-response failed:', error.message);
    // Don't throw - auto-response failure shouldn't break contact form
    return false;
  }
}

module.exports = {
  sendContactEmail,
  sendAutoResponse,
};
