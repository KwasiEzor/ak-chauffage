const nodemailer = require('nodemailer');

console.log('🧪 Testing Nodemailer with Mailpit...\n');

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  secure: false,
  // No auth needed for Mailpit
});

// Test email
async function testEmail() {
  try {
    console.log('📤 Sending test email...');

    const info = await transporter.sendMail({
      from: '"Test Sender" <test@ak-chauffage.local>',
      to: 'recipient@example.com',
      subject: '✅ Test Email from Nodemailer',
      html: '<h1>Success!</h1><p>This email was sent from nodemailer to Mailpit.</p>',
      text: 'Success! This email was sent from nodemailer to Mailpit.',
    });

    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('\n🌐 Check Mailpit at: http://localhost:8025');

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('   Details:', error);
  }
}

testEmail();
