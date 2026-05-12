import config from '../config';
const GA_TRACKING_ID = config.ENV.isProd ? import.meta.env.VITE_GA_TRACKING_ID : 'G-XXXXXXXXXX';

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

  // Check if analytics is enabled in config
  const isAnalyticsEnabled = config.FEATURES.enableAnalytics;

  // Skip initialization if analytics is disabled
  if (!isAnalyticsEnabled && config.ENV.isDev) {
  // console.log('Analytics disabled in development mode');  // [removed by fix script]
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID, {
    send_page_view: false, // We'll handle page views manually
    anonymize_ip: true,    // Anonymize IP addresses
    cookie_flags: 'SameSite=None;Secure', // Set secure cookies
    cookie_domain: config.ENV.productionDomain || window.location.hostname
  });

  // console.log(`Analytics initialized with tracking ID: ${GA_TRACKING_ID}`);  // [removed by fix script]
};

// Track events
export const trackEvent = ({ action, category, label, value }) => {
  if (typeof window === 'undefined') return;

  // Check if analytics is enabled in config
  const isAnalyticsEnabled = config.FEATURES.enableAnalytics;

  // Skip tracking if analytics is disabled
  if (!isAnalyticsEnabled && config.ENV.isDev) {
  // console.log(`[Analytics Disabled] Event: ${action}, Category: ${category}, Label: ${label}`);  // [removed by fix script]
    return;
  }

  // Check if gtag is available
  if (!window.gtag) {
  // console.warn('Google Analytics not initialized');  // [removed by fix script]
    return;
  }

  // Track the event
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    non_interaction: action === ANALYTICS_EVENTS.PAGE_VIEW // Page views are non-interactive
  });

  // Log in development mode
  if (config.ENV.isDev) {
  // console.log(`[Analytics] Event: ${action}, Category: ${category}, Label: ${label}`);  // [removed by fix script]
  }
};

export default {
  initializeGA,
  trackEvent,
  ANALYTICS_EVENTS
};