import { useState } from 'react';
import { useConsent } from '../contexts/ConsentContext';
import { COOKIE_DEFINITIONS } from '../config/cookies';
import type { CookieCategory } from '../types/gdpr';

interface CookieSettingsProps {
  onClose: () => void;
}

export default function CookieSettings({ onClose }: CookieSettingsProps) {
  const { preferences, updatePreferences } = useConsent();

  const [localPrefs, setLocalPrefs] = useState({
    analytics: preferences?.analytics ?? false,
    marketing: preferences?.marketing ?? false,
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<CookieCategory>>(new Set());

  const toggleCategory = (category: CookieCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSave = () => {
    updatePreferences(localPrefs);
    onClose();
  };

  const categoryLabels = {
    essential: 'Cookies Essentiels',
    analytics: 'Cookies Analytiques',
    marketing: 'Cookies Marketing',
  };

  const categoryDescriptions = {
    essential: 'Ces cookies sont strictement nécessaires au fonctionnement du site et ne peuvent pas être désactivés.',
    analytics: 'Ces cookies nous permettent de mesurer l\'audience et d\'analyser la performance du site.',
    marketing: 'Ces cookies sont utilisés pour afficher des publicités pertinentes et mesurer l\'efficacité des campagnes.',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <h2 className="text-2xl font-bold text-white">
                Paramètres des Cookies
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors text-2xl leading-none"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            Gérez vos préférences de cookies par catégorie
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Essential Cookies */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {categoryLabels.essential}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {categoryDescriptions.essential}
                  </p>
                </div>
                <div className="ml-4">
                  <div className="relative inline-block w-12 h-6 bg-orange-500 rounded-full cursor-not-allowed opacity-50">
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 text-center">Toujours actif</p>
                </div>
              </div>

              <button
                onClick={() => toggleCategory('essential')}
                className="mt-3 text-sm text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1"
              >
                <span className={`transform transition-transform ${expandedCategories.has('essential') ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                Voir les détails ({COOKIE_DEFINITIONS.filter(c => c.category === 'essential').length} cookies)
              </button>

              {expandedCategories.has('essential') && (
                <div className="mt-3 space-y-2">
                  {COOKIE_DEFINITIONS.filter(c => c.category === 'essential').map((cookie) => (
                    <div key={cookie.name} className="bg-zinc-800 p-3 rounded border border-zinc-700">
                      <div className="flex items-start justify-between">
                        <code className="text-sm font-mono text-orange-500">{cookie.name}</code>
                        <span className="text-xs text-zinc-500">{cookie.duration}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">{cookie.purpose}</p>
                      <p className="mt-1 text-xs text-zinc-500">Fournisseur: {cookie.provider}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {categoryLabels.analytics}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {categoryDescriptions.analytics}
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setLocalPrefs(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                      localPrefs.analytics ? 'bg-orange-500' : 'bg-zinc-600'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      localPrefs.analytics ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>

              <button
                onClick={() => toggleCategory('analytics')}
                className="mt-3 text-sm text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1"
              >
                <span className={`transform transition-transform ${expandedCategories.has('analytics') ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                Voir les détails ({COOKIE_DEFINITIONS.filter(c => c.category === 'analytics').length} cookies)
              </button>

              {expandedCategories.has('analytics') && (
                <div className="mt-3 space-y-2">
                  {COOKIE_DEFINITIONS.filter(c => c.category === 'analytics').map((cookie) => (
                    <div key={cookie.name} className="bg-zinc-800 p-3 rounded border border-zinc-700">
                      <div className="flex items-start justify-between">
                        <code className="text-sm font-mono text-orange-500">{cookie.name}</code>
                        <span className="text-xs text-zinc-500">{cookie.duration}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">{cookie.purpose}</p>
                      <p className="mt-1 text-xs text-zinc-500">Fournisseur: {cookie.provider}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Marketing Cookies */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {categoryLabels.marketing}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {categoryDescriptions.marketing}
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setLocalPrefs(prev => ({ ...prev, marketing: !prev.marketing }))}
                    className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                      localPrefs.marketing ? 'bg-orange-500' : 'bg-zinc-600'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      localPrefs.marketing ? 'right-1' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>

              <button
                onClick={() => toggleCategory('marketing')}
                className="mt-3 text-sm text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1"
              >
                <span className={`transform transition-transform ${expandedCategories.has('marketing') ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                Voir les détails ({COOKIE_DEFINITIONS.filter(c => c.category === 'marketing').length} cookies)
              </button>

              {expandedCategories.has('marketing') && (
                <div className="mt-3 space-y-2">
                  {COOKIE_DEFINITIONS.filter(c => c.category === 'marketing').map((cookie) => (
                    <div key={cookie.name} className="bg-zinc-800 p-3 rounded border border-zinc-700">
                      <div className="flex items-start justify-between">
                        <code className="text-sm font-mono text-orange-500">{cookie.name}</code>
                        <span className="text-xs text-zinc-500">{cookie.duration}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">{cookie.purpose}</p>
                      <p className="mt-1 text-xs text-zinc-500">Fournisseur: {cookie.provider}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-700 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 px-6 py-3"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1 px-6 py-3"
          >
            Enregistrer les préférences
          </button>
        </div>
      </div>
    </div>
  );
}
