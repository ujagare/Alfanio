import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from '../config/logger.js';
import emailService from '../services/email.js';
import BrochureRequest from '../models/BrochureRequest.js';

// ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Download endpoint
router.get('/download', (req, res) => {
  const brochurePath = path.join(__dirname, '../../public/assets/Alfanio.pdf');
  
  if (!fs.existsSync(brochurePath)) {
    return res.status(404).json({
      success: false,
      message: 'Brochure not found'
    });
  }

  // Set headers to force download dialog
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Alfanio-Brochure.pdf"');
  res.setHeader('Content-Description', 'File Transfer');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Pragma', 'public');

  // Stream the file
  const fileStream = fs.createReadStream(brochurePath);
  fileStream.pipe(res);

  // Handle errors
  fileStream.on('error', (err) => {
    logger.error('Error streaming brochure:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error downloading brochure'
      });
    }
  });
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    logger.info('Processing brochure request', { email });

    // Validate request
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name and email' 
      });
    }

    // Save to MongoDB first
    const brochureRequest = new BrochureRequest({
      name,
      email,
      phone
    });

    await brochureRequest.save();
    logger.info('Brochure request saved to database', { id: brochureRequest._id });

    // Check if brochure exists
    const brochurePath = path.join(__dirname, '../../public/assets/Alfanio.pdf');
    const brochureExists = fs.existsSync(brochurePath);

    // Send email with retries
    const emailResult = await emailService.sendEmail({
      to: email,
      subject: 'Your Alfanio Brochure Request',
      html: `
        <h2>Thank you for requesting our brochure</h2>
        <p>Dear ${name},</p>
        ${brochureExists ? `
        <p>Please find attached our latest brochure. You can also download it directly from our website using the link below:</p>
        <p><a href="${process.env.CLIENT_URL}/api/brochure/download" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Download Brochure</a></p>
        ` : '<p>Our team will contact you shortly with the brochure information.</p>'}
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The Alfanio Team</p>
      `,
      ...(brochureExists && {
        attachments: [{
          filename: 'Alfanio-Brochure.pdf',
          path: brochurePath
        }]
      })
    });

    // Update MongoDB record
    brochureRequest.emailSent = true;
    await brochureRequest.save();

    res.json({ 
      success: true, 
      message: 'Brochure request processed successfully',
      messageId: emailResult.messageId,
      requestId: brochureRequest._id
    });

  } catch (error) {
    logger.error('Brochure request error:', error);
    
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
        ? 'Failed to process brochure request. Please try again.' 
        : error.message
    });
  }
});

export default router;
