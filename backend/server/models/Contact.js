const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address'],
    index: true // Add index for faster queries
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['contact', 'brochure'],
    default: 'contact',
    index: true // Add index for faster filtering
  },
  downloadTime: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Add index for sorting
  }
}, {
  timestamps: true // Adds updatedAt field automatically
});

// Add compound index for common queries
contactSchema.index({ type: 1, createdAt: -1 });

// Add instance method for formatting phone numbers
contactSchema.methods.formatPhone = function() {
  if (!this.phone) return '';
  return this.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

module.exports = mongoose.model('Contact', contactSchema);