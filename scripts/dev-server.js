import { createServer } from 'vite';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import nodemailer from 'nodemailer';
import winston from 'winston';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(rootDir, '.env') });

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Create a persistent email transport pool
let mailTransport = null;

const getMailTransport = async () => {
  if (mailTransport) {
    return mailTransport;
  }

  const config = {
    pool: true,
    maxConnections: 1,
    rateDelta: 1000,
    rateLimit: 3,
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_SECURE === 'true' || true,
    auth: {
      user: process.env.EMAIL_USER || 'alfanioindia@gmail.com',
      pass: process.env.EMAIL_PASS || 'yftofapopqvydrqa'
    },
    tls: {
      // Disable certificate validation in development mode
      rejectUnauthorized: false
    }
  };

  mailTransport = nodemailer.createTransport(config);

  try {
    await mailTransport.verify();
    logger.info('Email connection established');
    return mailTransport;
  } catch (error) {
    logger.error('Email connection failed:', error);
    mailTransport = null;
    throw error;
  }
};

// Initialize email transport
getMailTransport().catch(err => logger.error('Failed to initialize email transport:', err));

// Email sending function with retries
async function sendEmail(options) {
  const transport = await getMailTransport();

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      logger.info(`Sending email attempt ${attempt}/3...`);
      const info = await transport.sendMail({
        ...options,
        from: `${process.env.EMAIL_FROM_NAME || 'Alfanio India'} <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          Importance: 'high'
        }
      });
      logger.info('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      logger.error(`Email attempt ${attempt} failed:`, error);
      if (attempt === 3) throw error;
      await new Promise(resolve => setTimeout(resolve, attempt * 2000));
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 5001; // Using port 5001 as requested

  // Set trust proxy to fix express-rate-limit warning
  app.set('trust proxy', 1);

  // Check if --force flag is provided
  const forceStart = process.argv.includes('--force');

  if (forceStart) {
    console.log('Force starting server on port 5001...');

    // Try to find and kill any process using port 5001
    try {
      const { execSync } = await import('child_process');
      console.log('Checking for processes using port 5001...');

      // Find PIDs using port 5001
      const findCommand = 'netstat -ano | findstr :5001';
      const result = execSync(findCommand, { encoding: 'utf8' });

      // Extract PIDs
      const lines = result.split('\n').filter(line => line.trim());
      const pids = new Set();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          pids.add(pid);
        }
      }

      // Kill each PID
      for (const pid of pids) {
        if (pid && pid !== process.pid.toString()) {
          console.log(`Killing process with PID ${pid}...`);
          try {
            execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf8' });
          } catch (killError) {
            console.error(`Failed to kill process ${pid}:`, killError.message);
          }
        }
      }
    } catch (error) {
      console.error('Error while trying to free port 5001:', error.message);
    }
  }

  console.log('Starting combined server on port:', PORT);

  // Middleware
  app.use(cors({
    origin: '*', // Allow all origins for testing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
  }

  if (isProduction) {
    app.use(express.static(join(rootDir, 'dist')));
  } else {
    const vite = await createServer({
      root: rootDir,
      server: {
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100
        },
        port: 5173,
        strictPort: false,
        hmr: {
          port: 24679 // Changed from default 24678 to avoid conflicts
        }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  // API Routes
  app.post('/api/contact', async (req, res) => {
    try {
      console.log('Received contact form submission', req.body);
      const { name, email, phone, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Name, email and message are required'
        });
      }

      console.log('Sending email to admin');
      // Send email to admin
      await sendEmail({
        to: 'alfanioindia@gmail.com',
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      });

      console.log('Admin email sent successfully');

      // Send confirmation email to user
      await sendEmail({
        to: email,
        subject: 'Thank you for contacting Alfanio Ltd',
        html: `
          <h2>Thank you for contacting Alfanio Ltd</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you shortly.</p>
          <p>Your message details:</p>
          <p>${message}</p>
          <br>
          <p>Best regards,</p>
          <p>Alfanio Ltd Team</p>
        `
      });

      console.log('User confirmation email sent successfully');
      res.json({
        success: true,
        message: 'Message sent successfully! We will contact you soon.'
      });
    } catch (error) {
      console.error('Contact error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again.'
      });
    }
  });

  app.post('/api/contact/brochure', async (req, res) => {
    try {
      console.log('Received brochure request', req.body);
      const { name, email, phone, message } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email are required'
        });
      }

      console.log('Sending brochure request notification to admin');
      // Send email to admin
      await sendEmail({
        to: 'alfanioindia@gmail.com',
        subject: `New Brochure Request from ${name}`,
        html: `
          <h2>New Brochure Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          ${message ? `<p><strong>Message:</strong></p><p>${message}</p>` : ''}
        `
      });

      console.log('Admin notification email sent successfully');

      // Send brochure to user
      await sendEmail({
        to: email,
        subject: 'Alfanio Ltd - Your Requested Brochure',
        html: `
          <h2>Thank you for your interest in Alfanio Ltd</h2>
          <p>Dear ${name},</p>
          <p>Thank you for requesting our brochure. Please find it attached.</p>
          <p>If you have any questions, feel free to contact us.</p>
          <br>
          <p>Best regards,</p>
          <p>Alfanio Ltd Team</p>
        `,
        attachments: [
          {
            filename: 'Alfanio-Brochure.pdf',
            path: join(rootDir, 'public', 'brochure.pdf')
          }
        ]
      });

      console.log('Brochure email sent to user successfully');
      res.json({
        success: true,
        message: 'Brochure request received successfully. Check your email!'
      });
    } catch (error) {
      console.error('Brochure error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process brochure request. Please try again.'
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  });

  // Test email endpoint
  app.get('/api/test-email', async (req, res) => {
    try {
      logger.info('Testing email sending...');

      const testResult = await sendEmail({
        to: 'alfanioindia@gmail.com',
        subject: 'Test Email from Alfanio Website',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email to verify that the email sending functionality is working correctly.</p>
          <p>Time: ${new Date().toISOString()}</p>
        `
      });

      logger.info('Test email sent successfully');

      res.json({
        success: true,
        message: 'Test email sent successfully',
        result: testResult
      });
    } catch (error) {
      logger.error('Test email failed:', {
        error: error.message,
        stack: error.stack,
        code: error.code
      });

      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error.message
      });
    }
  });

  // CSRF token endpoint
  app.get('/api/csrf-token', (req, res) => {
    // For development, just return a dummy token
    res.json({ csrfToken: 'development-csrf-token' });
  });

  // Brochure download endpoint
  app.get('/api/brochure/download', (req, res) => {
    const brochurePath = join(rootDir, 'public', 'brochure.pdf');

    if (!fs.existsSync(brochurePath)) {
      logger.error('Brochure file not found', { path: brochurePath });
      return res.status(404).send('Brochure file not found');
    }

    logger.info('Serving brochure download', { path: brochurePath });
    res.download(brochurePath, 'Alfanio-Brochure.pdf', (err) => {
      if (err) {
        logger.error('Brochure download error', {
          error: err.message,
          stack: err.stack,
          path: brochurePath
        });
        res.status(500).send('Error downloading brochure');
      }
    });
  });

  // Fallback route handler for SPA
  app.get('*', (req, res) => {
    if (isProduction) {
      res.sendFile(join(rootDir, 'dist', 'index.html'));
    } else {
      res.status(404).send('Not found in development mode');
    }
  });

  // Start server
  const server = app.listen(PORT, () => {
    logger.info(`${isProduction ? 'Production' : 'Development'} server running at http://localhost:${PORT}`);
    logger.info(`Vite HMR WebSocket running on port 24679`);
    console.log(`\n\n===================================`);
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open your browser at http://localhost:${PORT}`);
    console.log(`===================================\n\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n\nERROR: Port ${PORT} is already in use!`);
      console.error(`Please close any applications using port ${PORT} and try again.`);
      console.error(`You can find what's using port ${PORT} with: netstat -ano | findstr :${PORT}`);
      console.error(`Then kill the process with: taskkill /F /PID <PID>\n\n`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

startServer().catch(error => {
  logger.error('Server startup error:', error);
  process.exit(1);
});