import { useState, useMemo } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { adminApi } from '../../utils/api';
import { Service } from '../../types/content';
import { Save, AlertCircle, CheckCircle2, Pencil, Search, Filter, CheckSquare, Square } from 'lucide-react';

export default function ServicesEditor() {
  const { content, refetch } = useContent();
  const [services, setServices] = useState<Service[]>(content?.services || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  // Filtered services based on search and status
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        searchQuery === '' ||
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && service.active) ||
        (statusFilter === 'inactive' && !service.active);

      return matchesSearch && matchesStatus;
    });
  }, [services, searchQuery, statusFilter]);

  // Bulk operations
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredServices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredServices.map((s) => s.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const bulkActivate = () => {
    setServices(
      services.map((service) =>
        selectedIds.includes(service.id) ? { ...service, active: true } : service
      )
    );
    setSelectedIds([]);
  };

  const bulkDeactivate = () => {
    setServices(
      services.map((service) =>
        selectedIds.includes(service.id) ? { ...service, active: false } : service
      )
    );
    setSelectedIds([]);
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

      {/* Search and Filters */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-zinc-400" />
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-green-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'inactive'
                    ? 'bg-zinc-500 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-700 flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              {selectedIds.length} service{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={bulkActivate}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Activate Selected
              </button>
              <button
                onClick={bulkDeactivate}
                className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Deactivate Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {/* Select All */}
        {filteredServices.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <button
              onClick={toggleSelectAll}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {selectedIds.length === filteredServices.length ? (
                <CheckSquare className="w-5 h-5 text-orange-500" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <span className="text-sm text-zinc-400">
              Select all ({filteredServices.length} service{filteredServices.length > 1 ? 's' : ''})
            </span>
          </div>
        )}

        {filteredServices.map((service) => {
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
                    <button
                      onClick={() => toggleSelect(service.id)}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      {selectedIds.includes(service.id) ? (
                        <CheckSquare className="w-5 h-5 text-orange-500" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
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

        {/* No Results */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12 bg-zinc-800 border border-zinc-700 rounded-xl">
            <p className="text-zinc-400 text-lg">No services found</p>
            <p className="text-zinc-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
