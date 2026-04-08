import { useEffect, useRef, useState } from 'react';
import { Flame, Wrench, Clock, Thermometer, Droplets, Home, ArrowRight } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

// Icon mapping
const iconMap: Record<string, any> = {
  Flame,
  Wrench,
  Clock,
  Thermometer,
  Droplets,
  Home,
};

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const { content } = useContent();

  // Get active services from content, fallback to empty array
  const services = (content?.services || [])
    .filter((service) => service.active)
    .sort((a, b) => a.order - b.order)
    .map((service) => ({
      ...service,
      icon: iconMap[service.icon] || Wrench,
    }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    const cards = sectionRef.current?.querySelectorAll('.service-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="section-padding bg-[#0a0a0f] relative"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
            Nos Services
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Solutions de Chauffage{' '}
            <span className="text-gradient">Complètes</span>
          </h2>
          <p className="text-lg text-zinc-400">
            Des services professionnels pour tous vos besoins en chauffage. 
            Installation, entretien et réparation par des experts certifiés.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              data-index={index}
              className={`service-card card-premium overflow-hidden group cursor-pointer transition-all duration-700 ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={scrollToContact}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151520] to-transparent" />
                
                {/* Icon Badge */}
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/30 transition-shadow">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button className="flex items-center gap-2 text-orange-400 font-medium text-sm group/btn pt-2">
                  En savoir plus
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-zinc-400 mb-4">Besoin d'un service spécifique ?</p>
          <button
            onClick={scrollToContact}
            className="btn-primary inline-flex items-center gap-2"
          >
            Consulter nos experts
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
