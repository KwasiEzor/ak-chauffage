import { useState, useEffect } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { adminApi } from '../../utils/api';
import { Save, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';

interface TrustBadge {
  icon: string;
  text: string;
}

interface Stat {
  value: string;
  label: string;
}

interface HeroContent {
  badge: string;
  headline: string;
  subheadline: string;
  trustBadges: TrustBadge[];
  quickBenefits: string[];
  stats: Stat[];
  rating: {
    value: number;
    platform: string;
  };
}

const iconOptions = ['Clock', 'Shield', 'Award', 'CheckCircle', 'Star', 'Zap'];

export default function HeroEditor() {
  const { content, refetch } = useContent();
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (content?.hero) {
      setHero(content.hero);
    }
  }, [content]);

  const handleSave = async () => {
    if (!hero) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.updateContent({ hero });
      await refetch();
      setMessage({ type: 'success', text: 'Hero section updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating hero:', error);
      setMessage({ type: 'error', text: 'Failed to update hero section. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const addTrustBadge = () => {
    if (!hero) return;
    setHero({
      ...hero,
      trustBadges: [...hero.trustBadges, { icon: 'Clock', text: '' }],
    });
  };

  const updateTrustBadge = (index: number, field: keyof TrustBadge, value: string) => {
    if (!hero) return;
    const newBadges = [...hero.trustBadges];
    newBadges[index] = { ...newBadges[index], [field]: value };
    setHero({ ...hero, trustBadges: newBadges });
  };

  const removeTrustBadge = (index: number) => {
    if (!hero) return;
    setHero({
      ...hero,
      trustBadges: hero.trustBadges.filter((_, i) => i !== index),
    });
  };

  const addQuickBenefit = () => {
    if (!hero) return;
    setHero({
      ...hero,
      quickBenefits: [...hero.quickBenefits, ''],
    });
  };

  const updateQuickBenefit = (index: number, value: string) => {
    if (!hero) return;
    const newBenefits = [...hero.quickBenefits];
    newBenefits[index] = value;
    setHero({ ...hero, quickBenefits: newBenefits });
  };

  const removeQuickBenefit = (index: number) => {
    if (!hero) return;
    setHero({
      ...hero,
      quickBenefits: hero.quickBenefits.filter((_, i) => i !== index),
    });
  };

  const addStat = () => {
    if (!hero) return;
    setHero({
      ...hero,
      stats: [...hero.stats, { value: '', label: '' }],
    });
  };

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    if (!hero) return;
    const newStats = [...hero.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setHero({ ...hero, stats: newStats });
  };

  const removeStat = (index: number) => {
    if (!hero) return;
    setHero({
      ...hero,
      stats: hero.stats.filter((_, i) => i !== index),
    });
  };

  if (!hero) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hero Section Editor</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Customize the main hero section of your website
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          {/* Badge */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Badge Text
            </label>
            <input
              type="text"
              value={hero.badge}
              onChange={(e) => setHero({ ...hero, badge: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="e.g., Disponible du lundi au dimanche"
            />
          </div>

          {/* Headline */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Main Headline
            </label>
            <input
              type="text"
              value={hero.headline}
              onChange={(e) => setHero({ ...hero, headline: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="e.g., Expert Chauffagiste à Charleroi"
            />
          </div>

          {/* Subheadline */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Subheadline
            </label>
            <textarea
              value={hero.subheadline}
              onChange={(e) => setHero({ ...hero, subheadline: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="e.g., Installation, entretien et dépannage"
            />
          </div>

          {/* Rating */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <label className="block text-sm font-medium text-zinc-300 mb-4">
              Rating
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Value (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={hero.rating.value}
                  onChange={(e) =>
                    setHero({
                      ...hero,
                      rating: { ...hero.rating, value: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Platform</label>
                <input
                  type="text"
                  value={hero.rating.platform}
                  onChange={(e) =>
                    setHero({
                      ...hero,
                      rating: { ...hero.rating, platform: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="e.g., Google"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Lists */}
        <div className="space-y-6">
          {/* Trust Badges */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-zinc-300">Trust Badges</label>
              <button
                onClick={addTrustBadge}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
              >
                <Plus className="w-4 h-4" />
                Add Badge
              </button>
            </div>
            <div className="space-y-3">
              {hero.trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-zinc-900 rounded-lg border border-zinc-700"
                >
                  <GripVertical className="w-4 h-4 text-zinc-600 mt-2" />
                  <div className="flex-1 space-y-2">
                    <select
                      value={badge.icon}
                      onChange={(e) => updateTrustBadge(index, 'icon', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      {iconOptions.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={badge.text}
                      onChange={(e) => updateTrustBadge(index, 'text', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-orange-500"
                      placeholder="Badge text"
                    />
                  </div>
                  <button
                    onClick={() => removeTrustBadge(index)}
                    className="text-red-400 hover:text-red-300 mt-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Benefits */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-zinc-300">Quick Benefits</label>
              <button
                onClick={addQuickBenefit}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
              >
                <Plus className="w-4 h-4" />
                Add Benefit
              </button>
            </div>
            <div className="space-y-2">
              {hero.quickBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => updateQuickBenefit(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-orange-500"
                    placeholder="Benefit text"
                  />
                  <button
                    onClick={() => removeQuickBenefit(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-zinc-300">Statistics</label>
              <button
                onClick={addStat}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
              >
                <Plus className="w-4 h-4" />
                Add Stat
              </button>
            </div>
            <div className="space-y-3">
              {hero.stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-zinc-900 rounded-lg border border-zinc-700"
                >
                  <GripVertical className="w-4 h-4 text-zinc-600 mt-2" />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => updateStat(index, 'value', e.target.value)}
                      className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-orange-500"
                      placeholder="Value (e.g., 15+)"
                    />
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white focus:outline-none focus:border-orange-500"
                      placeholder="Label"
                    />
                  </div>
                  <button
                    onClick={() => removeStat(index)}
                    className="text-red-400 hover:text-red-300 mt-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t border-zinc-700">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
