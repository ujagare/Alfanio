import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async verify() {
        try {
            await this.transporter.verify();
            logger.info('Email service ready');
            return true;
        } catch (error) {
            logger.error('Email service verification failed:', error);
            return false;
        }
    }

    async sendMail(options) {
        try {
            const result = await this.transporter.sendMail(options);
            logger.info('Email sent successfully:', { messageId: result.messageId });
            return result;
        } catch (error) {
            logger.error('Failed to send email:', error);
            throw error;
        }
    }
}

const emailService = new EmailService();
export default emailService;