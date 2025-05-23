/**
 * Web Server for Alfanio
 *
 * This server serves both the frontend website and API endpoints
 * Run with: node webServer.js
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE === 'true' || true,
  auth: {
    user: process.env.EMAIL_USER || 'alfanioindia@gmail.com',
    pass: process.env.EMAIL_PASS || 'ogwoqwpovqfcgacz' // App password from 2-step verification
  },
  from: `${process.env.EMAIL_FROM_NAME || 'Alfanio India'} <${process.env.EMAIL_USER || 'alfanioindia@gmail.com'}>`,
  to: process.env.EMAIL_TO || 'alfanioindia@gmail.com'
};

// Create email transport
const createTransport = () => {
  // First try with detailed configuration
  try {
    return nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: {
        user: EMAIL_CONFIG.auth.user,
        pass: EMAIL_CONFIG.auth.pass
      },
      debug: true,
      logger: true
    });
  } catch (error) {
    console.error('Error creating detailed transport:', error);

    // Fall back to simple Gmail service configuration
    try {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        }
      });
    } catch (fallbackError) {
      console.error('Error creating fallback transport:', fallbackError);
      throw new Error('Failed to create email transport');
    }
  }
};

// Send email function
const sendEmail = async (options) => {
  // Try multiple methods to send email
  const methods = [
    // Method 1: Standard SMTP
    async () => {
      console.log('Trying email method 1: Standard SMTP...');
      const transport = nodemailer.createTransport({
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        secure: EMAIL_CONFIG.secure,
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        }
      });

      return await transport.sendMail({
        from: EMAIL_CONFIG.from,
        to: options.to || EMAIL_CONFIG.to,
        subject: options.subject || 'Test Email from Alfanio',
        html: options.html || '<h1>This is a test email</h1>'
      });
    },

    // Method 2: Gmail service
    async () => {
      console.log('Trying email method 2: Gmail service...');
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        }
      });

      return await transport.sendMail({
        from: EMAIL_CONFIG.from,
        to: options.to || EMAIL_CONFIG.to,
        subject: options.subject || 'Test Email from Alfanio',
        html: options.html || '<h1>This is a test email</h1>'
      });
    },

    // Method 3: Gmail with TLS options
    async () => {
      console.log('Trying email method 3: Gmail with TLS options...');
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      return await transport.sendMail({
        from: EMAIL_CONFIG.from,
        to: options.to || EMAIL_CONFIG.to,
        subject: options.subject || 'Test Email from Alfanio',
        html: options.html || '<h1>This is a test email</h1>'
      });
    },

    // Method 4: Direct SMTP with port 587
    async () => {
      console.log('Trying email method 4: Direct SMTP with port 587...');
      const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: EMAIL_CONFIG.auth.user,
          pass: EMAIL_CONFIG.auth.pass
        },
        requireTLS: true
      });

      return await transport.sendMail({
        from: EMAIL_CONFIG.from,
        to: options.to || EMAIL_CONFIG.to,
        subject: options.subject || 'Test Email from Alfanio',
        html: options.html || '<h1>This is a test email</h1>'
      });
    }
  ];

  // Try each method until one succeeds
  let lastError = null;

  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Attempting to send email using method ${i + 1}/${methods.length}...`);
      console.log('Sending to:', options.to || EMAIL_CONFIG.to);
      console.log('Subject:', options.subject || 'Test Email from Alfanio');

      const info = await methods[i]();

      console.log(`Email sent successfully using method ${i + 1}:`, info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        method: i + 1
      };
    } catch (error) {
      console.error(`Method ${i + 1} failed:`, error.message);
      lastError = error;
    }
  }

  // If all methods fail, return error
  console.error('All email sending methods failed');

  return {
    success: false,
    error: lastError ? lastError.message : 'Unknown error'
  };
};

// Serve static files from multiple possible locations
const staticPaths = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, '../frontend/build'),
  path.join(__dirname, 'public')
];

// Find existing directories and serve static files from them
staticPaths.forEach(staticPath => {
  if (fs.existsSync(staticPath)) {
    console.log('Serving static files from:', staticPath);
    app.use(express.static(staticPath));
  }
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'API is running',
    endpoints: {
      test: '/api/test',
      sendEmail: '/api/send-email',
      brochure: '/api/contact/brochure',
      download: '/api/brochure/download'
    }
  });
});

// Root endpoint - serve website instead of API response
app.get('/', (req, res) => {
  // Check multiple possible locations for index.html
  const possiblePaths = [
    path.join(__dirname, 'dist/index.html'),
    path.join(__dirname, '../frontend/dist/index.html'),
    path.join(__dirname, '../frontend/build/index.html'),
    path.join(__dirname, 'public/index.html')
  ];

  // Find the first existing file
  const indexPath = possiblePaths.find(p => fs.existsSync(p));

  if (indexPath) {
    console.log('Serving frontend from root path:', indexPath);
    return res.sendFile(indexPath);
  }

  // If no index.html is found, serve a simple HTML page
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alfanio India</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        h1 {
          color: #FECC00;
          border-bottom: 2px solid #FECC00;
          padding-bottom: 10px;
        }
        .card {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn {
          display: inline-block;
          background: #FECC00;
          color: #000;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 10px;
        }
        .btn:hover {
          background: #e5b800;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to Alfanio India</h1>

      <div class="card">
        <h2>About Us</h2>
        <p>Alfanio India is a leading manufacturer of high-quality industrial products. We specialize in providing innovative solutions for various industries.</p>
      </div>

      <div class="card">
        <h2>Our Products</h2>
        <p>We offer a wide range of products designed to meet the highest standards of quality and performance.</p>
        <a href="/api/brochure/download" class="btn">Download Brochure</a>
      </div>

      <div class="card">
        <h2>Contact Us</h2>
        <p>For more information about our products and services, please contact us:</p>
        <p>Email: alfanioindia@gmail.com</p>
        <p>Phone: +91 XXXXXXXXXX</p>
      </div>

      <footer>
        <p>&copy; 2025 Alfanio India. All rights reserved.</p>
      </footer>
    </body>
    </html>
  `);
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    console.log('Received email request:', req.body);

    // Send email
    const emailResult = await sendEmail({
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong> ${message || 'Not provided'}</p>
      `
    });

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Email sent successfully',
        emailId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('API error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Brochure request endpoint
app.post('/api/contact/brochure', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    console.log('Received brochure request:', req.body);

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Send email
    const emailResult = await sendEmail({
      subject: 'New Brochure Request',
      html: `
        <h2>New Brochure Request</h2>
        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong> ${message || 'Not provided'}</p>
      `
    });

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Brochure request received and email sent successfully',
        emailId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('API error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Brochure download endpoint
app.get('/api/brochure/download', (req, res) => {
  // Try multiple locations for the brochure file
  const possiblePaths = [
    path.join(__dirname, 'assets/brochure.pdf'),
    path.join(__dirname, 'assets/Alfanio.pdf'),
    path.join(__dirname, '../public/brochure.pdf'),
    path.join(__dirname, '../dist/brochure.pdf'),
    path.join(__dirname, 'server/assets/brochure.pdf'),
    path.join(__dirname, 'server/assets/Alfanio.pdf')
  ];

  // Find the first existing file
  const brochurePath = possiblePaths.find(path => fs.existsSync(path));

  if (!brochurePath) {
    console.error('Brochure file not found in any location', possiblePaths);
    return res.status(404).send('Brochure file not found');
  }

  // Set appropriate headers for better mobile compatibility
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Alfanio-Brochure.pdf"');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

  // Get file stats for Content-Length header
  const stat = fs.statSync(brochurePath);
  res.setHeader('Content-Length', stat.size);

  console.log('Serving brochure from:', brochurePath);

  // Create a read stream and pipe it to the response
  const fileStream = fs.createReadStream(brochurePath);
  fileStream.pipe(res);
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Check multiple possible locations for index.html
  const possiblePaths = [
    path.join(__dirname, 'dist/index.html'),
    path.join(__dirname, '../frontend/dist/index.html'),
    path.join(__dirname, '../frontend/build/index.html'),
    path.join(__dirname, 'public/index.html')
  ];

  // Find the first existing file
  const indexPath = possiblePaths.find(path => fs.existsSync(path));

  if (indexPath) {
    console.log('Serving frontend from:', indexPath);
    return res.sendFile(indexPath);
  }

  // If no index.html is found, serve a simple HTML page
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alfanio India</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        h1 {
          color: #FECC00;
          border-bottom: 2px solid #FECC00;
          padding-bottom: 10px;
        }
        .card {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn {
          display: inline-block;
          background: #FECC00;
          color: #000;
          padding: 10px 20px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 10px;
        }
        .btn:hover {
          background: #e5b800;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to Alfanio India</h1>

      <div class="card">
        <h2>About Us</h2>
        <p>Alfanio India is a leading manufacturer of high-quality industrial products. We specialize in providing innovative solutions for various industries.</p>
      </div>

      <div class="card">
        <h2>Our Products</h2>
        <p>We offer a wide range of products designed to meet the highest standards of quality and performance.</p>
        <a href="/api/brochure/download" class="btn">Download Brochure</a>
      </div>

      <div class="card">
        <h2>Contact Us</h2>
        <p>For more information about our products and services, please contact us:</p>
        <p>Email: alfanioindia@gmail.com</p>
        <p>Phone: +91 XXXXXXXXXX</p>
      </div>

      <footer>
        <p>&copy; 2025 Alfanio India. All rights reserved.</p>
      </footer>
    </body>
    </html>
  `);
});

// Start server
const PORT = 5005;

app.listen(PORT, () => {
  console.log(`Web server running on http://localhost:${PORT}`);
  console.log('Email configuration:');
  console.log('- Host:', EMAIL_CONFIG.host);
  console.log('- Port:', EMAIL_CONFIG.port);
  console.log('- Secure:', EMAIL_CONFIG.secure);
  console.log('- User:', EMAIL_CONFIG.auth.user);
  console.log('- From:', EMAIL_CONFIG.from);
  console.log('- To:', EMAIL_CONFIG.to);
});
