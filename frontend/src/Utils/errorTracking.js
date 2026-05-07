import * as Sentry from "@sentry/react";
// Note: In newer versions, BrowserTracing is included in @sentry/react
// Fallback to empty object if import fails
let BrowserTracing;
try {
  BrowserTracing = require("@sentry/tracing").BrowserTracing;
} catch (e) {
  console.warn("Could not import BrowserTracing from @sentry/tracing, using fallback");
  BrowserTracing = class BrowserTracing {
    constructor() {}
  };
}
import posthog from 'posthog-js';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST;
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;
const environment = import.meta.env.MODE;

export const initializeErrorTracking = () => {
  if (isProduction && SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment,
      beforeSend(event) {
        // Don't send events in development
        if (isDevelopment) {
          return null;
        }
        return event;
      },
    });
  }

  if (isProduction && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST || 'https://app.posthog.com',
    });
  }
};

export const trackError = (error, errorInfo = null) => {
  console.error('Error:', error);
  if (errorInfo) {
    console.error('Error Info:', errorInfo);
  }

  if (isProduction && SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: errorInfo,
    });
  }
};

export const trackEvent = (eventName, properties = {}) => {
  if (isProduction && POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  } else {
    console.log('Event Tracked:', eventName, properties);
  }
};

export const ErrorBoundary = Sentry.ErrorBoundary;
