import { useEffect, useRef, useState } from 'react';
import { Shield, Clock, Award, Users, CheckCircle2, BadgeCheck, Phone } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import OptimizedImage from './OptimizedImage';

// Icon mapping
const iconMap: Record<string, any> = {
  Clock,
  Shield,
  Award,
  Users,
};

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { content } = useContent();

  // Get active advantages and certifications from content
  const advantages = (content?.advantages || [])
    .filter((adv) => adv.active)
    .sort((a, b) => a.order - b.order)
    .map((adv) => ({
      ...adv,
      icon: iconMap[adv.icon] || Clock,
    }));

  const certifications = content?.certifications || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="avantages"
      ref={sectionRef}
      className="section-padding bg-[#0a0a0f] relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
            Pourquoi Nous Choisir
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Votre Chauffagiste de{' '}
            <span className="text-gradient">Confiance</span>
          </h2>
          <p className="text-lg text-zinc-400">
            Plus de 15 ans d'expertise à votre service. Qualité, rapidité et professionnalisme 
            sont nos engagements pour votre confort thermique.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl" />
              
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden">
                <OptimizedImage
                  src="/images/service-van.jpg"
                  alt="Véhicule de service AK CHAUFFAGE"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 via-transparent to-transparent" />
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 glass-strong rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <BadgeCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold">Certifié RGE</div>
                    <div className="text-sm text-zinc-400">Qualité garantie</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Advantages */}
          <div className="space-y-6">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className={`group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center group-hover:from-orange-500 group-hover:to-amber-500 transition-all">
                    <advantage.icon className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                        {advantage.title}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gradient">{advantage.stat}</div>
                        <div className="text-xs text-zinc-500">{advantage.statLabel}</div>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {advantage.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <p className="text-center text-zinc-400 mb-8">Certifications et agréments officiels</p>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-orange-500/30 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-zinc-300">{cert}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            onClick={scrollToContact}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Demander un devis gratuit
          </button>
        </div>
      </div>
    </section>
  );
}
