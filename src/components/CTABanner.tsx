import { Phone, Clock, ArrowRight } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

export default function CTABanner() {
  const { content, settings } = useContent();
  const ctaBanner = content?.ctaBanner || {
    badge: 'Service disponible 7j/7',
    headline: 'Besoin d\'un chauffagiste en urgence ?',
    subheadline: 'Nos techniciens interviennent rapidement.',
    stats: [],
  };

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Animated Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              {ctaBanner.badge}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {ctaBanner.headline}
            </h2>
            <p className="text-lg text-white/80 max-w-xl">
              {ctaBanner.subheadline}
            </p>
          </div>

          {/* Right CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`tel:${settings?.contact.phone?.replace(/\s/g, '')}`}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white text-orange-600 font-bold text-lg hover:bg-zinc-100 transition-colors shadow-xl whitespace-nowrap"
            >
              <Phone className="w-6 h-6 flex-shrink-0" />
              <span className="whitespace-nowrap">{settings?.contact.phone}</span>
            </a>
            <button
              onClick={scrollToContact}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-orange-700 text-white font-semibold text-lg hover:bg-orange-800 transition-colors border-2 border-white/20 whitespace-nowrap"
            >
              Devis Gratuit
              <ArrowRight className="w-5 h-5 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {ctaBanner.stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
