import { createServer } from 'vite';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import compression from 'compression';
import logger from '../../config/logger.js';
import emailService from '../../config/email.js';
import contactRouter from './contactRouter.js';
import { Router } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;
    
    logger.info('Processing contact form submission', { email });

    // Validate request
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Send email
    const emailResult = await emailService.sendEmail({
      to: process.env.EMAIL_TO || 'info@alfanio.com',
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      messageId: emailResult.messageId
    });

  } catch (error) {
    logger.error('Contact form error:', error);
    
    // Handle specific error types
    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      return res.status(408).json({
        success: false,
        message: 'Request timed out. Please try again.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'production' 
        ? 'Failed to send message. Please try again.' 
        : error.message
    });
  }
});

export default router;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5001;

  // Middleware
  app.use(cors());
  app.use(compression());
  app.use(express.json());

  try {
    if (process.env.NODE_ENV === 'development') {
      // Create Vite server in middleware mode
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });

      // Use vite's connect instance as middleware
      app.use(vite.middlewares);

      // API routes
      const apiRoutes = await import('./index.js');
      app.use('/api', apiRoutes.default);
    } else {
      // Production: serve built files
      app.use(express.static(path.join(__dirname, '../dist')));
      
      // API routes
      const apiRoutes = await import('./index.js');
      app.use('/api', apiRoutes.default);
      
      // Handle client-side routing
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
      });
    }

    app.use('/contact', contactRouter);
    app.use('/contact', router);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);