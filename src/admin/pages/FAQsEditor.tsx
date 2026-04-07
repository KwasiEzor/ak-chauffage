import { useState, useMemo } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { adminApi } from '../../utils/api';
import { FAQ } from '../../types/content';
import { Save, AlertCircle, CheckCircle2, Pencil, Plus, Trash2, Search, Filter, CheckSquare, Square } from 'lucide-react';

export default function FAQsEditor() {
  const { content, refetch } = useContent();
  const [faqs, setFaqs] = useState<FAQ[]>(content?.faqs || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await adminApi.updateContentType('faqs', faqs);
      await refetch();
      setMessage({ type: 'success', text: 'FAQs updated successfully!' });
      setEditingId(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save FAQs',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateFAQ = (id: number, field: keyof FAQ, value: any) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq)));
  };

  const toggleActive = (id: number) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...faq, active: !faq.active } : faq)));
  };

  const deleteFAQ = (id: number) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter((faq) => faq.id !== id));
    }
  };

  const addNewFAQ = () => {
    const newId = Math.max(...faqs.map((f) => f.id), 0) + 1;
    const newFAQ: FAQ = {
      id: newId,
      question: 'New Question',
      answer: 'New Answer',
      category: 'General',
      active: true,
      order: faqs.length + 1,
    };
    setFaqs([...faqs, newFAQ]);
    setEditingId(newId);
  };

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(faqs.map((faq) => faq.category)));
  }, [faqs]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs
      .filter((faq) => {
        const matchesSearch =
          searchQuery === '' ||
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && faq.active) ||
          (statusFilter === 'inactive' && !faq.active);

        const matchesCategory =
          categoryFilter === 'all' || faq.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => a.order - b.order);
  }, [faqs, searchQuery, statusFilter, categoryFilter]);

  // Bulk operations
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFaqs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFaqs.map((f) => f.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const bulkActivate = () => {
    setFaqs(
      faqs.map((faq) =>
        selectedIds.includes(faq.id) ? { ...faq, active: true } : faq
      )
    );
    setSelectedIds([]);
  };

  const bulkDeactivate = () => {
    setFaqs(
      faqs.map((faq) =>
        selectedIds.includes(faq.id) ? { ...faq, active: false } : faq
      )
    );
    setSelectedIds([]);
  };

  const bulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} FAQs?`)) {
      setFaqs(faqs.filter((faq) => !selectedIds.includes(faq.id)));
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">FAQs Editor</h1>
          <p className="text-zinc-400">Manage frequently asked questions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addNewFAQ}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add FAQ
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
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
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-5 h-5 text-zinc-400" />

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
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
              {selectedIds.length} FAQ{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={bulkActivate}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Activate
              </button>
              <button
                onClick={bulkDeactivate}
                className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Deactivate
              </button>
              <button
                onClick={bulkDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {/* Select All */}
        {filteredFaqs.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <button
              onClick={toggleSelectAll}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {selectedIds.length === filteredFaqs.length ? (
                <CheckSquare className="w-5 h-5 text-orange-500" />
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <span className="text-sm text-zinc-400">
              Select all ({filteredFaqs.length} FAQ{filteredFaqs.length > 1 ? 's' : ''})
            </span>
          </div>
        )}

        {filteredFaqs.map((faq) => {
            const isEditing = editingId === faq.id;

            return (
              <div
                key={faq.id}
                className={`bg-zinc-800 border rounded-xl overflow-hidden transition-colors ${
                  faq.active ? 'border-zinc-700' : 'border-zinc-700/50 opacity-60'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleSelect(faq.id)}
                        className="text-zinc-400 hover:text-white transition-colors mt-1"
                      >
                        {selectedIds.includes(faq.id) ? (
                          <CheckSquare className="w-5 h-5 text-orange-500" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-xs font-medium">
                            {faq.category}
                          </span>
                          <span className="text-zinc-500 text-sm">FAQ #{faq.id}</span>
                        </div>
                      {isEditing ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                              Category
                            </label>
                            <input
                              type="text"
                              value={faq.category}
                              onChange={(e) => updateFAQ(faq.id, 'category', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                              Question
                            </label>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                              Answer
                            </label>
                            <textarea
                              value={faq.answer}
                              onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                              rows={4}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                          <p className="text-zinc-400 text-sm">{faq.answer}</p>
                        </>
                      )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => setEditingId(isEditing ? null : faq.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(faq.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          faq.active
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                        }`}
                      >
                        {faq.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => deleteFAQ(faq.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {/* No Results */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 bg-zinc-800 border border-zinc-700 rounded-xl">
            <p className="text-zinc-400 text-lg">No FAQs found</p>
            <p className="text-zinc-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
