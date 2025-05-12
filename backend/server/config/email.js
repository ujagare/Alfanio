import nodemailer from 'nodemailer';
import logger from './logger.js';

class EmailService {
    constructor() {
        this.transporter = null;
        this.isReady = false;
        this.initialize();
    }

    initialize() {
        try {
            // Validate required email configuration
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                throw new Error('Email configuration missing: EMAIL_USER and EMAIL_PASS are required');
            }

            const config = {
                service: process.env.EMAIL_SERVICE || 'gmail',
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 465,
                secure: process.env.EMAIL_SECURE !== 'false',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    minVersion: 'TLSv1.2',
                    ciphers: 'HIGH:!aNULL:!MD5',
                    rejectUnauthorized: true
                },
                connectionTimeout: 20000, // 20 seconds connection timeout
                greetingTimeout: 20000,   // 20 seconds greeting timeout
                socketTimeout: 20000,     // 20 seconds socket timeout
                debug: process.env.NODE_ENV !== 'production',
                pool: true,               // Use connection pooling
                maxConnections: 5,        // Maximum number of connections
                maxMessages: 100,         // Maximum messages per connection
                rateDelta: 1000,         // Time window in milliseconds
                rateLimit: 5             // Max messages per time window
            };

            this.transporter = nodemailer.createTransport(config);
            logger.info('Email service initialized with config:', {
                ...config,
                auth: {
                    user: config.auth.user ? 'Set' : 'Not set',
                    pass: config.auth.pass ? 'Set' : 'Not set'
                }
            });
        } catch (error) {
            logger.error('Email service initialization failed:', error);
            throw error;
        }
    }

    async verifyConnection() {
        try {
            if (!this.transporter) {
                this.initialize();
            }
            await this.transporter.verify();
            this.isReady = true;
            logger.info('Email service connection verified');
            return true;
        } catch (error) {
            this.isReady = false;
            logger.error('Email service verification failed:', error);
            return false;
        }
    }

    async sendEmail(options) {
        if (!this.isReady) {
            await this.verifyConnection();
        }

        const retries = 3;
        let lastError;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const mailOptions = {
                    from: `"${process.env.EMAIL_FROM_NAME || 'Alfanio Website'}" <${process.env.EMAIL_USER}>`,
                    ...options
                };

                const info = await this.transporter.sendMail(mailOptions);
                logger.info('Email sent successfully:', info.messageId);
                return { success: true, messageId: info.messageId };
            } catch (error) {
                lastError = error;
                logger.error(`Failed to send email (attempt ${attempt}/${retries}):`, error);
                
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }
            }
        }

        throw lastError;
    }
}

// Create singleton instance
const emailService = new EmailService();
export default emailService;
