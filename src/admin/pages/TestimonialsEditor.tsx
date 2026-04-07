import { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { adminApi } from '../../utils/api';
import { Testimonial } from '../../types/content';
import { Save, AlertCircle, CheckCircle2, Pencil, Plus, Trash2, Star } from 'lucide-react';

export default function TestimonialsEditor() {
  const { content, refetch } = useContent();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(content?.testimonials || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await adminApi.updateContentType('testimonials', testimonials);
      await refetch();
      setMessage({ type: 'success', text: 'Testimonials updated successfully!' });
      setEditingId(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save testimonials',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateTestimonial = (id: number, field: keyof Testimonial, value: any) => {
    setTestimonials(
      testimonials.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const toggleActive = (id: number) => {
    setTestimonials(
      testimonials.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const deleteTestimonial = (id: number) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      setTestimonials(testimonials.filter((t) => t.id !== id));
    }
  };

  const addNewTestimonial = () => {
    const newId = Math.max(...testimonials.map((t) => t.id), 0) + 1;
    const newTestimonial: Testimonial = {
      id: newId,
      name: 'New Client',
      location: 'Charleroi',
      rating: 5,
      text: 'Testimonial text here...',
      service: 'Service name',
      avatar: 'NC',
      active: true,
      order: testimonials.length + 1,
    };
    setTestimonials([...testimonials, newTestimonial]);
    setEditingId(newId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Testimonials Editor</h1>
          <p className="text-zinc-400">Manage customer testimonials and reviews</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addNewTestimonial}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Testimonial
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

      <div className="grid gap-4">
        {testimonials
          .sort((a, b) => a.order - b.order)
          .map((testimonial) => {
            const isEditing = editingId === testimonial.id;

            return (
              <div
                key={testimonial.id}
                className={`bg-zinc-800 border rounded-xl p-6 transition-colors ${
                  testimonial.active ? 'border-zinc-700' : 'border-zinc-700/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                      {isEditing ? (
                        <input
                          type="text"
                          value={testimonial.avatar}
                          onChange={(e) => updateTestimonial(testimonial.id, 'avatar', e.target.value)}
                          className="w-full bg-transparent text-center"
                          maxLength={2}
                        />
                      ) : (
                        testimonial.avatar
                      )}
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(testimonial.id, 'name', e.target.value)}
                          className="text-lg font-bold bg-zinc-900 border border-zinc-700 rounded px-3 py-1 text-white mb-1"
                        />
                      ) : (
                        <h3 className="text-lg font-bold text-white">{testimonial.name}</h3>
                      )}
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? 'text-orange-500 fill-orange-500' : 'text-zinc-600'
                            } ${isEditing ? 'cursor-pointer' : ''}`}
                            onClick={() =>
                              isEditing && updateTestimonial(testimonial.id, 'rating', i + 1)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(isEditing ? null : testimonial.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(testimonial.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        testimonial.active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {testimonial.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => deleteTestimonial(testimonial.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Location</label>
                        <input
                          type="text"
                          value={testimonial.location}
                          onChange={(e) => updateTestimonial(testimonial.id, 'location', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Service</label>
                        <input
                          type="text"
                          value={testimonial.service}
                          onChange={(e) => updateTestimonial(testimonial.id, 'service', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Testimonial</label>
                      <textarea
                        value={testimonial.text}
                        onChange={(e) => updateTestimonial(testimonial.id, 'text', e.target.value)}
                        rows={4}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-zinc-300 mb-3">"{testimonial.text}"</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-zinc-500">📍 {testimonial.location}</span>
                      <span className="text-orange-400">🔧 {testimonial.service}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
