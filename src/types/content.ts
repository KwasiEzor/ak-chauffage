// Service types
export interface Service {
  id: number;
  icon: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  active: boolean;
  order: number;
}

// FAQ types
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  active: boolean;
  order: number;
}

// Testimonial types
export interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  service: string;
  avatar: string;
  active: boolean;
  order: number;
}

// Project types
export interface Project {
  id: number;
  title: string;
  location: string;
  date: string;
  description: string;
  image: string;
  category: string;
  active: boolean;
  order: number;
}

// Advantage types
export interface Advantage {
  id: number;
  icon: string;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
  active: boolean;
  order: number;
}

// Hero types
export interface HeroContent {
  badge: string;
  headline: string;
  subheadline: string;
  trustBadges: {
    icon: string;
    text: string;
  }[];
  quickBenefits: string[];
  stats: {
    value: string;
    label: string;
  }[];
  rating: {
    value: number;
    platform: string;
  };
}

// CTA Banner types
export interface CTABanner {
  badge: string;
  headline: string;
  subheadline: string;
  stats: {
    value: string;
    label: string;
  }[];
}

// Main content type
export interface SiteContent {
  services: Service[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  projects: Project[];
  advantages: Advantage[];
  certifications: string[];
  hero: HeroContent;
  ctaBanner: CTABanner;
}

// Import GDPR types
import type { GDPRConfig } from './gdpr';

// Settings types
export interface ContactInfo {
  phone: string;
  email: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

export interface BusinessHours {
  weekdays: {
    label: string;
    hours: string;
  };
  sunday: {
    label: string;
    hours: string;
  };
  emergency: string;
}

export interface ServiceArea {
  cities: string[];
  description: string;
}

export interface SiteSettings {
  site: {
    name: string;
    tagline: string;
    description: string;
    keywords: string;
  };
  contact: ContactInfo;
  hours: BusinessHours;
  serviceArea: ServiceArea;
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  whatsapp: {
    enabled: boolean;
    phoneNumber: string;
    defaultMessage: string;
  };
  legal: {
    companyName: string;
    registrationNumber: string;
    vatNumber: string;
    links: {
      label: string;
      href: string;
    }[];
    gdpr: GDPRConfig;
  };
  navigation: {
    label: string;
    href: string;
  }[];
  services: {
    label: string;
    href: string;
  }[];
  ratings: {
    google: {
      value: number;
      max: number;
    };
    pagesJaunes: {
      value: number;
      max: number;
    };
    trustpilot: {
      value: number;
      max: number;
    };
  };
}

// Auth types
export interface User {
  username: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}
