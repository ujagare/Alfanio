/**
 * Offline synchronization utilities for Alfanio website
 * Handles storing form submissions locally and syncing them when online
 */

import { API_URL } from '../config';

/**
 * Sync all stored form submissions when online
 * @returns {Promise<{success: boolean, synced: number, failed: number, details: Array}>}
 */
export const syncOfflineSubmissions = async () => {
  // Check if online
  if (!navigator.onLine) {
    console.log('Cannot sync offline submissions: device is offline');
    return {
      success: false,
      synced: 0,
      failed: 0,
      details: []
    };
  }

  // Get stored brochure requests
  let brochureRequests = [];
  try {
    brochureRequests = JSON.parse(localStorage.getItem('brochureRequests') || '[]');
  } catch (error) {
    console.error('Error parsing stored brochure requests:', error);
  }

  // Get stored contact form submissions
  let contactSubmissions = [];
  try {
    contactSubmissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
  } catch (error) {
    console.error('Error parsing stored contact submissions:', error);
  }

  // Filter only unprocessed submissions
  const unprocessedBrochureRequests = brochureRequests.filter(req => !req.processed);
  const unprocessedContactSubmissions = contactSubmissions.filter(sub => !sub.processed);

  // Results tracking
  const results = {
    success: true,
    synced: 0,
    failed: 0,
    details: []
  };

  // Sync brochure requests
  for (const request of unprocessedBrochureRequests) {
    try {
      const response = await fetch(`${API_URL}/api/contact/brochure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      // Mark as processed
      request.processed = true;
      results.synced++;
      results.details.push({
        type: 'brochure',
        email: request.email,
        status: 'synced',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing brochure request:', error);
      results.failed++;
      results.details.push({
        type: 'brochure',
        email: request.email,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Sync contact form submissions
  for (const submission of unprocessedContactSubmissions) {
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      // Mark as processed
      submission.processed = true;
      results.synced++;
      results.details.push({
        type: 'contact',
        email: submission.email,
        status: 'synced',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing contact submission:', error);
      results.failed++;
      results.details.push({
        type: 'contact',
        email: submission.email,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Update localStorage with processed status
  try {
    localStorage.setItem('brochureRequests', JSON.stringify(brochureRequests));
    localStorage.setItem('contactSubmissions', JSON.stringify(contactSubmissions));
  } catch (error) {
    console.error('Error updating localStorage after sync:', error);
    results.success = false;
  }

  console.log('Sync results:', results);
  return results;
};

/**
 * Save contact form submission for offline processing
 * @param {Object} formData - Form data to save
 * @returns {boolean} - Whether the save was successful
 */
export const saveContactSubmission = (formData) => {
  try {
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    submissions.push({
      ...formData,
      timestamp: new Date().toISOString(),
      processed: false
    });
    localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    return true;
  } catch (error) {
    console.error('Error saving contact submission to localStorage:', error);
    return false;
  }
};

/**
 * Save brochure request for offline processing
 * @param {Object} formData - Form data to save
 * @returns {boolean} - Whether the save was successful
 */
export const saveBrochureRequest = (formData) => {
  try {
    const requests = JSON.parse(localStorage.getItem('brochureRequests') || '[]');
    requests.push({
      ...formData,
      timestamp: new Date().toISOString(),
      processed: false
    });
    localStorage.setItem('brochureRequests', JSON.stringify(requests));
    return true;
  } catch (error) {
    console.error('Error saving brochure request to localStorage:', error);
    return false;
  }
};

/**
 * Get pending submission counts
 * @returns {Object} - Counts of pending submissions
 */
export const getPendingSubmissionCounts = () => {
  let brochureCount = 0;
  let contactCount = 0;

  try {
    const brochureRequests = JSON.parse(localStorage.getItem('brochureRequests') || '[]');
    brochureCount = brochureRequests.filter(req => !req.processed).length;
  } catch (error) {
    console.error('Error counting pending brochure requests:', error);
  }

  try {
    const contactSubmissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    contactCount = contactSubmissions.filter(sub => !sub.processed).length;
  } catch (error) {
    console.error('Error counting pending contact submissions:', error);
  }

  return {
    brochure: brochureCount,
    contact: contactCount,
    total: brochureCount + contactCount
  };
};

/**
 * Set up automatic sync when online
 */
export const setupOfflineSync = () => {
  // Sync when coming back online
  window.addEventListener('online', () => {
    console.log('Device is now online. Attempting to sync offline submissions...');
    syncOfflineSubmissions();
  });

  // Initial sync if online
  if (navigator.onLine) {
    const pendingCounts = getPendingSubmissionCounts();
    if (pendingCounts.total > 0) {
      console.log(`Found ${pendingCounts.total} pending submissions. Attempting to sync...`);
      syncOfflineSubmissions();
    }
  }
};

export default {
  syncOfflineSubmissions,
  saveContactSubmission,
  saveBrochureRequest,
  getPendingSubmissionCounts,
  setupOfflineSync
};
