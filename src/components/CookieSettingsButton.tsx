import { useState } from 'react';
import CookieSettings from './CookieSettings';

export default function CookieSettingsButton() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {/* Floating Cookie Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-4 left-4 z-40 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-orange-500/50 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 group"
        aria-label="Paramètres des cookies"
        title="Gérer les cookies"
      >
        <div className="relative">
          <span className="text-2xl">🍪</span>
          {/* Badge indicator */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        </div>

        {/* Tooltip */}
        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-zinc-700">
          Paramètres des cookies
        </span>
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <CookieSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
