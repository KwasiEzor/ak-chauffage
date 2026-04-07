import { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { adminApi } from '../../utils/api';
import { Project } from '../../types/content';
import { Save, AlertCircle, CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react';

export default function ProjectsEditor() {
  const { content, refetch } = useContent();
  const [projects, setProjects] = useState<Project[]>(content?.projects || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await adminApi.updateContentType('projects', projects);
      await refetch();
      setMessage({ type: 'success', text: 'Projects updated successfully!' });
      setEditingId(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save projects',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateProject = (id: number, field: keyof Project, value: any) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const toggleActive = (id: number) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const deleteProject = (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter((p) => p.id !== id));
    }
  };

  const addNewProject = () => {
    const newId = Math.max(...projects.map((p) => p.id), 0) + 1;
    const newProject: Project = {
      id: newId,
      title: 'New Project',
      location: 'Charleroi',
      date: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      description: 'Project description here...',
      image: '/images/project-1.jpg',
      category: 'Installation',
      active: true,
      order: projects.length + 1,
    };
    setProjects([...projects, newProject]);
    setEditingId(newId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects Editor</h1>
          <p className="text-zinc-400">Manage recent projects and case studies</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addNewProject}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Project
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

      <div className="grid md:grid-cols-2 gap-6">
        {projects
          .sort((a, b) => a.order - b.order)
          .map((project) => {
            const isEditing = editingId === project.id;

            return (
              <div
                key={project.id}
                className={`bg-zinc-800 border rounded-xl overflow-hidden transition-colors ${
                  project.active ? 'border-zinc-700' : 'border-zinc-700/50 opacity-60'
                }`}
              >
                <div className="aspect-video bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm">
                  {project.image}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-xs font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          value={project.category}
                          onChange={(e) => updateProject(project.id, 'category', e.target.value)}
                          className="bg-transparent w-24"
                        />
                      ) : (
                        project.category
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(isEditing ? null : project.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(project.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          project.active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {project.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Title</label>
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={project.location}
                            onChange={(e) => updateProject(project.id, 'location', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Date</label>
                          <input
                            type="text"
                            value={project.date}
                            onChange={(e) => updateProject(project.id, 'date', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                          Description
                        </label>
                        <textarea
                          value={project.description}
                          onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                          rows={3}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                          Image Path
                        </label>
                        <input
                          type="text"
                          value={project.image}
                          onChange={(e) => updateProject(project.id, 'image', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <div className="flex gap-4 text-sm text-zinc-500 mb-3">
                        <span>📍 {project.location}</span>
                        <span>📅 {project.date}</span>
                      </div>
                      <p className="text-zinc-400 text-sm">{project.description}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
