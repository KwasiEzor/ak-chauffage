import { useState, useEffect, useRef } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { content } = useContent();

  // Get active FAQs from content
  const faqs = (content?.faqs || [])
    .filter((faq) => faq.active)
    .sort((a, b) => a.order - b.order);

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
