/**
 * Analytics integration utilities with GDPR consent awareness
 *
 * This file provides helper functions to load analytics scripts only when
 * users have given proper consent. No tracking occurs without consent.
 *
 * Usage:
 * 1. Add analytics IDs to settings.json under "analytics" section
 * 2. Call initializeTracking() in App.tsx when consent changes
 * 3. Scripts will load automatically based on user preferences
 */

import type { ConsentPreferences } from '../types/gdpr';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Load Google Analytics 4
 * Only loads if user has consented to analytics cookies
 */
export function loadGoogleAnalytics(measurementId: string): void {
  // Check if already loaded
  if (window.gtag) {
    console.log('Google Analytics already loaded');
    return;
  }

  // Create script element
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer!.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true, // GDPR compliance: anonymize IP addresses
    cookie_flags: 'SameSite=None;Secure', // Cookie security
  });

  console.log(`Google Analytics loaded: ${measurementId}`);
}

/**
 * Load Facebook Pixel
 * Only loads if user has consented to marketing cookies
 */
export function loadFacebookPixel(pixelId: string): void {
  // Check if already loaded
  if (window.fbq) {
    console.log('Facebook Pixel already loaded');
    return;
  }

  // Facebook Pixel Code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function(...args: any[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );

  window.fbq!('init', pixelId);
  window.fbq!('track', 'PageView');

  console.log(`Facebook Pixel loaded: ${pixelId}`);
}

/**
 * Track custom event with Google Analytics
 */
export function trackEvent(eventName: string, params?: Record<string, any>): void {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/**
 * Track page view with Google Analytics
 */
export function trackPageView(path: string): void {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
}

/**
 * Track custom event with Facebook Pixel
 */
export function trackFacebookEvent(eventName: string, params?: Record<string, any>): void {
  if (window.fbq) {
    window.fbq('track', eventName, params);
  }
}

/**
 * Initialize tracking based on user consent preferences
 * Call this function whenever consent preferences change
 *
 * @param preferences User consent preferences
 * @param config Analytics configuration with measurement IDs
 *
 * Example config in settings.json:
 * {
 *   "analytics": {
 *     "googleAnalyticsId": "G-XXXXXXXXXX",
 *     "facebookPixelId": "1234567890"
 *   }
 * }
 */
export function initializeTracking(
  preferences: ConsentPreferences | null,
  config?: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  }
): void {
  if (!preferences || !config) {
    console.log('Analytics: No consent or config provided');
    return;
  }

  // Load Google Analytics if analytics consent given and ID provided
  if (preferences.analytics && config.googleAnalyticsId) {
    loadGoogleAnalytics(config.googleAnalyticsId);
  } else {
    console.log('Analytics: Google Analytics not loaded (no consent or no ID)');
  }

  // Load Facebook Pixel if marketing consent given and ID provided
  if (preferences.marketing && config.facebookPixelId) {
    loadFacebookPixel(config.facebookPixelId);
  } else {
    console.log('Analytics: Facebook Pixel not loaded (no consent or no ID)');
  }
}

/**
 * Remove tracking scripts when consent is revoked
 * This is a best-effort cleanup - some scripts may have already loaded cookies
 */
export function removeTracking(): void {
  // Remove Google Analytics
  if (window.gtag) {
    // Delete cookies (best effort)
    const gaCookies = document.cookie.split(';').filter(c => c.trim().startsWith('_ga'));
    gaCookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Remove gtag function
    delete window.gtag;
    delete window.dataLayer;
  }

  // Remove Facebook Pixel
  if (window.fbq) {
    // Delete Facebook cookies (best effort)
    const fbCookies = document.cookie.split(';').filter(c =>
      c.trim().startsWith('_fb') || c.trim().startsWith('fr')
    );
    fbCookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Remove fbq function
    delete window.fbq;
    delete window._fbq;
  }

  console.log('Analytics: Tracking scripts removed');
}

/**
 * Example usage in App.tsx:
 *
 * import { useEffect } from 'react';
 * import { useConsent } from './contexts/ConsentContext';
 * import { useContent } from './contexts/ContentContext';
 * import { initializeTracking } from './utils/analytics';
 *
 * function App() {
 *   const { preferences } = useConsent();
 *   const { settings } = useContent();
 *
 *   useEffect(() => {
 *     if (preferences && settings?.analytics) {
 *       initializeTracking(preferences, {
 *         googleAnalyticsId: settings.analytics.googleAnalyticsId,
 *         facebookPixelId: settings.analytics.facebookPixelId,
 *       });
 *     }
 *   }, [preferences, settings]);
 *
 *   // ... rest of app
 * }
 */
