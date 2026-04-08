import { useState, useEffect, useRef } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import ServiceAreaMap from './ServiceAreaMap';

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const { content, settings } = useContent();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', service: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      content: settings?.contact.phone || '',
      description: settings?.hours.weekdays.label + ' : ' + settings?.hours.weekdays.hours || '',
      link: `tel:${settings?.contact.phone?.replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      title: 'Email',
      content: settings?.contact.email || '',
      description: 'Réponse sous 24h ouvrées',
      link: `mailto:${settings?.contact.email}`,
    },
    {
      icon: MapPin,
      title: 'Adresse',
      content: settings?.contact.address.street || '',
      description: `${settings?.contact.address.postalCode} ${settings?.contact.address.city}`,
      link: '#',
    },
    {
      icon: Clock,
      title: 'Horaires',
      content: settings?.hours.weekdays.label + ' : ' + settings?.hours.weekdays.hours || '',
      description: settings?.hours.sunday.label + ' : ' + settings?.hours.sunday.hours || '',
      link: null,
    },
  ];

  const services = settings?.services.map(s => s.label) || [];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="section-padding bg-[#0a0a0f] relative"
    >
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
            Contactez-nous
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Demandez Votre{' '}
            <span className="text-gradient">Devis Gratuit</span>
          </h2>
          <p className="text-lg text-zinc-400">
            Remplissez le formulaire ci-dessous ou contactez-nous directement. 
            Notre équipe vous répondra sous 24h avec un devis personnalisé.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div
            className={`lg:col-span-3 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="glass-strong rounded-2xl p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message envoyé !</h3>
                  <p className="text-zinc-400">
                    Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                        placeholder="+32 488 45 99 76"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                      placeholder="jean.dupont@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Type de service *
                    </label>
                    <select
                      required
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#1a1a25]">Sélectionnez un service</option>
                      {services.map((service) => (
                        <option key={service} value={service} className="bg-[#1a1a25]">
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                      placeholder="Décrivez votre besoin..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer ma demande
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-zinc-500 text-center">
                    En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div
            className={`lg:col-span-2 space-y-6 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.link || undefined}
                className={`flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all group ${
                  info.link ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  <info.icon className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{info.title}</h4>
                  <p className="text-orange-400 font-medium">{info.content}</p>
                  <p className="text-sm text-zinc-500">{info.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Service Area Map - Full Width */}
        <div
          className={`mt-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Notre Zone d'Intervention
            </h3>
            <p className="text-zinc-400">
              Charleroi et ses environs dans un rayon de 25 km
            </p>
          </div>
          <ServiceAreaMap className="h-[500px]" />
        </div>
      </div>
    </section>
  );
}
