const rateLimit = require('express-rate-limit');
const { validate: validateEmail } = require('deep-email-validator');

// Rate limiter for email endpoints
const emailRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many email requests from this IP, please try again after 15 minutes'
});

// Email validation middleware
const validateEmailAddress = async (req, res, next) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        // Simple regex validation instead of deep-email-validator for faster response
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        next();
    } catch (error) {
        next(error);
    }
};

// Content security middleware
const sanitizeEmailContent = (req, res, next) => {
    const fields = ['name', 'email', 'phone', 'message', 'type'];
    
    fields.forEach(field => {
        if (req.body[field]) {
            // Remove any HTML tags
            req.body[field] = req.body[field].toString().replace(/<[^>]*>/g, '');
            
            // Trim whitespace
            req.body[field] = req.body[field].trim();
        }
    });

    next();
};

// Attachment security middleware
const validateAttachment = (req, res, next) => {
    const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_MIME_TYPES = ['application/pdf'];
    
    if (req.file) {
        if (req.file.size > MAX_ATTACHMENT_SIZE) {
            return res.status(400).json({
                success: false,
                message: 'Attachment size exceeds 10MB limit'
            });
        }
        
        if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Only PDF attachments are allowed'
            });
        }
    }
    
    next();
};

module.exports = {
    emailRateLimiter,
    validateEmailAddress,
    sanitizeEmailContent,
    validateAttachment
};
