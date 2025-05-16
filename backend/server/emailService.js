/**
 * Email service for Alfanio website
 * Provides email functionality with fallback mechanisms
 */

import nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'alfanioindia@gmail.com',
    pass: process.env.EMAIL_PASS || 'rvxvxvxvxvxvxvxv' // Updated app password
  },
  from: `${process.env.EMAIL_FROM_NAME || 'Alfanio India'} <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
  to: process.env.EMAIL_TO || 'alfanioindia@gmail.com'
};

// Create mail transport
const createMailTransport = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Log email configuration status
  console.log(`Configuring email transport for ${isProduction ? 'production' : 'development'} environment`);

  // Set up email transport configuration - direct Gmail configuration
  const transportConfig = {
    service: 'gmail',
    auth: {
      user: 'alfanioindia@gmail.com',
      pass: 'rvxvxvxvxvxvxvxv' // App password - replace with actual app password
    }
  };

  console.log('Email transport configuration:', {
    service: transportConfig.service,
    auth: {
      user: transportConfig.auth.user,
      pass: '********' // Don't log the actual password
    }
  });

  // Create and return the transport
  return nodemailer.createTransport(transportConfig);
};

// Create initial mail transport
let mailTransport = createMailTransport();

// Verify email transport with retry logic
export const verifyEmailTransport = async (retries = 3, delay = 3000) => {
  let currentRetry = 0;

  while (currentRetry < retries) {
    try {
      await mailTransport.verify();
      console.log('Email server is ready');
      return true;
    } catch (error) {
      currentRetry++;
      console.error(`Email verification failed (attempt ${currentRetry}/${retries}):`, error.message);

      if (currentRetry >= retries) {
        console.error('Maximum email verification retries reached.');
        console.log('Continuing server operation despite email verification failure.');

        // Log detailed error information for debugging
        console.log('Email configuration:', {
          host: EMAIL_CONFIG.host,
          port: EMAIL_CONFIG.port,
          secure: EMAIL_CONFIG.secure,
          user: EMAIL_CONFIG.auth.user
        });

        // Log additional troubleshooting information
        console.log('Email troubleshooting tips:');
        console.log('1. Check if the Gmail account has "Less secure app access" enabled');
        console.log('2. If using 2FA, make sure to use an App Password instead of regular password');
        console.log('3. Check if there are any network restrictions blocking SMTP connections');
        console.log('4. Try sending a test email directly to verify credentials');

        return false;
      }

      // Wait before next retry
      console.log(`Waiting ${delay}ms before next email verification attempt...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return false;
};

// Enhanced email sending function with retry and fallback
export const sendEmail = async (options) => {
  // Validate options
  if (!options.to || !options.subject) {
    throw new Error('Email options missing required fields');
  }

  // Set up mail options
  const mailOptions = {
    from: options.from || EMAIL_CONFIG.from,
    to: options.to,
    subject: options.subject,
    text: options.text || '',
    html: options.html || '',
    attachments: options.attachments || []
  };

  // Add default email template styling
  const defaultStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      h2 { color: #FECC00; border-bottom: 1px solid #eee; padding-bottom: 10px; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .footer { margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
  `;

  // Add company info to all emails
  const companyInfo = `
    <div class="footer">
      <p>Alfanio LTD</p>
      <p>This is an automated message, please do not reply directly to this email.</p>
    </div>
  `;

  // Wrap HTML content with styling
  if (mailOptions.html) {
    mailOptions.html = `
      <html>
        <head>${defaultStyle}</head>
        <body>
          <div class="container">
            ${mailOptions.html}
            ${companyInfo}
          </div>
        </body>
      </html>
    `;
  }

  console.log('Attempting to send email to:', options.to);
  console.log('Email subject:', options.subject);

  try {
    // Create a fresh transport
    const transport = createMailTransport();

    // Send email
    const info = await transport.sendMail(mailOptions);

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted
    };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    console.error('Error details:', error);

    // Log detailed error information
    if (error.code) console.error('Error code:', error.code);
    if (error.command) console.error('SMTP command that failed:', error.command);
    if (error.response) console.error('SMTP server response:', error.response);
    if (error.responseCode) console.error('SMTP response code:', error.responseCode);

    // Try with alternative configuration if first attempt fails
    try {
      console.log('Trying alternative email configuration...');

      // Create alternative transport with different settings
      const alternativeTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'alfanioindia@gmail.com',
          pass: 'rvxvxvxvxvxvxvxv' // App password - replace with actual app password
        }
      });

      // Send email with alternative transport
      const info = await alternativeTransport.sendMail(mailOptions);

      console.log('Email sent successfully with alternative configuration!');
      console.log('Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        alternativeConfig: true
      };
    } catch (alternativeError) {
      console.error('Alternative email configuration also failed:', alternativeError.message);

      // Return detailed error information
      return {
        success: false,
        error: error.message,
        alternativeError: alternativeError.message,
        errorDetails: {
          code: error.code,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode
        },
        fallback: true,
        messageId: `fallback-${Date.now()}`
      };
    }
  }
};

// Store email records in memory (could be replaced with database storage in production)
const emailRecords = [];

// Function to store email record
const storeEmailRecord = (record) => {
  emailRecords.push(record);

  // Limit the number of records stored in memory
  if (emailRecords.length > 100) {
    emailRecords.shift();
  }
};

// Function to get email records
export const getEmailRecords = () => {
  return [...emailRecords];
};

// Initialize email service
export const initEmailService = async () => {
  // Verify email transport
  const isVerified = await verifyEmailTransport();

  // Return email service status
  return {
    isVerified,
    config: {
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      user: EMAIL_CONFIG.auth.user
    }
  };
};

export default {
  sendEmail,
  verifyEmailTransport,
  getEmailRecords,
  initEmailService
};
