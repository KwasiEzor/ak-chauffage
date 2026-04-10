import { useState, useEffect } from 'react';
import { Search, Mail, Phone, Calendar, Download, RefreshCw, Trash2, Eye } from 'lucide-react';
import { adminApi } from '../../utils/api';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: 'pending' | 'contacted' | 'completed' | 'archived';
  notes: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  contacted: number;
  completed: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  popularServices: Array<{ service: string; count: number }>;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  contacted: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-600 border-green-500/20',
  archived: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [search, statusFilter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getContacts({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setContacts(data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminApi.getContactStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateContact = async (id: number, updates: Partial<Contact>) => {
    try {
      await adminApi.updateContact(id, updates);

      await fetchContacts();
      await fetchStats();

      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const deleteContact = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;

    try {
      await adminApi.deleteContact(id);

      await fetchContacts();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const exportToCSV = async () => {
    try {
      const blob = await adminApi.exportContacts();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'contacts.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error exporting contacts:', error);
      alert('Erreur lors de l’export CSV');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Demandes de Contact</h1>
          <p className="text-zinc-400 mt-1">Gérez toutes les demandes clients</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
          <button
            onClick={() => { fetchContacts(); fetchStats(); }}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div className="text-zinc-400 text-sm">Total</div>
            <div className="text-3xl font-bold text-white mt-1">{stats.total}</div>
            <div className="text-xs text-zinc-500 mt-1">Toutes les demandes</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div className="text-zinc-400 text-sm">En attente</div>
            <div className="text-3xl font-bold text-yellow-500 mt-1">{stats.pending}</div>
            <div className="text-xs text-zinc-500 mt-1">À traiter</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div className="text-zinc-400 text-sm">Cette semaine</div>
            <div className="text-3xl font-bold text-blue-500 mt-1">{stats.thisWeek}</div>
            <div className="text-xs text-zinc-500 mt-1">7 derniers jours</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div className="text-zinc-400 text-sm">Aujourd'hui</div>
            <div className="text-3xl font-bold text-green-500 mt-1">{stats.today}</div>
            <div className="text-xs text-zinc-500 mt-1">Nouvelles demandes</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">Nouveau</option>
          <option value="contacted">Contacté</option>
          <option value="completed">Terminé</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      {/* Contacts Table */}
      <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            Chargement...
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune demande trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-zinc-700/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{contact.name}</div>
                      <div className="text-sm text-zinc-400 flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </div>
                      <div className="text-sm text-zinc-400 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-white">{contact.service}</td>
                    <td className="px-4 py-4 text-zinc-400 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(contact.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={contact.status}
                        onChange={(e) => updateContact(contact.id, { status: e.target.value as any })}
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[contact.status]}`}
                      >
                        <option value="pending">Nouveau</option>
                        <option value="contacted">Contacté</option>
                        <option value="completed">Terminé</option>
                        <option value="archived">Archivé</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedContact(null)}>
          <div className="bg-zinc-800 rounded-lg max-w-2xl w-full p-6 border border-zinc-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedContact.name}</h2>
                <p className="text-zinc-400">{selectedContact.email}</p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400">Téléphone</label>
                <p className="text-white">{selectedContact.phone}</p>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Service demandé</label>
                <p className="text-white">{selectedContact.service}</p>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Message</label>
                <p className="text-white bg-zinc-900 p-3 rounded-lg">{selectedContact.message || 'Aucun message'}</p>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Date de soumission</label>
                <p className="text-white">{new Date(selectedContact.created_at).toLocaleString('fr-FR')}</p>
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">Notes internes</label>
                <textarea
                  defaultValue={selectedContact.notes || ''}
                  onBlur={(e) => updateContact(selectedContact.id, { notes: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  rows={3}
                  placeholder="Ajouter des notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Envoyer un email
                </a>
                <a
                  href={`tel:${selectedContact.phone}`}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Appeler
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
