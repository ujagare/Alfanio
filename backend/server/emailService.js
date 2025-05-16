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
    pass: process.env.EMAIL_PASS || 'yftofapopqvydrqa'
  },
  from: `${process.env.EMAIL_FROM_NAME || 'Alfanio India'} <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
  to: process.env.EMAIL_TO || 'alfanioindia@gmail.com'
};

// Create mail transport
const createMailTransport = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Log email configuration status
  console.log(`Configuring email transport for ${isProduction ? 'production' : 'development'} environment`);

  // Set up email transport configuration
  const transportConfig = {
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: {
      user: EMAIL_CONFIG.auth.user,
      pass: EMAIL_CONFIG.auth.pass
    },
    // Always add TLS options for better security and compatibility
    tls: {
      rejectUnauthorized: false, // Set to false to avoid certificate validation issues
      minVersion: 'TLSv1.2'
    },
    // Add debug option for detailed logging
    debug: process.env.EMAIL_DEBUG === 'true',
    // Add logger for custom logging
    logger: true
  };

  // Add production-specific settings
  if (isProduction) {
    // Add connection pool for better performance in production
    transportConfig.pool = true;
    transportConfig.maxConnections = 5;
    transportConfig.maxMessages = 100;
  }

  // Try different authentication types if needed
  if (process.env.EMAIL_AUTH_TYPE === 'oauth2') {
    transportConfig.auth = {
      type: 'OAuth2',
      user: EMAIL_CONFIG.auth.user,
      clientId: process.env.EMAIL_OAUTH_CLIENT_ID,
      clientSecret: process.env.EMAIL_OAUTH_CLIENT_SECRET,
      refreshToken: process.env.EMAIL_OAUTH_REFRESH_TOKEN,
      accessToken: process.env.EMAIL_OAUTH_ACCESS_TOKEN,
      expires: parseInt(process.env.EMAIL_OAUTH_EXPIRES || '3600')
    };
  } else if (process.env.EMAIL_AUTH_TYPE === 'login') {
    transportConfig.auth = {
      type: 'login',
      user: EMAIL_CONFIG.auth.user,
      pass: EMAIL_CONFIG.auth.pass
    };
  }

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
export const sendEmail = async (mailOptions, retries = 2) => {
  let currentRetry = 0;

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

  // Set default from address if not provided
  if (!mailOptions.from) {
    mailOptions.from = EMAIL_CONFIG.from;
  }

  // Set default to address if not provided
  if (!mailOptions.to) {
    mailOptions.to = EMAIL_CONFIG.to;
  }

  // Log detailed email attempt for debugging
  console.log('Attempting to send email with the following configuration:');
  console.log('- To:', mailOptions.to);
  console.log('- Subject:', mailOptions.subject);
  console.log('- From:', mailOptions.from);
  console.log('- Transport config:', {
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
  });

  // Store email in memory for fallback
  const emailRecord = {
    to: mailOptions.to,
    from: mailOptions.from,
    subject: mailOptions.subject,
    html: mailOptions.html,
    text: mailOptions.text,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  // Try to send email
  while (currentRetry <= retries) {
    try {
      // Create a new transport for each attempt to avoid stale connections
      const freshTransport = createMailTransport();

      // Add debug logging for transport configuration
      console.log('Transport configuration for this attempt:', {
        host: freshTransport.options.host,
        port: freshTransport.options.port,
        secure: freshTransport.options.secure,
        auth: {
          user: freshTransport.options.auth.user,
          // Don't log the actual password
          pass: freshTransport.options.auth.pass ? '********' : 'not set'
        },
        tls: freshTransport.options.tls
      });

      // Send email
      const info = await freshTransport.sendMail(mailOptions);

      console.log('Email sent successfully:', info.messageId);
      console.log('Email accepted by:', info.accepted);
      console.log('Email response:', info.response);

      // Update email record
      emailRecord.status = 'sent';
      emailRecord.messageId = info.messageId;
      emailRecord.response = info.response;

      // Store email record for reference (could be saved to database in production)
      storeEmailRecord(emailRecord);

      return info;
    } catch (error) {
      currentRetry++;
      console.error(`Email sending failed (attempt ${currentRetry}/${retries + 1}):`, error.message);
      console.error('Error details:', error);

      // Try to get more detailed error information
      if (error.code) console.error('Error code:', error.code);
      if (error.command) console.error('SMTP command that failed:', error.command);
      if (error.response) console.error('SMTP server response:', error.response);
      if (error.responseCode) console.error('SMTP response code:', error.responseCode);

      if (currentRetry > retries) {
        // Log to database or monitoring system in production
        if (process.env.NODE_ENV === 'production') {
          console.error('Critical: Email sending failed after all retries', {
            to: mailOptions.to,
            subject: mailOptions.subject,
            error: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
          });
        }

        // Update email record
        emailRecord.status = 'failed';
        emailRecord.error = error.message;
        emailRecord.errorDetails = {
          code: error.code,
          command: error.command,
          response: error.response,
          responseCode: error.responseCode
        };

        // Store failed email record for reference (could be saved to database in production)
        storeEmailRecord(emailRecord);

        // Instead of throwing error, return a fallback response
        console.log('Email sending failed, but continuing operation');
        return {
          success: false,
          error: error.message,
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

      // Wait before retry with increasing delay
      const waitTime = 2000 * Math.pow(1.5, currentRetry - 1);
      console.log(`Waiting ${waitTime}ms before retry ${currentRetry + 1}...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
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
