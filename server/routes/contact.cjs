const express = require('express');
const { sendContactEmail, sendAutoResponse } = require('../utils/mailer.cjs');
const ContactService = require('../database/contactService.cjs');
const router = express.Router();

/**
 * POST /api/contact
 * Handle contact form submissions with anti-spam checks
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Server-side validation
    if (!name || !email || !phone || !service) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Adresse email invalide' });
    }

    // Phone validation (Belgian format: +32 XXX XX XX XX or similar)
    const phoneRegex = /^(\+32|0032|0)[1-9]\d{7,8}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide' });
    }

    // Additional server-side honeypot check (if bot bypassed client-side)
    if (req.body.website) {
      console.warn('Server honeypot triggered:', req.ip);
      // Silently accept but don't process
      return res.json({ success: true, message: 'Message envoyé' });
    }

    // Save to database first
    let contact;
    try {
      contact = ContactService.create({
        name,
        email,
        phone,
        service,
        message,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      console.log('✅ Contact saved to database:', contact.id);
    } catch (dbError) {
      console.error('❌ Failed to save contact to database:', dbError);
      // Continue anyway - email is still sent
    }

    // Send email to business owner
    try {
      await sendContactEmail({ name, email, phone, service, message });
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError);
      // Continue even if email fails - we still want to acknowledge the submission
    }

    // Send auto-response to customer (optional, don't wait for it)
    sendAutoResponse({ name, email })
      .catch(err => console.warn('Auto-response failed:', err.message));

    // Log submission for debugging
    console.log('✅ Contact form submission processed:', {
      id: contact?.id,
      name,
      email,
      phone,
      service,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Votre message a été envoyé avec succès. Nous vous contacterons rapidement.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
});

module.exports = router;
