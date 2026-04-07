import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { Save, AlertCircle, CheckCircle2, Plus, X } from 'lucide-react';
import { useContent } from '../../contexts/ContentContext';
import type { SiteSettings } from '../../types/content';

export default function SettingsEditor() {
  const { settings: initialSettings, refetch } = useContent();
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      await adminApi.updateSettings(settings);
      await refetch();
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path: string, value: any) => {
    if (!settings) return;

    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  const addCity = () => {
    if (!settings) return;
    const newCities = [...settings.serviceArea.cities, 'New City'];
    updateField('serviceArea.cities', newCities);
  };

  const removeCity = (index: number) => {
    if (!settings) return;
    const newCities = settings.serviceArea.cities.filter((_, i) => i !== index);
    updateField('serviceArea.cities', newCities);
  };

  const updateCity = (index: number, value: string) => {
    if (!settings) return;
    const newCities = [...settings.serviceArea.cities];
    newCities[index] = value;
    updateField('serviceArea.cities', newCities);
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings Editor</h1>
          <p className="text-zinc-400">Manage site configuration and business information</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Site Information */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Site Information</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.site.name}
                onChange={(e) => updateField('site.name', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Tagline</label>
              <input
                type="text"
                value={settings.site.tagline}
                onChange={(e) => updateField('site.tagline', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
              <textarea
                value={settings.site.description}
                onChange={(e) => updateField('site.description', e.target.value)}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Phone</label>
              <input
                type="text"
                value={settings.contact.phone}
                onChange={(e) => updateField('contact.phone', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) => updateField('contact.email', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Street Address</label>
              <input
                type="text"
                value={settings.contact.address.street}
                onChange={(e) => updateField('contact.address.street', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={settings.contact.address.postalCode}
                  onChange={(e) => updateField('contact.address.postalCode', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">City</label>
                <input
                  type="text"
                  value={settings.contact.address.city}
                  onChange={(e) => updateField('contact.address.city', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Business Hours</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Weekdays Label
              </label>
              <input
                type="text"
                value={settings.hours.weekdays.label}
                onChange={(e) => updateField('hours.weekdays.label', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Weekdays Hours
              </label>
              <input
                type="text"
                value={settings.hours.weekdays.hours}
                onChange={(e) => updateField('hours.weekdays.hours', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Sunday Label</label>
              <input
                type="text"
                value={settings.hours.sunday.label}
                onChange={(e) => updateField('hours.sunday.label', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Sunday Hours</label>
              <input
                type="text"
                value={settings.hours.sunday.hours}
                onChange={(e) => updateField('hours.sunday.hours', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Service Area */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Service Area Cities</h2>
            <button
              onClick={addCity}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add City
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {settings.serviceArea.cities.map((city, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => updateCity(index, e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={() => removeCity(index)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Description
            </label>
            <input
              type="text"
              value={settings.serviceArea.description}
              onChange={(e) => updateField('serviceArea.description', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        {/* Ratings */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Customer Ratings</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Google Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={settings.ratings.google.value}
                onChange={(e) => updateField('ratings.google.value', parseFloat(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Pages Jaunes Rating
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={settings.ratings.pagesJaunes.value}
                onChange={(e) =>
                  updateField('ratings.pagesJaunes.value', parseFloat(e.target.value))
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Trustpilot Rating
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={settings.ratings.trustpilot.value}
                onChange={(e) =>
                  updateField('ratings.trustpilot.value', parseFloat(e.target.value))
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
