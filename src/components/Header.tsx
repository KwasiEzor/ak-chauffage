import { useState, useEffect } from 'react';
import { Phone, Menu, X, Flame } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '#avantages', label: 'Pourquoi Nous' },
    { href: '#realisations', label: 'Réalisations' },
    { href: '#avis', label: 'Avis Clients' },
    { href: '#contact', label: 'Contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-strong py-3 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/30 transition-shadow">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-tight">AK CHAUFFAGE</span>
              <span className="text-xs text-zinc-400">Chauffagiste Expert</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-sm font-medium text-zinc-300 hover:text-orange-400 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+32488459976"
              className="flex items-center gap-2 text-sm font-semibold text-white hover:text-orange-400 transition-colors"
            >
              <Phone className="w-4 h-4" />
              +32 488 45 99 76
            </a>
            <button
              onClick={() => scrollToSection('#contact')}
              className="btn-primary text-sm py-2.5 px-5"
            >
              Devis Gratuit
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed top-[72px] left-4 right-4 rounded-2xl bg-[#0f0f16]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
            <nav className="flex flex-col p-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-left text-zinc-300 hover:text-orange-400 transition-colors py-3 px-2 rounded-lg hover:bg-white/5"
                >
                  {link.label}
                </button>
              ))}
              <div className="border-t border-white/10 mt-3 pt-3 space-y-3">
                <a
                  href="tel:+32488459976"
                  className="flex items-center gap-2 text-orange-400 font-semibold py-2 px-2"
                >
                  <Phone className="w-5 h-5" />
                  +32 488 45 99 76
                </a>
                <button
                  onClick={() => scrollToSection('#contact')}
                  className="btn-primary text-sm w-full"
                >
                  Demander un Devis
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
