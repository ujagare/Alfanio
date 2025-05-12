import { Router } from 'express';
import logger from '../config/logger.js';
import emailService from '../services/email.js';

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
      to: process.env.EMAIL_TO || 'alfanioindia@gmail.com',
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
