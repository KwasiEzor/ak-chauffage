import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { Save, AlertCircle, CheckCircle2, Plus, FileText } from 'lucide-react';
import type { LegalPage } from '../../types/gdpr';

export default function LegalEditor() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<LegalPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLegalPages();
  }, []);

  const fetchLegalPages = async () => {
    try {
      setLoading(true);
      const fullPages = await adminApi.getAdminLegalPages();
      setPages(fullPages);
      if (fullPages.length > 0) {
        setSelectedPage(fullPages[0]);
      }
    } catch (error) {
      console.error('Error fetching legal pages:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load legal pages',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPage) return;

    setSaving(true);
    setMessage(null);

    try {
      // Increment version number (e.g., "1.0" -> "1.1")
      const [major, minor] = selectedPage.version.split('.');
      const newVersion = `${major}.${parseInt(minor) + 1}`;

      const updatedPage = {
        ...selectedPage,
        version: newVersion,
      };

      await adminApi.updateLegalPage(selectedPage.id, updatedPage);
      await fetchLegalPages();
      setMessage({ type: 'success', text: 'Legal page updated successfully!' });

      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save legal page',
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePageField = (field: keyof LegalPage, value: any) => {
    if (!selectedPage) return;
    setSelectedPage({ ...selectedPage, [field]: value });
  };

  const updateSection = (sectionId: string, field: string, value: any) => {
    if (!selectedPage) return;

    const updatedSections = selectedPage.sections.map(section =>
      section.id === sectionId ? { ...section, [field]: value } : section
    );

    setSelectedPage({ ...selectedPage, sections: updatedSections });
  };

  const addSection = () => {
    if (!selectedPage) return;

    const newSection = {
      id: `section-${Date.now()}`,
      heading: 'Nouvelle Section',
      content: '<p>Contenu de la section...</p>',
      order: selectedPage.sections.length + 1,
    };

    setSelectedPage({
      ...selectedPage,
      sections: [...selectedPage.sections, newSection],
    });
  };

  const removeSection = (sectionId: string) => {
    if (!selectedPage) return;

    const updatedSections = selectedPage.sections
      .filter(s => s.id !== sectionId)
      .map((s, index) => ({ ...s, order: index + 1 }));

    setSelectedPage({ ...selectedPage, sections: updatedSections });
  };

  const moveSectionUp = (sectionId: string) => {
    if (!selectedPage) return;

    const sections = [...selectedPage.sections].sort((a, b) => a.order - b.order);
    const index = sections.findIndex(s => s.id === sectionId);

    if (index > 0) {
      [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
      sections.forEach((s, i) => s.order = i + 1);
      setSelectedPage({ ...selectedPage, sections });
    }
  };

  const moveSectionDown = (sectionId: string) => {
    if (!selectedPage) return;

    const sections = [...selectedPage.sections].sort((a, b) => a.order - b.order);
    const index = sections.findIndex(s => s.id === sectionId);

    if (index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      sections.forEach((s, i) => s.order = i + 1);
      setSelectedPage({ ...selectedPage, sections });
    }
  };

  const toggleSectionExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-400">Loading legal pages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Legal Pages Editor</h1>
          <p className="text-zinc-400">Manage legal documents and compliance pages</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !selectedPage}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
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
          <p>{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Page List Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">Legal Pages</h3>
            <div className="space-y-2">
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    selectedPage?.id === page.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{page.title}</div>
                    <div className="text-xs opacity-70">v{page.version}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Page Editor */}
        <div className="col-span-12 lg:col-span-9">
          {selectedPage ? (
            <div className="space-y-6">
              {/* Page Info */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Page Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedPage.title}
                      onChange={(e) => updatePageField('title', e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={selectedPage.slug}
                      onChange={(e) => updatePageField('slug', e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Version
                    </label>
                    <input
                      type="text"
                      value={selectedPage.version}
                      readOnly
                      className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-500 cursor-not-allowed"
                      title="Version is auto-incremented on save"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedPage.active ? 'active' : 'inactive'}
                      onChange={(e) => updatePageField('active', e.target.value === 'active')}
                      className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Sections</h3>
                  <button
                    onClick={addSection}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Section
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedPage.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <div key={section.id} className="bg-zinc-700 border border-zinc-600 rounded-lg overflow-hidden">
                        {/* Section Header */}
                        <div className="p-4 flex items-center justify-between bg-zinc-750">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-zinc-400 font-mono text-sm">#{section.order}</span>
                            <input
                              type="text"
                              value={section.heading}
                              onChange={(e) => updateSection(section.id, 'heading', e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-zinc-600 border border-zinc-500 rounded text-white focus:outline-none focus:border-orange-500"
                              placeholder="Section heading"
                            />
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => moveSectionUp(section.id)}
                              disabled={index === 0}
                              className="p-1.5 hover:bg-zinc-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ChevronUp className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button
                              onClick={() => moveSectionDown(section.id)}
                              disabled={index === selectedPage.sections.length - 1}
                              className="p-1.5 hover:bg-zinc-600 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ChevronDown className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button
                              onClick={() => toggleSectionExpanded(section.id)}
                              className="p-1.5 hover:bg-zinc-600 rounded"
                              title={expandedSections.has(section.id) ? 'Collapse' : 'Expand'}
                            >
                              {expandedSections.has(section.id) ? (
                                <ChevronUp className="w-4 h-4 text-zinc-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-zinc-400" />
                              )}
                            </button>
                            <button
                              onClick={() => removeSection(section.id)}
                              className="p-1.5 hover:bg-red-600 rounded text-red-400 hover:text-white"
                              title="Remove section"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Section Content */}
                        {expandedSections.has(section.id) && (
                          <div className="p-4">
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                              Content (HTML)
                            </label>
                            <textarea
                              value={section.content}
                              onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                              rows={8}
                              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-orange-500 resize-y"
                              placeholder="<p>Section content in HTML...</p>"
                            />
                            <p className="mt-2 text-xs text-zinc-500">
                              You can use HTML tags: &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a&gt;, &lt;br&gt;, etc.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                  {selectedPage.sections.length === 0 && (
                    <div className="text-center py-8 text-zinc-500">
                      No sections yet. Click "Add Section" to create one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Select a legal page to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
