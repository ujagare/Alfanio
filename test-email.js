// Test script to send email using nodemailer
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Email configuration
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'alfanioindia@gmail.com',
    pass: 'ogwoqwpovqfcgacz' // App password from 2-step verification
  },
  from: 'Alfanio India <alfanioindia@gmail.com>',
  to: 'alfanioindia@gmail.com'
};

// Send test email function
const sendTestEmail = async () => {
  console.log('Sending test email...');
  console.log('Email configuration:');
  console.log('- Host:', EMAIL_CONFIG.host);
  console.log('- Port:', EMAIL_CONFIG.port);
  console.log('- Secure:', EMAIL_CONFIG.secure);
  console.log('- User:', EMAIL_CONFIG.auth.user);
  console.log('- From:', EMAIL_CONFIG.from);
  console.log('- To:', EMAIL_CONFIG.to);

  try {
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

    // Verify connection
    console.log('Verifying email connection...');
    await transporter.verify();
    console.log('Email connection verified successfully');

    // Send email
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
    console.error('Email sending error:', error);

    // Try alternative method if direct method fails
    try {
      console.log('Trying alternative email method...');

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
      console.error('Alternative email method also failed:', alternativeError);
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
    console.log('Starting email test...');
    const result = await sendTestEmail();
    console.log('Email test result:', result);

    if (result.success) {
      console.log('Email test successful! Please check your inbox.');
    } else {
      console.error('Email test failed. Please check the error messages above.');
    }
  } catch (error) {
    console.error('Error in main function:', error);
  }
};

// Run the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
