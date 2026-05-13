// Test script to send email using nodemailer
const { createRequire } = require('module');
const backendRequire = createRequire(`${process.cwd()}/backend/package.json`);

let dotenv;
try {
  dotenv = require('dotenv');
} catch {
  dotenv = backendRequire('dotenv');
}

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch {
  nodemailer = backendRequire('nodemailer');
}

// Load environment variables
dotenv.config();
dotenv.config({ path: 'backend/.env' });

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: String(process.env.EMAIL_SECURE ?? 'true') === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  from: `${process.env.EMAIL_FROM_NAME || 'Alfanio India'} <${process.env.EMAIL_USER || 'no-reply@alfanio.in'}>`,
  to: process.env.EMAIL_TO || process.env.EMAIL_USER
};

const maskEmail = (email = '') => email.replace(/^(.{2}).*(@.*)$/, '$1***$2');

// Send test email function
const sendTestEmail = async () => {
  console.log('Email configuration:');
  console.log('- Host:', EMAIL_CONFIG.host);
  console.log('- Port:', EMAIL_CONFIG.port);
  console.log('- Secure:', EMAIL_CONFIG.secure);
  console.log('- User:', maskEmail(EMAIL_CONFIG.auth.user));
  console.log('- To:', maskEmail(EMAIL_CONFIG.to));

  try {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass || !EMAIL_CONFIG.to) {
      throw new Error('Missing EMAIL_USER, EMAIL_PASS, or EMAIL_TO in environment');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: {
        user: EMAIL_CONFIG.auth.user,
        pass: EMAIL_CONFIG.auth.pass
      }
    });

    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified.');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to: EMAIL_CONFIG.to,
      subject: 'Test Email from Alfanio Contact Form',
      html: `
        <h2>Test Email from Alfanio Contact Form</h2>
        <p>This is a test email to verify that the contact form is working correctly.</p>
        <p>If you received this email, it means the email configuration is working properly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });

    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Primary email method failed:', error.message);

    // Try alternative method if direct method fails
    try {
      console.log('Trying alternative Gmail transport...');

      // Create alternative transport
      const alternativeTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Send email
      console.log('Sending test email with alternative method...');
      const info = await alternativeTransporter.sendMail({
        from: EMAIL_CONFIG.from,
        to: EMAIL_CONFIG.to,
        subject: 'Test Email from Alfanio Contact Form (Alternative Method)',
        html: `
          <h2>Test Email from Alfanio Contact Form (Alternative Method)</h2>
          <p>This is a test email to verify that the contact form is working correctly.</p>
          <p>If you received this email, it means the alternative email configuration is working properly.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `
      });

      console.log('Email sent successfully with alternative method:', info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        method: 'alternative'
      };
    } catch (alternativeError) {
      console.error('Alternative email method failed:', alternativeError.message);
      return {
        success: false,
        error: error.message,
        alternativeError: alternativeError.message
      };
    }
  }
};

// Main function
const main = async () => {
  try {
    const result = await sendTestEmail();

    if (result.success) {
      console.log('Email test successful. Check Inbox, Spam, Promotions, Sent, and All Mail.');
    } else {
      console.error('Email test failed:', result);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Email test crashed:', error.message);
    process.exitCode = 1;
  }
};

// Run the main function
main().catch(err => {
  console.error('Unhandled error:', err.message);
  process.exit(1);
});
