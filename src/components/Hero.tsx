import { useEffect, useRef } from 'react';
import { Phone, ArrowRight, CheckCircle2, Clock, Shield, Award } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { content, settings } = useContent();

  const heroContent = content?.hero || {
    badge: 'Disponible du lundi au dimanche',
    headline: 'Expert Chauffagiste à Charleroi',
    subheadline: 'Installation, entretien et dépannage',
    trustBadges: [],
    quickBenefits: [],
    stats: [],
    rating: { value: 4.9, platform: 'Google' },
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const iconMap: Record<string, any> = { Clock, Shield, Award };
  const trustBadges = heroContent.trustBadges.map((badge) => ({
    ...badge,
    icon: iconMap[badge.icon] || Clock,
  }));

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-technician.jpg"
          alt="Chauffagiste professionnel"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Badge */}
            <div className="reveal opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-medium text-orange-400">{heroContent.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="reveal opacity-0 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight" style={{ animationDelay: '100ms' }}>
              {heroContent.headline.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-gradient">{heroContent.headline.split(' ').slice(-1)}</span>
            </h1>

            {/* Subheadline */}
            <p className="reveal opacity-0 text-xl text-zinc-300 max-w-xl" style={{ animationDelay: '200ms' }}>
              {heroContent.subheadline}
            </p>

            {/* Trust Badges */}
            <div className="reveal opacity-0 flex flex-wrap gap-4" style={{ animationDelay: '300ms' }}>
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-zinc-400"
                >
                  <badge.icon className="w-5 h-5 text-orange-500" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="reveal opacity-0 flex flex-col sm:flex-row gap-4" style={{ animationDelay: '400ms' }}>
              <button
                onClick={scrollToContact}
                className="btn-primary flex items-center justify-center gap-2 text-lg pulse-glow"
              >
                Demander un Devis
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="tel:+32488459976"
                className="btn-secondary flex items-center justify-center gap-2 text-lg"
              >
                <Phone className="w-5 h-5" />
                Appeler Maintenant
              </a>
            </div>

            {/* Quick Benefits */}
            <div className="reveal opacity-0 grid grid-cols-2 gap-4 pt-4" style={{ animationDelay: '500ms' }}>
              {heroContent.quickBenefits.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-zinc-400">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Stats Card */}
          <div className="reveal opacity-0 hidden lg:block" style={{ animationDelay: '600ms' }}>
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl" />
              
              {/* Stats Card */}
              <div className="relative glass-strong rounded-2xl p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {heroContent.stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 rounded-xl bg-white/5">
                      <div className="text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                      <div className="text-sm text-zinc-400">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-orange-500 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-zinc-300">{heroContent.rating.value}/5 sur {heroContent.rating.platform}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10" />
    </section>
  );
}
