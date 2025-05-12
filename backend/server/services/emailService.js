const nodemailer = require('nodemailer');
const winston = require('winston');
const path = require('path');
const fs = require('fs').promises;


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
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        debug: true,
        logger: true
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

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Alfanio Website Contact',
          address: process.env.EMAIL_USER
        },
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      emailLogger.info('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      emailLogger.error('Failed to send email:', error);
      // Add to retry queue
      if (emailData.messageId) {
        this.addToRetryQueue(emailData.messageId, emailData);
      }
      return { success: false, error: error.message };
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
module.exports = emailService;
