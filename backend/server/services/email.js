import nodemailer from 'nodemailer';
import logger from '../config/logger.js';
import BrochureRequest from '../models/BrochureRequest.js';

class EmailService {
    constructor() {
        this.transporter = null;
        this.isReady = false;
    }

    initialize() {
        try {
            // Log environment variables
            logger.info('Email configuration:', {
                EMAIL_USER: process.env.EMAIL_USER || 'Not set',
                EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'Not set',
                EMAIL_HOST: process.env.EMAIL_HOST || 'Not set',
                EMAIL_PORT: process.env.EMAIL_PORT || 'Not set',
                EMAIL_SECURE: process.env.EMAIL_SECURE || 'Not set',
                EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Not set'
            });

            // Check for required email configuration
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                logger.warn('Email configuration missing: EMAIL_USER and EMAIL_PASS are required. Email service will be disabled.');
                return;
            }

            const config = {
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    minVersion: 'TLSv1.2',
                    ciphers: 'HIGH:!aNULL:!MD5',
                    rejectUnauthorized: true
                },
                debug: process.env.NODE_ENV !== 'production',
                pool: true,
                maxConnections: 5,
                maxMessages: 100,
                rateDelta: 1000,
                rateLimit: 5
            };

            this.transporter = nodemailer.createTransport(config);
            
            logger.info('Email service initialized with config:', {
                service: config.service,
                host: config.host,
                port: config.port,
                secure: config.secure,
                user: config.auth.user,
                debug: config.debug,
                pool: config.pool
            });

            // Verify connection immediately
            this.verifyConnection().then(isReady => {
                if (isReady) {
                    logger.info('Email service ready');
                } else {
                    logger.warn('Email service not ready after initialization');
                }
            });
        } catch (error) {
            logger.error('Email service initialization failed:', error);
            this.isReady = false;
        }
    }

    async verifyConnection() {
        try {
            if (!this.transporter) {
                logger.warn('Email service not initialized');
                return false;
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

    async sendEmail({ to, subject, html, attachments }) {
        if (!this.transporter) {
            throw new Error('Email service not initialized. Please check your email configuration.');
        }

        if (!this.isReady) {
            const isReady = await this.verifyConnection();
            if (!isReady) {
                throw new Error('Email service is not ready. Please check your email configuration.');
            }
        }

        const retries = 3;
        let lastError;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const mailOptions = {
                    from: `"${process.env.EMAIL_FROM_NAME || 'Alfanio Website'}" <${process.env.EMAIL_USER}>`,
                    to,
                    subject,
                    html,
                    attachments
                };

                logger.info('Sending email:', {
                    to: mailOptions.to,
                    subject: mailOptions.subject,
                    from: mailOptions.from
                });

                const info = await this.transporter.sendMail(mailOptions);
                logger.info('Email sent successfully:', {
                    messageId: info.messageId,
                    response: info.response
                });
                return { success: true, messageId: info.messageId };
            } catch (error) {
                lastError = error;
                logger.error(`Failed to send email (attempt ${attempt}/${retries}):`, {
                    error: error.message,
                    stack: error.stack,
                    attempt,
                    retries
                });
                
                if (attempt < retries) {
                    const delay = 1000 * attempt;
                    logger.info(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
            }
        }

        throw lastError;
    }

    async sendBrochureEmail(requestData) {
        try {
            // Save to MongoDB first
            const brochureRequest = new BrochureRequest({
                name: requestData.name,
                email: requestData.email,
                phone: requestData.phone
            });

            await brochureRequest.save();
            logger.info('Brochure request saved to database', { id: brochureRequest._id });

            // Send email with retries
            const emailResult = await this.sendEmail({
                to: requestData.email,
                subject: 'Your Alfanio Brochure Request',
                html: `
                    <h2>Thank you for requesting our brochure</h2>
                    <p>Dear ${requestData.name},</p>
                    <p>Please find attached our latest brochure.</p>
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <p>Best regards,<br>The Alfanio Team</p>
                `,
                attachments: [{
                    filename: 'Alfanio-Brochure.pdf',
                    path: '../assets/Alfanio.pdf'
                }]
            });

            // Update MongoDB record
            brochureRequest.emailSent = true;
            await brochureRequest.save();

            return { 
                success: true, 
                messageId: emailResult.messageId,
                requestId: brochureRequest._id
            };
        } catch (error) {
            logger.error('Failed to process brochure request:', error);
            throw error;
        }
    }
}

// Create singleton instance
const emailService = new EmailService();
emailService.initialize();
export default emailService;