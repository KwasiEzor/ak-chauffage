import { useState, useEffect, useRef } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Quels sont les délais d\'intervention pour un dépannage urgent ?',
    answer: 'Pour les dépannages urgents, nous intervenons rapidement à Charleroi et ses environs. Notre service est disponible 7 jours sur 7, y compris les week-ends. En cas de panne de chauffage en plein hiver, nous priorisons les interventions pour votre confort et sécurité.',
    category: 'Dépannage',
  },
  {
    question: 'Quel est le prix d\'une installation de chaudière à gaz ?',
    answer: 'Le prix d\'une installation de chaudière à gaz varie selon plusieurs facteurs : type de chaudière (classique ou à condensation), puissance nécessaire, travaux annexes éventuels, etc. En moyenne, comptez entre 3 000€ et 8 000€ tout compris. Nous proposons des devis gratuits et personnalisés, et nous vous accompagnons pour obtenir les aides énergie (MaPrimeRénov, CEE, etc.).',
    category: 'Installation',
  },
  {
    question: 'L\'entretien annuel de chaudière est-il obligatoire ?',
    answer: 'Oui, l\'entretien annuel des chaudières à gaz ou fioul est obligatoire depuis la réglementation en vigueur. Cet entretien doit être réalisé par un professionnel qualifié et permet d\'assurer votre sécurité, d\'optimiser les performances de votre installation et de réduire votre consommation énergétique. Un justificatif d\'entretien peut vous être demandé en cas de sinistre.',
    category: 'Entretien',
  },
  {
    question: 'Comment savoir si je suis éligible aux aides énergie ?',
    answer: 'L\'éligibilité aux aides énergie dépend de plusieurs critères : localisation du logement, revenus du foyer, type de travaux envisagés, etc. En tant que professionnel certifié RGE QualiPac, nous réalisons un audit gratuit de votre situation et nous occupons de monter votre dossier d\'aides (MaPrimeRénov, CEE, Éco-PTZ). Nous vous accompagnons de A à Z dans vos démarches.',
    category: 'Aides',
  },
  {
    question: 'Quelle différence entre une chaudière classique et à condensation ?',
    answer: 'Une chaudière à condensation récupère la chaleur contenue dans les gaz de combustion pour la réinjecter dans le circuit de chauffage. Cette technologie permet d\'économiser jusqu\'à 30% d\'énergie par rapport à une chaudière classique. Elle est également plus écologique et vous permet de bénéficier des aides à la rénovation énergétique.',
    category: 'Conseils',
  },
  {
    question: 'Proposez-vous des contrats d\'entretien ?',
    answer: 'Oui, nous proposons plusieurs formules de contrats d\'entretien adaptés à vos besoins. Ces contrats incluent l\'entretien annuel obligatoire, la vérification de sécurité, le dépannage prioritaire et des tarifs préférentiels sur les pièces et la main d\'œuvre. Contactez-nous pour découvrir nos offres et choisir celle qui vous convient le mieux.',
    category: 'Entretien',
  },
  {
    question: 'Quelles marques de chaudières installez-vous ?',
    answer: 'Nous installons les meilleures marques du marché : Vaillant, Viessmann, Frisquet, Chaffoteaux, Saunier Duval, De Dietrich, et bien d\'autres. Nous sélectionnons les modèles les plus performants et fiables, adaptés à votre logement et à votre budget. Nous vous conseillons personnellement pour faire le meilleur choix.',
    category: 'Installation',
  },
  {
    question: 'Quelle est la durée de vie d\'une chaudière ?',
    answer: 'La durée de vie moyenne d\'une chaudière est d\'environ 15 à 20 ans, selon la qualité de l\'installation, l\'entretien régulier et l\'utilisation. Un entretien annuel professionnel permet d\'optimiser la performance de votre appareil et de prolonger sa durée de vie. Au-delà de 15 ans, il peut être intéressant d\'envisager le remplacement pour bénéficier des dernières technologies et réaliser des économies d\'énergie.',
    category: 'Conseils',
  },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="section-padding bg-[#12121a] relative"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
            Questions Fréquentes
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Foire Aux{' '}
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-lg text-zinc-400">
            Retrouvez les réponses aux questions les plus fréquentes sur nos services 
            de chauffage et nos interventions.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? 'bg-white/10 border border-orange-500/30'
                    : 'bg-white/5 border border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <span className="text-xs text-orange-400 font-medium uppercase tracking-wider">
                        {faq.category}
                      </span>
                      <h3 className="text-white font-semibold mt-1 pr-4">{faq.question}</h3>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 pl-20">
                    <p className="text-zinc-400 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
          <h3 className="text-xl font-bold text-white mb-2">Vous avez d'autres questions ?</h3>
          <p className="text-zinc-400 mb-4">
            Notre équipe est à votre disposition pour répondre à toutes vos interrogations.
          </p>
          <a
            href="tel:+32488459976"
            className="btn-primary inline-flex items-center gap-2"
          >
            Nous appeler
          </a>
        </div>
      </div>
    </section>
  );
}
