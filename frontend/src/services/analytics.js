const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 measurement ID

// Analytics events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  BROCHURE_REQUEST: 'brochure_request',
  CONTACT_FORM: 'contact_form',
  ERROR: 'error'
};

// Initialize GA
export const initializeGA = () => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID);
};

// Track events
export const trackEvent = ({ action, category, label, value }) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  });
};

export default {
  initializeGA,
  trackEvent,
  ANALYTICS_EVENTS
};