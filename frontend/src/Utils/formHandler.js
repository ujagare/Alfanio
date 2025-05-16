/**
 * Simple form handler utility for Alfanio
 * This utility handles form submissions without making API calls
 */

import { toast } from 'react-toastify';
import { saveContactSubmission, saveBrochureRequest } from './offlineSync';

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

      // Track form submission event if analytics is available
      if (window.trackFormSubmission) {
        window.trackFormSubmission('contact', formData.product || '');
      }

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
      toast.success('✅ Thank you for your interest! Your brochure is ready for download.');

      // Track brochure download event if analytics is available
      if (window.trackBrochureDownload) {
        window.trackBrochureDownload(formData.product || 'General Brochure');
      }

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

export default {
  handleContactForm,
  handleBrochureForm
};
