import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';

export default function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(false);
  const { settings } = useContent();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!settings?.whatsapp?.enabled) return null;

  const phoneNumber = settings.whatsapp.phoneNumber.replace(/\s/g, '');
  const encodedMessage = encodeURIComponent(settings.whatsapp.defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <>
      {/* Mobile Floating WhatsApp Button */}
      <div className={`fixed bottom-24 right-4 md:hidden z-[45] transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
          aria-label="Contact via WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>

      {/* Desktop Floating WhatsApp Button */}
      <div className={`fixed bottom-20 left-8 hidden md:block z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-4 py-3 rounded-full bg-green-500 text-white font-medium shadow-lg hover:bg-green-600 transition-all hover:pr-6"
          aria-label="Contact via WhatsApp"
        >
          <MessageCircle className="w-5 h-5 flex-shrink-0" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            WhatsApp
          </span>
        </a>
      </div>
    </>
  );
}
