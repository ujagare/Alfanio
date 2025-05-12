import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../services/analytics';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    analytics.initializeGA();
  }, []);

  useEffect(() => {
    // Track page views
    analytics.trackEvent({
      action: analytics.ANALYTICS_EVENTS.PAGE_VIEW,
      category: 'Navigation',
      label: location.pathname
    });
  }, [location]);

  return {
    trackEvent: analytics.trackEvent
  };
};