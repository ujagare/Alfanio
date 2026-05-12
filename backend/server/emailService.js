/**
 * Email service for Alfanio website
 * Provides email functionality with fallback mechanisms
 */

import nodemailer from 'nodemailer';

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

// Create mail transport
const createMailTransport = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Log email configuration status
  // console.log(`Configuring email transport for ${isProduction ? 'production' : 'development'} environment`);  // [removed by fix script]

  if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
  // console.warn('Email credentials missing. Set EMAIL_USER and EMAIL_PASS to enable email delivery.');  // [removed by fix script]
    return null;
  }

  // Set up email transport configuration from environment
  const transportConfig = {
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: {
      user: EMAIL_CONFIG.auth.user,
      pass: EMAIL_CONFIG.auth.pass
    },
    debug: process.env.NODE_ENV !== 'production',
    logger: process.env.NODE_ENV !== 'production'
  };

  // console.log('Email transport configuration:', {  // [removed by fix script]
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
      if (!mailTransport) {
  // console.warn('Email transport is not configured.');  // [removed by fix script]
        return false;
      }

      await mailTransport.verify();
  // console.log('Email server is ready');  // [removed by fix script]
      return true;
    } catch (error) {
      currentRetry++;
  // console.error(`Email verification failed (attempt ${currentRetry}/${retries}):`, error.message);  // [removed by fix script]

      if (currentRetry >= retries) {
  // console.error('Maximum email verification retries reached.');  // [removed by fix script]
  // console.log('Continuing server operation despite email verification failure.');  // [removed by fix script]

        // Log detailed error information for debugging
  // console.log('Email configuration:', {  // [removed by fix script]
          host: EMAIL_CONFIG.host,
          port: EMAIL_CONFIG.port,
          secure: EMAIL_CONFIG.secure,
          user: EMAIL_CONFIG.auth.user
        });

        // Log additional troubleshooting information
  // console.log('Email troubleshooting tips:');  // [removed by fix script]
  // console.log('1. Check if the Gmail account has "Less secure app access" enabled');  // [removed by fix script]
  // console.log('2. If using 2FA, make sure to use an App Password instead of regular password');  // [removed by fix script]
  // console.log('3. Check if there are any network restrictions blocking SMTP connections');  // [removed by fix script]
  // console.log('4. Try sending a test email directly to verify credentials');  // [removed by fix script]

        return false;
      }

      // Wait before next retry
  // console.log(`Waiting ${delay}ms before next email verification attempt...`);  // [removed by fix script]
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

  // console.log('Attempting to send email to:', options.to);  // [removed by fix script]
  // console.log('Email subject:', options.subject);  // [removed by fix script]

  try {
  // console.log('Creating direct Gmail transport...');  // [removed by fix script]

    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      throw new Error('Email configuration missing: EMAIL_USER and EMAIL_PASS are required');
    }

    // Create a direct transport from environment settings
    const transport = nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: {
        user: EMAIL_CONFIG.auth.user,
        pass: EMAIL_CONFIG.auth.pass
      },
      debug: process.env.NODE_ENV !== 'production',
      logger: process.env.NODE_ENV !== 'production'
    });

  // console.log('Verifying connection...');  // [removed by fix script]
    await transport.verify();
  // console.log('Connection verified successfully');  // [removed by fix script]

  // console.log('Sending email...');  // [removed by fix script]
  // console.log('Mail options:', {  // [removed by fix script]
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Send email
    const info = await transport.sendMail(mailOptions);

  // console.log('Email sent successfully!');  // [removed by fix script]
  // console.log('Message ID:', info.messageId);  // [removed by fix script]
  // console.log('Response:', info.response);  // [removed by fix script]
  // console.log('Accepted:', info.accepted);  // [removed by fix script]

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted
    };
  } catch (error) {
  // console.error('Email sending failed:', error.message);  // [removed by fix script]
  // console.error('Error details:', error);  // [removed by fix script]

    // Log detailed error information
  // if (error.code) console.error('Error code:', error.code);  // [removed by fix script]
  // if (error.command) console.error('SMTP command that failed:', error.command);  // [removed by fix script]
  // if (error.response) console.error('SMTP server response:', error.response);  // [removed by fix script]
  // if (error.responseCode) console.error('SMTP response code:', error.responseCode);  // [removed by fix script]

    // Try with alternative configuration if first attempt fails
    try {
  // console.log('Trying alternative email configuration with port 465...');  // [removed by fix script]

      // Create alternative transport with different settings
      const alternativeTransport = nodemailer.createTransport({
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        secure: EMAIL_CONFIG.secure,
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
      });

  // console.log('Verifying alternative connection...');  // [removed by fix script]
      await alternativeTransport.verify();
  // console.log('Alternative connection verified successfully');  // [removed by fix script]

  // console.log('Sending email with alternative transport...');  // [removed by fix script]

      // Send email with alternative transport
      const info = await alternativeTransport.sendMail(mailOptions);

  // console.log('Email sent successfully with alternative configuration!');  // [removed by fix script]
  // console.log('Message ID:', info.messageId);  // [removed by fix script]
  // console.log('Response:', info.response);  // [removed by fix script]
  // console.log('Accepted:', info.accepted);  // [removed by fix script]

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        alternativeConfig: true
      };
    } catch (alternativeError) {
  // console.error('Alternative email configuration also failed:', alternativeError.message);  // [removed by fix script]
  // console.error('Alternative error details:', alternativeError);  // [removed by fix script]

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
