import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import { Receipt, Plus, Download, Trash2, Search, Filter, AlertCircle } from 'lucide-react';
import type { InvoiceListItem, InvoiceStats } from '../../types/invoice';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { useContent } from '../../contexts/ContentContext';

export default function Invoices() {
  const { settings } = useContent();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getInvoices({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
        limit,
        offset,
      });
      setInvoices(data.invoices);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminApi.getInvoiceStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [statusFilter, searchQuery, offset]);

  const handleDownloadPDF = async (id: number) => {
    try {
      const invoice = await adminApi.getInvoice(id);
      if (settings) {
        generateInvoicePDF(invoice, settings);
      }
    } catch (err) {
      alert('Failed to generate PDF');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture?')) return;

    try {
      await adminApi.deleteInvoice(id);
      fetchInvoices();
      fetchStats();
    } catch (err) {
      alert('Failed to delete invoice');
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      draft: 'bg-zinc-700 text-zinc-300',
      sent: 'bg-blue-500/20 text-blue-400',
      paid: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
    }[status];

    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      cancelled: 'Annulée',
    }[status];

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes}`}>
        {labels}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Factures</h1>
          <p className="text-zinc-400">Gérez les factures et suivez les paiements</p>
        </div>
        <Link
          to="/admin/invoices/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Facture
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
            <p className="text-zinc-400 text-sm mb-1">Total Factures</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
            <p className="text-zinc-400 text-sm mb-1">Payées</p>
            <p className="text-2xl font-bold text-green-400">{stats.paid}</p>
            <p className="text-xs text-zinc-500">€{stats.paidRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
            <p className="text-zinc-400 text-sm mb-1">Revenu Total</p>
            <p className="text-2xl font-bold text-white">€{stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
            <p className="text-zinc-400 text-sm mb-1">En Attente</p>
            <p className="text-2xl font-bold text-orange-400">€{stats.pendingRevenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par numéro, nom ou email..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white appearance-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="sent">Envoyées</option>
              <option value="paid">Payées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Aucune facture trouvée</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-900 border-b border-zinc-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      N° Facture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-zinc-900/50">
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{invoice.client_name}</div>
                        <div className="text-xs text-zinc-500">{invoice.client_email}</div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-white">
                        €{invoice.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {new Date(invoice.issue_date).toLocaleDateString('fr-BE')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/invoices/${invoice.id}`}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <Receipt className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDownloadPDF(invoice.id)}
                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Télécharger PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
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

            {/* Pagination */}
            {total > limit && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-700">
                <p className="text-sm text-zinc-400">
                  {offset + 1} - {Math.min(offset + limit, total)} sur {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                    className="px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + limit >= total}
                    className="px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
