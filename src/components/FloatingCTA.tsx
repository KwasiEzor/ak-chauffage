import { Phone, MessageCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { settings } = useContent();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Mobile Floating Call Button */}
      <div className={`fixed bottom-4 left-4 right-4 md:hidden z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <a
          href={`tel:${settings?.contact.phone?.replace(/\s/g, '')}`}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-lg pulse-glow"
        >
          <Phone className="w-5 h-5" />
          Appeler maintenant
        </a>
      </div>

      {/* Desktop Floating Buttons */}
      <div className={`fixed bottom-24 right-8 hidden md:flex flex-col gap-3 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        {isExpanded && (
          <>
            <a
              href={`tel:${settings?.contact.phone?.replace(/\s/g, '')}`}
              className="flex items-center gap-3 px-4 py-3 rounded-full bg-orange-500 text-white font-medium shadow-lg hover:bg-orange-600 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>{settings?.contact.phone}</span>
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-full bg-zinc-800 text-white font-medium shadow-lg hover:bg-zinc-700 transition-colors border border-white/10"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Demander un devis</span>
            </a>
          </>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Fermer le menu' : 'Ouvrir le menu de contact'}
          aria-expanded={isExpanded}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isExpanded
              ? 'bg-zinc-800 text-white rotate-45'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white pulse-glow'
          }`}
        >
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <Phone className="w-6 h-6" />
          )}
        </button>
      </div>
    </>
  );
}
