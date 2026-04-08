import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ConsentPreferences, ConsentContextValue, CookieCategory } from '../types/gdpr';
import { CONSENT_STORAGE_KEY, CONSENT_VERSION, CONSENT_EXPIRY_DAYS } from '../config/cookies';

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ConsentPreferences;

          // Check if consent is expired (older than CONSENT_EXPIRY_DAYS)
          const consentDate = new Date(parsed.timestamp);
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - consentDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff > CONSENT_EXPIRY_DAYS || parsed.version !== CONSENT_VERSION) {
            // Consent expired or version mismatch, reset
            localStorage.removeItem(CONSENT_STORAGE_KEY);
            setPreferences(null);
          } else {
            setPreferences(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading consent preferences:', error);
        localStorage.removeItem(CONSENT_STORAGE_KEY);
        setPreferences(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: ConsentPreferences) => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error saving consent preferences:', error);
    }
  };

  // Accept all cookies
  const acceptAll = () => {
    const newPreferences: ConsentPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    savePreferences(newPreferences);
  };

  // Reject all non-essential cookies
  const rejectAll = () => {
    const newPreferences: ConsentPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    savePreferences(newPreferences);
  };

  // Update specific preferences
  const updatePreferences = (partial: Partial<ConsentPreferences>) => {
    const newPreferences: ConsentPreferences = {
      essential: true, // Always true
      analytics: partial.analytics ?? preferences?.analytics ?? false,
      marketing: partial.marketing ?? preferences?.marketing ?? false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    savePreferences(newPreferences);
  };

  // Check if user has consented to a specific category
  const hasConsent = (category: CookieCategory): boolean => {
    if (category === 'essential') return true; // Essential cookies always allowed
    if (!preferences) return false; // No consent given yet
    return preferences[category] === true;
  };

  // Reset consent (for testing or user request)
  const resetConsent = () => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    setPreferences(null);
  };

  return (
    <ConsentContext.Provider
      value={{
        preferences,
        hasConsent,
        acceptAll,
        rejectAll,
        updatePreferences,
        resetConsent,
        isLoading,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
}
