import { useState } from 'react';
import { useConsent } from '../contexts/ConsentContext';
import CookieSettings from './CookieSettings';

export default function CookieBanner() {
  const { preferences, acceptAll, rejectAll } = useConsent();
  const [showSettings, setShowSettings] = useState(false);

  // Don't show banner if consent already given
  if (preferences) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:bottom-4 md:left-auto md:right-4 md:max-w-md">
        <div className="glass-strong rounded-2xl p-6 shadow-2xl">
          {/* Title */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">🍪</span>
            <h3 className="text-lg font-semibold text-white">
              Respect de votre vie privée
            </h3>
          </div>

          {/* Description */}
          <p className="mb-4 text-sm text-zinc-300">
            Nous utilisons des cookies pour améliorer votre expérience sur notre site et analyser notre trafic.
            Vous pouvez choisir d'accepter tous les cookies ou personnaliser vos préférences.
          </p>

          {/* Link to cookie policy */}
          <a
            href="/legal/politique-cookies"
            className="mb-4 inline-block text-sm text-orange-500 hover:text-orange-400 transition-colors"
          >
            En savoir plus →
          </a>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={acceptAll}
              className="btn-primary flex-1 px-4 py-2.5 text-sm"
            >
              Tout accepter
            </button>
            <button
              onClick={rejectAll}
              className="btn-secondary flex-1 px-4 py-2.5 text-sm"
            >
              Tout refuser
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="btn-secondary flex-1 px-4 py-2.5 text-sm"
            >
              Personnaliser
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <CookieSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
