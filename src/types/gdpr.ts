// Cookie categories
export type CookieCategory = 'essential' | 'analytics' | 'marketing';

// Consent preferences stored in localStorage
export interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

// Cookie definition
export interface CookieDefinition {
  name: string;
  category: CookieCategory;
  purpose: string;
  duration: string;
  provider: string;
}

// Legal page section
export interface LegalSection {
  id: string;
  heading: string;
  content: string; // HTML content
  order: number;
}

// Legal page
export interface LegalPage {
  id: string;
  title: string;
  slug: string;
  lastUpdated: string;
  version: string;
  sections: LegalSection[];
  active: boolean;
}

// GDPR configuration in site settings
export interface GDPRConfig {
  policyVersion: string;
  cookieBannerEnabled: boolean;
  defaultConsent: {
    analytics: boolean;
    marketing: boolean;
  };
  consentExpiryDays: number;
}

// Consent context value
export interface ConsentContextValue {
  preferences: ConsentPreferences | null;
  hasConsent: (category: CookieCategory) => boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  updatePreferences: (prefs: Partial<ConsentPreferences>) => void;
  resetConsent: () => void;
  isLoading: boolean;
}
