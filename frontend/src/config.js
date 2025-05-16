// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://alfanio-backend.onrender.com';
export const BROCHURE_URL = import.meta.env.VITE_BROCHURE_URL || '/api/contact/brochure';
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

// Company Information
export const COMPANY_INFO = {
  name: import.meta.env.VITE_APP_NAME || 'Alfanio',
  email: import.meta.env.VITE_CONTACT_EMAIL || 'alfanioindia@gmail.com',
  phone: import.meta.env.VITE_CONTACT_PHONE || '+91 9822055367',
  address: import.meta.env.VITE_CONTACT_ADDRESS || 'Gat No. 1559, Chikhali, Pune, Maharashtra, India',
  socials: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || 'https://www.facebook.com/alfanioindia',
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM || 'https://www.instagram.com/alfanioindia',
    linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN || 'https://www.linkedin.com/company/alfanioindia',
    youtube: import.meta.env.VITE_SOCIAL_YOUTUBE || 'https://www.youtube.com/channel/alfanioindia',
    whatsapp: `https://wa.me/${import.meta.env.VITE_CONTACT_PHONE?.replace(/\+|\s/g, '') || '919822055367'}`
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  contact: `${API_URL}/contact`,  // Use direct endpoint without /api prefix
  brochure: `${API_URL}/contact/brochure`,  // Use direct endpoint without /api prefix
  brochureDownload: `${API_URL}/brochure/download`,  // Direct brochure download endpoint
  health: `${API_URL}/api/health`
};

// Environment settings
export const ENV = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  productionDomain: import.meta.env.VITE_PRODUCTION_DOMAIN || 'https://alfanio.in'
};

// Feature flags
export const FEATURES = {
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  enableContactForm: import.meta.env.VITE_ENABLE_CONTACT_FORM !== 'false',
  enableBrochureForm: import.meta.env.VITE_ENABLE_BROCHURE_FORM !== 'false',
  enableAnimations: import.meta.env.VITE_ENABLE_ANIMATIONS !== 'false',
  enablePrefetching: import.meta.env.VITE_ENABLE_PREFETCHING === 'true',
  enablePreloading: import.meta.env.VITE_ENABLE_PRELOADING === 'true',
  enableLazyLoading: import.meta.env.VITE_ENABLE_LAZY_LOADING !== 'false'
};

// Map configuration
export const MAP_CONFIG = {
  centerLat: parseFloat(import.meta.env.VITE_MAP_CENTER_LAT || '18.6725'),
  centerLng: parseFloat(import.meta.env.VITE_MAP_CENTER_LNG || '73.8092'),
  zoom: parseInt(import.meta.env.VITE_MAP_ZOOM || '15', 10)
};

// Default export with all configurations
export default {
  API_URL,
  BROCHURE_URL,
  API_TIMEOUT,
  COMPANY_INFO,
  API_ENDPOINTS,
  ENV,
  FEATURES,
  MAP_CONFIG
};