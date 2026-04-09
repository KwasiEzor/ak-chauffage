/**
 * Email Service
 * Supports both Resend (production) and Nodemailer (development/fallback)
 */

const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Determine which email service to use
const USE_RESEND = !!process.env.RESEND_API_KEY;

let resendClient;
let nodemailerTransporter;

// Initialize Resend if API key is available
if (USE_RESEND) {
  resendClient = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Email service: Resend');
} else {
  // Fallback to Nodemailer (SMTP)
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: process.env.SMTP_SECURE === 'true',
  };

  // Add auth if credentials provided
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    smtpConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    };
  }

  nodemailerTransporter = nodemailer.createTransport(smtpConfig);
  console.log('✅ Email service: Nodemailer (SMTP)', smtpConfig.host);
}

/**
 * Send email using available service
 * @param {object} emailData - Email data
 * @returns {Promise<object>} - Send result
 */
async function sendEmail({ to, from, subject, html, text, attachments = [] }) {
  const fromAddress = from || process.env.SMTP_FROM || 'noreply@ak-chauffage.be';

  try {
    if (USE_RESEND) {
      // Send via Resend
      const data = await resendClient.emails.send({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        attachments: attachments.map(att => ({
          filename: att.filename,
          content: att.content,
        }))
      });

      console.log('✅ Email sent via Resend:', data.id);
      return { success: true, messageId: data.id, service: 'resend' };

    } else {
      // Send via Nodemailer
      const info = await nodemailerTransporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text,
        attachments
      });

      console.log('✅ Email sent via Nodemailer:', info.messageId);
      return { success: true, messageId: info.messageId, service: 'nodemailer' };
    }

  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send invoice email with PDF attachment
 * @param {object} params - Invoice email parameters
 * @returns {Promise<object>} - Send result
 */
async function sendInvoiceEmail({ to, invoiceNumber, clientName, total, pdfBuffer }) {
  const subject = `Facture ${invoiceNumber} - AK CHAUFFAGE`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f97316; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px 20px; }
        .invoice-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .total { font-size: 24px; font-weight: bold; color: #f97316; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AK CHAUFFAGE</h1>
          <p>Votre facture est prête</p>
        </div>
        <div class="content">
          <p>Bonjour ${clientName},</p>

          <p>Veuillez trouver ci-joint votre facture <strong>${invoiceNumber}</strong>.</p>

          <div class="invoice-box">
            <h3>Détails de la facture</h3>
            <p><strong>Numéro:</strong> ${invoiceNumber}</p>
            <p><strong>Montant total:</strong> <span class="total">€${total.toFixed(2)}</span></p>
          </div>

          <p>Le document PDF est joint à cet email.</p>

          <p>Pour toute question concernant cette facture, n'hésitez pas à nous contacter:</p>
          <ul>
            <li>📞 Téléphone: +32 488 45 99 76</li>
            <li>📧 Email: contact@ak-chauffage.be</li>
          </ul>

          <p>Merci pour votre confiance!</p>

          <p style="margin-top: 30px;">
            Cordialement,<br>
            <strong>L'équipe AK CHAUFFAGE</strong>
          </p>
        </div>
        <div class="footer">
          <p>AK CHAUFFAGE - Rue de la Bassée 26/6, 6030 Marchienne-au-Pont</p>
          <p>TVA: BE0123456789</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Bonjour ${clientName},

Veuillez trouver ci-joint votre facture ${invoiceNumber}.

Montant total: €${total.toFixed(2)}

Pour toute question, contactez-nous:
- Téléphone: +32 488 45 99 76
- Email: contact@ak-chauffage.be

Merci pour votre confiance!

L'équipe AK CHAUFFAGE
  `;

  return sendEmail({
    to,
    subject,
    html,
    text,
    attachments: [{
      filename: `facture-${invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }]
  });
}

/**
 * Send contact form notification email
 * @param {object} params - Contact form parameters
 * @returns {Promise<object>} - Send result
 */
async function sendContactNotification({ name, email, phone, subject, message }) {
  const adminEmail = process.env.ADMIN_EMAIL || 'contact@ak-chauffage.be';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f97316; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #f97316; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📩 Nouveau message de contact</h2>
        </div>
        <div class="content">
          <div class="info-box">
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Téléphone:</strong> ${phone}</p>
            <p><strong>Sujet:</strong> ${subject}</p>
          </div>

          <h3>Message:</h3>
          <div class="info-box">
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Reçu le ${new Date().toLocaleString('fr-BE')}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[AK CHAUFFAGE] ${subject}`,
    html,
    text: `Nouveau message de ${name} (${email})\n\n${message}`
  });
}

module.exports = {
  sendEmail,
  sendInvoiceEmail,
  sendContactNotification,
  USE_RESEND
};
