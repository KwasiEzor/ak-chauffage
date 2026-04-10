const nodemailer = require('nodemailer');
const SystemSettingsService = require('../database/systemSettingsService.cjs');

// Check for Resend API key
const USE_RESEND = !!process.env.RESEND_API_KEY;
let resendClient;

if (USE_RESEND) {
  const { Resend } = require('resend');
  resendClient = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Email service: Resend (Production)');
}

/**
 * Verify transporter connection
 * @param {Object} transporter - Nodemailer transporter
 * @returns {Promise<boolean>}
 */
async function verifyTransporter(transporter) {
  try {
    if (!transporter) return false;
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message);
    return false;
  }
}

/**
 * Get email transporter with configuration
 */
const getTransporter = () => {
  const smtpConfig = SystemSettingsService.getSMTPConfig();

  if (!smtpConfig.host || !smtpConfig.user) {
    return null;
  }

  const config = {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.port === 465,
  };

  if (smtpConfig.pass && smtpConfig.pass !== 'test') {
    config.auth = {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    };
  }

  return nodemailer.createTransport(config);
};

/**
 * Send email via Resend or Nodemailer
 * @param {Object} mailOptions - Email options
 * @returns {Promise<Object>} - Send result
 */
async function sendEmail(mailOptions) {
  // 1. Try Resend if configured
  if (USE_RESEND) {
    try {
      const result = await resendClient.emails.send({
        from: mailOptions.from || 'AK CHAUFFAGE <noreply@ak-chauffage.be>',
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text,
        reply_to: mailOptions.replyTo,
        attachments: mailOptions.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
        }))
      });
      
      if (result.error) throw new Error(result.error.message);
      
      console.log('✅ Email sent via Resend:', result.data?.id);
      return { success: true, messageId: result.data?.id, service: 'resend' };
    } catch (error) {
      console.error('❌ Resend failed, falling back to SMTP:', error.message);
      // Fall through to SMTP
    }
  }

  // 2. Try SMTP
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('Email service not configured (SMTP host/user missing)');
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId, service: 'nodemailer' };
  } catch (error) {
    console.error('❌ SMTP send failed:', error.message);
    throw error;
  }
}

/**
 * Send contact form email to business owner
 * @param {Object} formData - Contact form data
 * @returns {Promise<boolean>} - Success status
 */
async function sendContactEmail(formData) {
  const { name, email, phone, service, message } = formData;

  const smtpConfig = SystemSettingsService.getSMTPConfig();
  const contactEmail = EMAIL.CONTACT_RECIPIENT || smtpConfig.from || smtpConfig.user;
  
  // Use a fallback if still not found to prevent failure
  const fromEmail = smtpConfig.from || smtpConfig.user || EMAIL.DEFAULT_FROM;

  // Email to business owner
  const mailOptions = {
    from: `"AK CHAUFFAGE Website" <${fromEmail}>`,
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
    await sendEmail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ sendContactEmail failed:', error.message);
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

  const smtpConfig = SystemSettingsService.getSMTPConfig();
  const fromEmail = smtpConfig.from || smtpConfig.user || 'noreply@ak-chauffage.be';

  const mailOptions = {
    from: `"AK CHAUFFAGE" <${fromEmail}>`,
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
    await sendEmail(mailOptions);
    console.log('✅ Auto-response sent to:', email);
    return true;
  } catch (error) {
    console.error('⚠️  Auto-response failed:', error.message);
    // Don't throw - auto-response failure shouldn't break contact form
    return false;
  }
}

/**
 * Send invoice email to client with PDF attachment
 * @param {Object} params - Email parameters
 * @param {Object} params.invoice - Invoice data
 * @param {Buffer} params.pdfBuffer - PDF file as buffer
 * @param {string} params.clientEmail - Client email address
 * @returns {Promise<boolean>} - Success status
 */
async function sendInvoiceEmail({ invoice, pdfBuffer, clientEmail }) {
  const smtpConfig = SystemSettingsService.getSMTPConfig();
  const fromEmail = smtpConfig.from || smtpConfig.user || 'noreply@ak-chauffage.be';

  // Email to client with invoice PDF
  const mailOptions = {
    from: `"AK CHAUFFAGE" <${fromEmail}>`,
    to: clientEmail,
    subject: `Facture ${invoice.invoice_number} - AK CHAUFFAGE`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .invoice-summary { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f97316; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #fff; border-radius: 6px; }
          .highlight { color: #f97316; font-weight: bold; }
          .amount { font-size: 24px; color: #f97316; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🔥 AK CHAUFFAGE</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre facture est prête</p>
          </div>

          <div class="content">
            <h2 style="color: #f97316; margin-top: 0;">Bonjour ${invoice.client_name},</h2>

            <p>Veuillez trouver ci-joint votre facture <strong>${invoice.invoice_number}</strong>.</p>

            <div class="invoice-summary">
              <h3 style="color: #f97316; margin-top: 0;">Détails de la facture</h3>
              <p style="margin: 10px 0;">
                <strong>Numéro:</strong> ${invoice.invoice_number}<br>
                <strong>Date d'émission:</strong> ${new Date(invoice.issue_date).toLocaleDateString('fr-BE')}<br>
                ${invoice.due_date ? `<strong>Date d'échéance:</strong> ${new Date(invoice.due_date).toLocaleDateString('fr-BE')}<br>` : ''}
              </p>
              <p style="margin: 20px 0;">
                <strong>Montant total:</strong><br>
                <span class="amount">€${invoice.total.toFixed(2)}</span>
              </p>
              ${invoice.notes ? `<p style="margin: 15px 0; padding: 15px; background: #fef3c7; border-radius: 4px; border-left: 3px solid #f59e0b;"><strong>Note:</strong> ${invoice.notes}</p>` : ''}
            </div>

            <p>Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>

            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #f97316; margin-top: 0;">Coordonnées bancaires</h3>
              <p style="margin: 5px 0; font-size: 14px;">
                <strong>Bénéficiaire:</strong> AK CHAUFFAGE<br>
                <strong>IBAN:</strong> [À compléter]<br>
                <strong>Communication:</strong> ${invoice.invoice_number}
              </p>
            </div>

            <p>Merci pour votre confiance,<br><strong>L'équipe AK CHAUFFAGE</strong></p>
          </div>

          <div class="footer">
            <p style="margin: 0 0 10px 0;">
              📞 <a href="tel:+32488459976" style="color: #f97316; text-decoration: none;">+32 488 45 99 76</a><br>
              📧 <a href="mailto:contact@ak-chauffage.be" style="color: #f97316; text-decoration: none;">contact@ak-chauffage.be</a>
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
              AK CHAUFFAGE - Chauffagiste expert à Charleroi<br>
              <a href="https://www.ak-chauffage.be" style="color: #f97316; text-decoration: none;">www.ak-chauffage.be</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bonjour ${invoice.client_name},

Veuillez trouver ci-joint votre facture ${invoice.invoice_number}.

Détails de la facture:
- Numéro: ${invoice.invoice_number}
- Date d'émission: ${new Date(invoice.issue_date).toLocaleDateString('fr-BE')}
${invoice.due_date ? `- Date d'échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-BE')}` : ''}
- Montant total: €${invoice.total.toFixed(2)}

${invoice.notes ? `Note: ${invoice.notes}\n` : ''}

Coordonnées bancaires:
Bénéficiaire: AK CHAUFFAGE
IBAN: [À compléter]
Communication: ${invoice.invoice_number}

Pour toute question concernant cette facture, n'hésitez pas à nous contacter.

Merci pour votre confiance,
L'équipe AK CHAUFFAGE

---
📞 +32 488 45 99 76
📧 contact@ak-chauffage.be
AK CHAUFFAGE - Chauffagiste expert à Charleroi
www.ak-chauffage.be
    `.trim(),
    attachments: [
      {
        filename: `facture-${invoice.invoice_number}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    await sendEmail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Invoice email sending failed:', error.message);
    throw error;
  }
}

module.exports = {
  sendContactEmail,
  sendAutoResponse,
  sendInvoiceEmail,
  verifyTransporter,
};
Transporter,
};
