import nodemailer from 'nodemailer';
import winston from 'winston';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Configure Winston logger specifically for email service
const emailLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'email-errors.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join('logs', 'email-service.log')
    })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  emailLogger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
    this.failedEmails = new Map();
    this.retryQueue = [];
    this.retryInterval = null;
    this.healthCheckInterval = null;
  }

  async initialize() {
    try {
      // Log email configuration for debugging
      emailLogger.info('Email configuration:', {
        EMAIL_USER: process.env.EMAIL_USER || 'Not set',
        EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'Not set',
        EMAIL_HOST: process.env.EMAIL_HOST || 'Not set',
        EMAIL_PORT: process.env.EMAIL_PORT || 'Not set',
        EMAIL_SECURE: process.env.EMAIL_SECURE || 'Not set',
        EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Not set'
      });

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER || 'alfanioindia@gmail.com',
          pass: process.env.EMAIL_PASS || 'yftofapopqvydrqa'
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        },
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,
        socketTimeout: 60000,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        debug: true, // Always enable debug for troubleshooting
        logger: true  // Always enable logger for troubleshooting
      });

      await this.transporter.verify();
      this.isInitialized = true;
      emailLogger.info('Email service initialized successfully');

      // Start health checks and retry mechanism
      this.startHealthCheck();
      this.startRetryMechanism();

      return true;
    } catch (error) {
      emailLogger.error('Failed to initialize email service:', error);
      return false;
    }
  }

  async sendEmail(emailData) {
    try {
      if (!this.isInitialized) {
        emailLogger.info('Email service not initialized, attempting to initialize...');
        const success = await this.initialize();
        if (!success) {
          throw new Error('Failed to initialize email service');
        }
      }

      emailLogger.info('Attempting to send email:', { to: emailData.to, subject: emailData.subject });

      // Generate a unique message ID for tracking
      const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      // Add attachments if specified
      let attachments = [];
      if (emailData.attachments) {
        attachments = emailData.attachments;
      }

      // For brochure requests, try to attach the brochure
      if (emailData.subject && emailData.subject.includes('Brochure')) {
        try {
          // Try multiple locations for the brochure file
          const fs = await import('fs');
          const path = await import('path');
          const __dirname = path.dirname(new URL(import.meta.url).pathname);

          const possiblePaths = [
            path.join(__dirname, '../../assets/brochure.pdf'),
            path.join(__dirname, '../../assets/Alfanio.pdf'),
            path.join(__dirname, '../../../public/brochure.pdf'),
            path.join(__dirname, '../../../frontend/public/brochure.pdf')
          ];

          // Find the first existing file
          let brochurePath = null;
          for (const p of possiblePaths) {
            try {
              if (fs.existsSync(p)) {
                brochurePath = p;
                break;
              }
            } catch (err) {
              emailLogger.warn(`Error checking path ${p}:`, err);
            }
          }

          if (brochurePath) {
            emailLogger.info(`Found brochure at: ${brochurePath}`);
            attachments.push({
              filename: 'Alfanio-Brochure.pdf',
              path: brochurePath
            });
          } else {
            emailLogger.warn('Brochure file not found in any location');
          }
        } catch (attachError) {
          emailLogger.error('Error attaching brochure:', attachError);
        }
      }

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Alfanio India',
          address: process.env.EMAIL_USER || 'alfanioindia@gmail.com'
        },
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        messageId: messageId,
        attachments: attachments
      };

      // Log detailed information before sending
      emailLogger.info('Email options:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        from: mailOptions.from,
        messageId: messageId,
        hasAttachments: attachments.length > 0
      });

      // Try to send the email
      const result = await this.transporter.sendMail(mailOptions);

      emailLogger.info('Email sent successfully:', {
        messageId: result.messageId,
        response: result.response
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      emailLogger.error('Failed to send email:', error);

      // Add to retry queue with generated message ID if not provided
      const messageId = emailData.messageId || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      this.addToRetryQueue(messageId, emailData);

      return {
        success: false,
        error: error.message,
        queued: true,
        messageId: messageId
      };
    }
  }

  async saveEmailRecord(record) {
    try {
      const logsDir = path.join(__dirname, '..', 'logs', 'emails');
      await fs.mkdir(logsDir, { recursive: true });

      const filePath = path.join(logsDir, `${record.messageId}.json`);
      await fs.writeFile(filePath, JSON.stringify(record, null, 2));
    } catch (error) {
      emailLogger.error('Failed to save email record:', error);
    }
  }

  addToRetryQueue(messageId, emailData) {
    this.retryQueue.push({
      messageId,
      emailData,
      attempts: 0,
      nextRetry: Date.now() + 60000 // First retry after 1 minute
    });
  }

  startRetryMechanism() {
    // Clear any existing interval
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }

    this.retryInterval = setInterval(async () => {
      const now = Date.now();
      const maxRetries = 5;

      for (let i = this.retryQueue.length - 1; i >= 0; i--) {
        const item = this.retryQueue[i];

        if (now >= item.nextRetry) {
          if (item.attempts >= maxRetries) {
            // Log permanent failure
            emailLogger.error('Email permanently failed after max retries', {
              messageId: item.messageId
            });
            this.retryQueue.splice(i, 1);
            continue;
          }

          try {
            const result = await this.transporter.sendMail(item.emailData);
            emailLogger.info('Retry successful', {
              messageId: item.messageId,
              attempt: item.attempts + 1
            });
            this.retryQueue.splice(i, 1);
          } catch (error) {
            item.attempts++;
            item.nextRetry = now + (Math.pow(2, item.attempts) * 60000); // Exponential backoff
            emailLogger.warn('Retry failed', {
              messageId: item.messageId,
              attempt: item.attempts,
              nextRetry: new Date(item.nextRetry)
            });
          }
        }
      }
    }, 60000); // Check retry queue every minute
  }

  startHealthCheck() {
    // Clear any existing interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.transporter.verify();
        emailLogger.info('Email service health check passed');
      } catch (error) {
        emailLogger.error('Email service health check failed:', error);
        // Try to reinitialize
        this.isInitialized = false;
        await this.initialize();
      }
    }, 300000); // Check every 5 minutes
  }

  async shutdown() {
    try {
      // Clear intervals
      if (this.retryInterval) clearInterval(this.retryInterval);
      if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);

      // Process remaining retry queue
      for (const item of this.retryQueue) {
        await this.saveEmailRecord({
          messageId: item.messageId,
          status: 'pending_retry',
          data: item.emailData,
          attempts: item.attempts,
          timestamp: new Date()
        });
      }

      if (this.transporter) {
        this.transporter.close();
      }
      emailLogger.info('Email service shut down successfully');
    } catch (error) {
      emailLogger.error('Error during email service shutdown:', error);
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;
