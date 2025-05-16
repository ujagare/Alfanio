/**
 * Simple form handler utility for Alfanio
 * This utility handles form submissions without making API calls
 */

import { toast } from 'react-toastify';

// Store form submissions in local storage
const saveSubmission = (formData, formType) => {
  try {
    // Get existing submissions or initialize empty array
    const existingSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    
    // Add timestamp to submission
    const submission = {
      ...formData,
      type: formType,
      timestamp: new Date().toISOString(),
      id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Add to submissions array
    existingSubmissions.push(submission);
    
    // Save back to local storage
    localStorage.setItem('formSubmissions', JSON.stringify(existingSubmissions));
    
    console.log('Form submission saved to local storage:', submission);
    return true;
  } catch (error) {
    console.error('Failed to save form submission to local storage:', error);
    return false;
  }
};

// Handle contact form submission
export const handleContactForm = async (formData) => {
  try {
    // Save submission to local storage
    const saved = saveSubmission(formData, 'contact');
    
    if (saved) {
      // Show success message
      toast.success('✅ Thank you for your message! We will contact you shortly.');
      return { success: true };
    } else {
      throw new Error('Failed to save submission');
    }
  } catch (error) {
    console.error('Contact form error:', error);
    toast.error('❌ Something went wrong. Please try again later.');
    return { success: false, error: error.message };
  }
};

// Handle brochure form submission
export const handleBrochureForm = async (formData) => {
  try {
    // Save submission to local storage
    const saved = saveSubmission(formData, 'brochure');
    
    if (saved) {
      // Show success message
      toast.success('✅ Thank you for your interest! We\'ll process your request later. You can download the brochure now.');
      
      // Open brochure in new tab
      window.open('/brochure.pdf', '_blank');
      
      return { success: true };
    } else {
      throw new Error('Failed to save submission');
    }
  } catch (error) {
    console.error('Brochure form error:', error);
    toast.error('❌ Something went wrong. Please try again later.');
    return { success: false, error: error.message };
  }
};

// Get all form submissions
export const getFormSubmissions = () => {
  try {
    return JSON.parse(localStorage.getItem('formSubmissions') || '[]');
  } catch (error) {
    console.error('Failed to get form submissions:', error);
    return [];
  }
};

// Clear all form submissions
export const clearFormSubmissions = () => {
  try {
    localStorage.removeItem('formSubmissions');
    return true;
  } catch (error) {
    console.error('Failed to clear form submissions:', error);
    return false;
  }
};

export default {
  handleContactForm,
  handleBrochureForm,
  getFormSubmissions,
  clearFormSubmissions
};
