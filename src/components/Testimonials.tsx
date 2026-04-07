import { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    name: 'Marie L.',
    location: 'Charleroi',
    rating: 5,
    text: 'Intervention ultra rapide après la panne de ma chaudière en plein hiver. Le technicien était professionnel, sympathique et a tout expliqué clairement. Ma nouvelle chaudière fonctionne parfaitement. Je recommande vivement !',
    service: 'Remplacement chaudière gaz',
    avatar: 'ML',
  },
  {
    name: 'Pierre D.',
    location: 'Gilly',
    rating: 5,
    text: 'Excellente expérience pour l\'installation de notre pompe à chaleur. L\'équipe a été très professionnelle du devis à l\'installation. Ils ont même géré tout le dossier MaPrimeRénov. Résultat au top !',
    service: 'Installation PAC air/eau',
    avatar: 'PD',
  },
  {
    name: 'Sophie M.',
    location: 'Marcinelle',
    rating: 5,
    text: 'Contrat d\'entretien annuel depuis 3 ans. Jamais déçue ! Ponctualité, professionnalisme et tarifs transparents. Mon ancienne chaudière tient toujours le coup grâce à leur entretien rigoureux.',
    service: 'Contrat maintenance',
    avatar: 'SM',
  },
  {
    name: 'Jean-Claude B.',
    location: 'Gosselies',
    rating: 5,
    text: 'Dépannage rapide un dimanche après-midi. Intervention efficace, problème résolu immédiatement. Service client au top, prix juste. Un grand merci !',
    service: 'Dépannage urgent',
    avatar: 'JB',
  },
  {
    name: 'Isabelle T.',
    location: 'Montignies-sur-Sambre',
    rating: 5,
    text: 'Rénovation complète du chauffage de notre maison. Conseils pertinents, devis détaillé, travail soigné et respect des délais. Équipe très agréable et à l\'écoute. Merci AK CHAUFFAGE !',
    service: 'Rénovation complète',
    avatar: 'IT',
  },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      id="avis"
      ref={sectionRef}
      className="section-padding bg-[#0a0a0f] relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
            Avis Clients
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ce Que Disent Nos{' '}
            <span className="text-gradient">Clients</span>
          </h2>
          <p className="text-lg text-zinc-400">
            La satisfaction de nos clients est notre priorité. Découvrez les témoignages 
            de ceux qui nous ont fait confiance pour leurs projets chauffage.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div
          className={`relative transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Main Testimonial */}
          <div className="relative max-w-4xl mx-auto">
            <div className="glass-strong rounded-3xl p-8 md:p-12">
              {/* Quote Icon */}
              <div className="absolute -top-6 left-8 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-orange-500 fill-orange-500" />
                ))}
              </div>

              {/* Text */}
              <p className="text-lg md:text-xl text-zinc-300 leading-relaxed mb-8">
                "{testimonials[currentIndex].text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[currentIndex].avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonials[currentIndex].name}</div>
                    <div className="text-sm text-zinc-400">{testimonials[currentIndex].location}</div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <span className="text-sm text-orange-400">{testimonials[currentIndex].service}</span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-orange-500'
                      : 'bg-zinc-600 hover:bg-zinc-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Review Platforms */}
          <div className="flex justify-center items-center gap-8 mt-12 flex-wrap">
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-500 fill-orange-500" />
                ))}
              </div>
              <div className="text-white font-semibold">4.9/5</div>
              <div className="text-xs text-zinc-500">Google Avis</div>
            </div>
            <div className="w-px h-12 bg-zinc-700" />
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-500 fill-orange-500" />
                ))}
              </div>
              <div className="text-white font-semibold">5/5</div>
              <div className="text-xs text-zinc-500">Pages Jaunes</div>
            </div>
            <div className="w-px h-12 bg-zinc-700" />
            <div className="text-center">
              <div className="flex gap-1 justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-orange-500 fill-orange-500" />
                ))}
              </div>
              <div className="text-white font-semibold">4.8/5</div>
              <div className="text-xs text-zinc-500">Trustpilot</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
