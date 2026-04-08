import { Link } from 'react-router-dom';
import { Home, Phone, ArrowLeft } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

export default function NotFound() {
  const { settings } = useContent();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] sm:text-[200px] font-bold text-gradient leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-orange-500/10 blur-3xl" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Page introuvable
        </h2>
        <p className="text-lg text-zinc-400 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-orange-500/50"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>

          <a
            href={`tel:${settings?.contact.phone?.replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-orange-500/50 transition-all"
          >
            <Phone className="w-5 h-5" />
            {settings?.contact.phone || 'Nous appeler'}
          </a>
        </div>

        {/* Helpful Links */}
        <div className="glass-strong rounded-xl p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4">
            Pages populaires
          </h3>
          <div className="space-y-3">
            <Link
              to="/#services"
              className="block text-zinc-400 hover:text-orange-500 transition-colors text-left"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Nos services
            </Link>
            <Link
              to="/#contact"
              className="block text-zinc-400 hover:text-orange-500 transition-colors text-left"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Demander un devis
            </Link>
            <Link
              to="/legal/politique-confidentialite"
              className="block text-zinc-400 hover:text-orange-500 transition-colors text-left"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Politique de confidentialité
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl translate-x-1/2" />
      </div>
    </div>
  );
}
