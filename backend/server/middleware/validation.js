const Joi = require('joi');

// Contact form validation schema
const contactSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),

  email: Joi.string()
    .email()
    .required()
    .trim()
    .lowercase()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 digits',
      'string.empty': 'Phone number is required'
    }),

  message: Joi.string()
    .min(4)
    .max(1000)
    .required()
    .trim()
    .messages({
      'string.empty': 'Message is required',
      'string.min': 'Message must be at least 2 characters long',
      'string.max': 'Message cannot exceed 1000 characters'
    }),

  type: Joi.string()
    .valid('contact', 'brochure')
    .default('contact')
});

// Validation middleware
const validateContact = (req, res, next) => {
  const { error } = contactSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateContact
};
