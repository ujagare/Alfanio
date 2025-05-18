/**
 * Form handler utility for Alfanio
 * This utility handles form submissions with API calls
 */

import { toast } from 'react-toastify';
import { saveContactSubmission, saveBrochureRequest } from './offlineSync';
import { API_ENDPOINTS } from '../config';

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
    // Save submission to local storage as backup
    saveSubmission(formData, 'contact');

    // Make API call to server
    console.log('Sending contact form to API:', formData);

    const response = await fetch(API_ENDPOINTS.contact, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        type: 'contact',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Show success message
      toast.success('✅ Thank you for your message! We will contact you shortly.');

      // Track form submission event if analytics is available
      if (window.trackFormSubmission) {
        window.trackFormSubmission('contact', formData.product || '');
      }

      return { success: true };
    } else {
      throw new Error(result.message || 'Failed to send message');
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
    // Save submission to local storage as backup
    saveSubmission(formData, 'brochure');

    // Make API call to server
    console.log('Sending brochure form to API:', formData);

    const response = await fetch(API_ENDPOINTS.brochure, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        product: formData.product,
        type: 'brochure',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Show success message
      toast.success('✅ Thank you for your interest! Your brochure is ready for download.');

      // Track brochure download event if analytics is available
      if (window.trackBrochureDownload) {
        window.trackBrochureDownload(formData.product || 'General Brochure');
      }

      // Open brochure in new tab
      window.open(API_ENDPOINTS.brochureDownload, '_blank');

      return { success: true };
    } else {
      throw new Error(result.message || 'Failed to request brochure');
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
