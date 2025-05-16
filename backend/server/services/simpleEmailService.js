/**
 * Simple Email Service for Alfanio
 * This is a simplified version of the email service that focuses only on the core functionality
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple logger function
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...data }));
};

class SimpleEmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  initialize() {
    try {
      // Log configuration
      log('info', 'Initializing simple email service');

      // Create transporter with hardcoded credentials
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'alfanioindia@gmail.com',
          pass: 'yftofapopqvydrqa'
        },
        tls: {
          rejectUnauthorized: false
        },
        debug: true,
        logger: true
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          log('error', 'Failed to verify email connection', { error: error.message });
          this.initialized = false;
        } else {
          log('info', 'Email service connection verified', { success });
          this.initialized = true;
        }
      });

      return true;
    } catch (error) {
      log('error', 'Failed to initialize email service', { error: error.message });
      return false;
    }
  }

  async sendEmail(options) {
    try {
      // Initialize if not already initialized
      if (!this.initialized) {
        this.initialize();
      }

      log('info', 'Sending email', { to: options.to, subject: options.subject });

      // Prepare email options
      const mailOptions = {
        from: {
          name: 'Alfanio India',
          address: 'alfanioindia@gmail.com'
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || '',
        attachments: options.attachments || []
      };

      // Try to send the email
      const info = await this.transporter.sendMail(mailOptions);
      
      log('info', 'Email sent successfully', { 
        messageId: info.messageId,
        response: info.response
      });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      log('error', 'Failed to send email', { error: error.message, stack: error.stack });
      return { success: false, error: error.message };
    }
  }

  async sendContactEmail(contactData) {
    try {
      const { name, email, phone, message } = contactData;
      
      log('info', 'Sending contact form email', { email });
      
      return await this.sendEmail({
        to: 'alfanioindia@gmail.com',
        subject: 'New Contact Form Submission',
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong> ${message}</p>
        `
      });
    } catch (error) {
      log('error', 'Failed to send contact email', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendBrochureEmail(brochureData) {
    try {
      const { name, email, phone } = brochureData;
      
      log('info', 'Sending brochure email', { email });
      
      // Try to find brochure file
      const possiblePaths = [
        path.join(__dirname, '../../assets/brochure.pdf'),
        path.join(__dirname, '../../assets/Alfanio.pdf'),
        path.join(__dirname, '../../../public/brochure.pdf'),
        '/opt/render/project/src/backend/assets/brochure.pdf',
        '/opt/render/project/src/backend/assets/Alfanio.pdf'
      ];
      
      let attachments = [];
      let brochurePath = null;
      
      // Find the first existing file
      for (const p of possiblePaths) {
        try {
          if (fs.existsSync(p)) {
            brochurePath = p;
            log('info', 'Found brochure file', { path: p });
            break;
          }
        } catch (err) {
          log('warn', 'Error checking brochure path', { path: p, error: err.message });
        }
      }
      
      // Add attachment if found
      if (brochurePath) {
        attachments.push({
          filename: 'Alfanio-Brochure.pdf',
          path: brochurePath
        });
      }
      
      // Send email
      return await this.sendEmail({
        to: email,
        subject: 'Your Alfanio Brochure Request',
        html: `
          <h2>Thank you for requesting our brochure</h2>
          <p>Dear ${name},</p>
          <p>Thank you for your interest in Alfanio products.</p>
          ${brochurePath ? '<p>Please find attached our latest brochure.</p>' : 
            '<p>You can download our brochure from <a href="https://alfanio.onrender.com/brochure.pdf">here</a>.</p>'}
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>The Alfanio Team</p>
        `,
        attachments
      });
    } catch (error) {
      log('error', 'Failed to send brochure email', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const simpleEmailService = new SimpleEmailService();
simpleEmailService.initialize();

export default simpleEmailService;
