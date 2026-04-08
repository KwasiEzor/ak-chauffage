import type { CookieDefinition } from '../types/gdpr';

export const COOKIE_DEFINITIONS: CookieDefinition[] = [
  // Essential Cookies
  {
    name: 'ak_chauffage_consent',
    category: 'essential',
    purpose: 'Stockage de vos préférences de cookies et du consentement RGPD',
    duration: '12 mois',
    provider: 'AK CHAUFFAGE',
  },
  {
    name: 'admin_token',
    category: 'essential',
    purpose: 'Authentification sécurisée de l\'administrateur du site',
    duration: '24 heures',
    provider: 'AK CHAUFFAGE',
  },

  // Analytics Cookies
  {
    name: '_ga',
    category: 'analytics',
    purpose: 'Utilisé pour distinguer les utilisateurs et mesurer l\'audience du site',
    duration: '13 mois',
    provider: 'Google Analytics',
  },
  {
    name: '_gid',
    category: 'analytics',
    purpose: 'Utilisé pour distinguer les utilisateurs sur une courte période',
    duration: '24 heures',
    provider: 'Google Analytics',
  },
  {
    name: '_ga_*',
    category: 'analytics',
    purpose: 'Stockage de l\'état de la session pour Google Analytics 4',
    duration: '13 mois',
    provider: 'Google Analytics',
  },

  // Marketing Cookies
  {
    name: '_fbp',
    category: 'marketing',
    purpose: 'Utilisé par Facebook pour diffuser des publicités ciblées et mesurer les campagnes',
    duration: '3 mois',
    provider: 'Facebook',
  },
  {
    name: 'fr',
    category: 'marketing',
    purpose: 'Utilisé par Facebook pour la publicité ciblée et le remarketing',
    duration: '3 mois',
    provider: 'Facebook',
  },
];

export const CONSENT_STORAGE_KEY = 'ak_chauffage_consent';
export const CONSENT_VERSION = '1.0';
export const CONSENT_EXPIRY_DAYS = 365;
