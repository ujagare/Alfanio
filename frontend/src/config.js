// Environment variables
export const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5001'
    : window.location.hostname.includes('devtunnels.ms')
      ? `${window.location.protocol}//${window.location.hostname}`
      : `http://${window.location.hostname}:5001`);
export const BROCHURE_URL = import.meta.env.VITE_BROCHURE_URL || '/api/contact/brochure';

// Company Information
export const COMPANY_INFO = {
  name: 'Alfanio Limited',
  email: 'info@alfanio.com',
  phone: '+254 123 456 789',
  socials: {
    facebook: 'https://facebook.com/alfanio',
    instagram: 'https://instagram.com/alfanio',
    whatsapp: 'https://wa.me/254123456789',
    youtube: 'https://youtube.com/alfanio'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  contact: `/api/contact`,
  brochure: `/api/contact/brochure`,
  health: `/api/health`
};

// Environment settings
export const ENV = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE
};

// Default export with all configurations
export default {
  API_URL,
  BROCHURE_URL,
  COMPANY_INFO,
  API_ENDPOINTS,
  ENV
};