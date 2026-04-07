import { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { adminApi } from '../../utils/api';
import { FAQ } from '../../types/content';
import { Save, AlertCircle, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';

export default function FAQsEditor() {
  const { content, refetch } = useContent();
  const [faqs, setFaqs] = useState<FAQ[]>(content?.faqs || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

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

      {/* FAQs List */}
      <div className="space-y-4">
        {faqs
          .sort((a, b) => a.order - b.order)
          .map((faq) => {
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
                    <div className="flex items-center gap-2 ml-4">
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
      </div>
    </div>
  );
}
