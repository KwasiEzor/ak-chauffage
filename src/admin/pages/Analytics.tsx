import { lazy, Suspense, useEffect, useState } from 'react';
import { adminApi } from '../../utils/api';
import { TrendingUp, Users, Eye, Calendar, AlertCircle } from 'lucide-react';

const AnalyticsCharts = lazy(() => import('../components/charts/AnalyticsCharts'));

interface AnalyticsStats {
  totalPageViews: number;
  uniqueVisitors: number;
  dailyViews: { date: string; views: number }[];
  popularPages: { page_path: string; views: number }[];
  trafficSources: { name: string; value: number }[];
  deviceBreakdown: { name: string; value: number }[];
}

export default function Analytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(7);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAnalyticsStats(timeRange);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const avgViewsPerDay = stats.totalPageViews / timeRange;
  const chartFallback = (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 text-sm text-zinc-500">
      Chargement des graphiques...
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytique des Visiteurs</h1>
          <p className="text-zinc-400">
            Statistiques et comportement des visiteurs sur le site
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Vues Totales</p>
              <p className="text-3xl font-bold text-white">{stats.totalPageViews}</p>
              <p className="text-zinc-500 text-xs mt-1">
                {Math.round(avgViewsPerDay)} par jour
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Visiteurs Uniques</p>
              <p className="text-3xl font-bold text-white">{stats.uniqueVisitors}</p>
              <p className="text-zinc-500 text-xs mt-1">Sessions distinctes</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-1">Pages par Visite</p>
              <p className="text-3xl font-bold text-white">
                {stats.uniqueVisitors > 0
                  ? (stats.totalPageViews / stats.uniqueVisitors).toFixed(1)
                  : '0'}
              </p>
              <p className="text-zinc-500 text-xs mt-1">Moyenne</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={chartFallback}>
        <AnalyticsCharts stats={stats} />
      </Suspense>

      {/* GDPR Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-blue-400 text-sm">
          <strong>Conformité GDPR:</strong> Les statistiques sont anonymes et agrégées.
          Aucune donnée personnelle n'est collectée. Seul un cookie de session temporaire
          (30 min) est utilisé pour compter les visiteurs uniques.
        </p>
      </div>
    </div>
  );
}
