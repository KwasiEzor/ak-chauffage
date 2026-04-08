import { useContent } from '../contexts/ContentContext';

/**
 * Structured Data (JSON-LD) for SEO
 * Helps Google understand and display rich results
 */
export default function StructuredData() {
  const { settings } = useContent();

  // Local Business Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://www.ak-chauffage.be/#business",
    "name": "AK CHAUFFAGE",
    "image": "https://www.ak-chauffage.be/logo.png",
    "logo": "https://www.ak-chauffage.be/logo.png",
    "url": "https://www.ak-chauffage.be",
    "telephone": settings?.contact.phone || "+32488459976",
    "priceRange": "€€",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": settings?.contact.address.street || "Rue de la Station 45",
      "addressLocality": settings?.contact.address.city || "Charleroi",
      "postalCode": settings?.contact.address.postalCode || "6000",
      "addressCountry": "BE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 50.4108,
      "longitude": 4.4446
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "13:00"
      }
    ],
    "sameAs": settings?.social?.map(s => s.url).filter(Boolean) || [],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "Chauffagiste professionnel à Charleroi. Installation, entretien et dépannage de chaudières au gaz et mazout. Intervention rapide 7j/7.",
    "areaServed": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 50.4108,
        "longitude": 4.4446
      },
      "geoRadius": "25000"
    },
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Installation de chaudière",
          "description": "Installation professionnelle de chaudières au gaz et mazout"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Entretien de chaudière",
          "description": "Entretien annuel et maintenance préventive de chaudières"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Dépannage chauffage",
          "description": "Service de dépannage urgent 7j/7 pour tous types de chauffage"
        }
      }
    ]
  };

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.ak-chauffage.be/#organization",
    "name": "AK CHAUFFAGE",
    "url": "https://www.ak-chauffage.be",
    "logo": "https://www.ak-chauffage.be/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": settings?.contact.phone || "+32488459976",
      "contactType": "customer service",
      "areaServed": "BE",
      "availableLanguage": ["French"]
    }
  };

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.ak-chauffage.be/#website",
    "url": "https://www.ak-chauffage.be",
    "name": "AK CHAUFFAGE",
    "description": "Chauffagiste expert à Charleroi",
    "publisher": {
      "@id": "https://www.ak-chauffage.be/#organization"
    },
    "inLanguage": "fr-BE"
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://www.ak-chauffage.be/"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
