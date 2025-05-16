/**
 * Simple Contact Routes for Alfanio
 * This is a simplified version of the contact routes that uses the simple email service
 */

import { Router } from 'express';
import simpleEmailService from '../services/simpleEmailService.js';

const router = Router();

// Simple logger function
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...data }));
};

// Contact form endpoint
router.post('/', async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;
    
    log('info', 'Processing contact form submission', { email });

    // Validate request
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Send email using simple email service
    const emailResult = await simpleEmailService.sendContactEmail({
      name,
      email,
      phone,
      message
    });
    
    if (emailResult.success) {
      log('info', 'Contact email sent successfully', { messageId: emailResult.messageId });
      
      res.json({ 
        success: true, 
        message: 'Message sent successfully',
        messageId: emailResult.messageId
      });
    } else {
      throw new Error(emailResult.error || 'Failed to send email');
    }

  } catch (error) {
    log('error', 'Contact form error', { error: error.message });
    
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

// Brochure request endpoint
router.post('/brochure', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    
    log('info', 'Processing brochure request', { email });

    // Validate request
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name and email' 
      });
    }

    // Send brochure email using simple email service
    const emailResult = await simpleEmailService.sendBrochureEmail({
      name,
      email,
      phone,
      message
    });
    
    if (emailResult.success) {
      log('info', 'Brochure email sent successfully', { messageId: emailResult.messageId });
      
      res.json({ 
        success: true, 
        message: 'Brochure request processed successfully',
        messageId: emailResult.messageId
      });
    } else {
      throw new Error(emailResult.error || 'Failed to send brochure email');
    }

  } catch (error) {
    log('error', 'Brochure request error', { error: error.message });
    
    res.status(500).json({ 
      success: false, 
      message: process.env.NODE_ENV === 'production' 
        ? 'Failed to process brochure request. Please try again.' 
        : error.message
    });
  }
});

export default router;
