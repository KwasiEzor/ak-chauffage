import { useEffect, useRef, useState } from 'react';
import { Flame, Wrench, Clock, Thermometer, Droplets, Home, ArrowRight } from 'lucide-react';

const services = [
  {
    icon: Flame,
    title: 'Installation de Chaudière',
    description: 'Installation professionnelle de chaudières gaz, fioul et électriques. Choix des meilleures marques avec accompagnement pour les aides énergie.',
    features: ['Chaudière gaz à condensation', 'Chaudière fioul haute performance', 'Installation clé en main', 'Aides énergie incluses'],
    image: '/images/boiler-installation.jpg',
  },
  {
    icon: Droplets,
    title: 'Pompe à Chaleur',
    description: 'Solutions écologiques et économiques pour votre chauffage. Installation de pompes à chaleur air/eau et géothermiques.',
    features: ['PAC air/eau', 'PAC géothermique', 'Éligible MaPrimeRénov', 'Économies d\'énergie'],
    image: '/images/heat-pump.jpg',
  },
  {
    icon: Wrench,
    title: 'Entretien & Maintenance',
    description: 'Contrats d\'entretien annuels pour garantir la performance et la longévité de votre installation. Obligation légale pour votre sécurité.',
    features: ['Entretien annuel obligatoire', 'Contrat de maintenance', 'Réduction des pannes', 'Optimisation performance'],
    image: '/images/maintenance.jpg',
  },
  {
    icon: Clock,
    title: 'Dépannage Urgent 24/7',
    description: 'Service d\'urgence disponible 24h/24 et 7j/7. Intervention rapide en moins de 2 heures pour tous types de pannes.',
    features: ['Intervention < 2h', 'Disponible 24h/24', 'Diagnostic express', 'Réparation sur place'],
    image: '/images/repair-service.jpg',
  },
  {
    icon: Thermometer,
    title: 'Radiateurs & Plancher',
    description: 'Installation et remplacement de radiateurs modernes et systèmes de chauffage au sol pour un confort optimal.',
    features: ['Radiateurs design', 'Chauffage au sol', 'Thermostats connectés', 'Régulation optimale'],
    image: '/images/radiator-system.jpg',
  },
  {
    icon: Home,
    title: 'Rénovation Énergétique',
    description: 'Accompagnement complet pour votre rénovation énergétique. Étude thermique, solutions adaptées et montage des dossiers d\'aides.',
    features: ['Audit énergétique', 'Solutions sur-mesure', 'MaPrimeRénov', 'Éco-PTZ'],
    image: '/images/happy-family.jpg',
  },
];

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

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
