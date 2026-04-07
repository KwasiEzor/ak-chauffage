import { Flame, Phone, Mail, MapPin, Globe2, Camera, BriefcaseBusiness, ArrowUp } from 'lucide-react';

const quickLinks = [
  { label: 'Installation chaudière', href: '#services' },
  { label: 'Pompe à chaleur', href: '#services' },
  { label: 'Dépannage urgent', href: '#services' },
  { label: 'Entretien annuel', href: '#services' },
  { label: 'Rénovation énergétique', href: '#services' },
];

const legalLinks = [
  { label: 'Mentions légales', href: '#' },
  { label: 'Politique de confidentialité', href: '#' },
  { label: 'CGV', href: '#' },
];

const cities = [
  'Charleroi', 'Gilly', 'Marcinelle',
  'Montignies-sur-Sambre', 'Jumet', 'Gosselies',
  'Lodelinsart', 'Dampremy', 'Roux'
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-[#08080c] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">AK CHAUFFAGE</span>
                <span className="text-xs text-zinc-500">Chauffagiste Expert</span>
              </div>
            </a>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Expert en installation, entretien et dépannage de systèmes de chauffage.
              Plus de 15 ans d'expérience à votre service à Charleroi et ses environs.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-orange-500 hover:text-white transition-colors">
                <Globe2 className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-orange-500 hover:text-white transition-colors">
                <Camera className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-orange-500 hover:text-white transition-colors">
                <BriefcaseBusiness className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-6">Nos Services</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-zinc-400 hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:+32488459976" className="flex items-center gap-3 text-zinc-400 hover:text-orange-400 transition-colors">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span>+32 488 45 99 76</span>
                </a>
              </li>
              <li>
                <a href="mailto:contact@ak-chauffage.be" className="flex items-center gap-3 text-zinc-400 hover:text-orange-400 transition-colors">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <span>contact@ak-chauffage.be</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-zinc-400">
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span>Bd Jacques Bertrand 33<br />6000 Charleroi</span>
              </li>
            </ul>
          </div>

          {/* Service Area */}
          <div>
            <h4 className="text-white font-semibold mb-6">Zone d'intervention</h4>
            <div className="flex flex-wrap gap-2">
              {cities.map((city, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-white/5 text-zinc-400 text-xs"
                >
                  {city}
                </span>
              ))}
            </div>
            <p className="text-zinc-500 text-sm mt-4">
              Et toute la région de Charleroi
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} AK CHAUFFAGE. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            {legalLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-zinc-500 hover:text-orange-400 text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors z-40"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
}
