import { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { adminApi } from '../../utils/api';
import { Service } from '../../types/content';
import { Save, AlertCircle, CheckCircle2, Pencil } from 'lucide-react';

export default function ServicesEditor() {
  const { content, refetch } = useContent();
  const [services, setServices] = useState<Service[]>(content?.services || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await adminApi.updateContentType('services', services);
      await refetch();
      setMessage({ type: 'success', text: 'Services updated successfully!' });
      setEditingId(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save services',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateService = (id: number, field: keyof Service, value: any) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const toggleActive = (id: number) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, active: !service.active } : service
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Services Editor</h1>
          <p className="text-zinc-400">Manage your service offerings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Services List */}
      <div className="space-y-4">
        {services.map((service) => {
          const isEditing = editingId === service.id;

          return (
            <div
              key={service.id}
              className={`bg-zinc-800 border rounded-xl overflow-hidden transition-colors ${
                service.active ? 'border-zinc-700' : 'border-zinc-700/50 opacity-60'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <span className="text-2xl">{service.icon === 'Flame' ? '🔥' : '🔧'}</span>
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => updateService(service.id, 'title', e.target.value)}
                          className="text-xl font-bold bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-white"
                        />
                      ) : (
                        <h3 className="text-xl font-bold text-white">{service.title}</h3>
                      )}
                      <p className="text-sm text-zinc-500">Service #{service.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(isEditing ? null : service.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(service.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        service.active
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                      }`}
                    >
                      {service.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Description
                      </label>
                      <textarea
                        value={service.description}
                        onChange={(e) => updateService(service.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Features (one per line)
                      </label>
                      <textarea
                        value={service.features.join('\n')}
                        onChange={(e) =>
                          updateService(
                            service.id,
                            'features',
                            e.target.value.split('\n').filter((f) => f.trim())
                          )
                        }
                        rows={4}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-zinc-400 mb-4">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
