import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { TrendingUp, Users, Eye, Calendar, AlertCircle } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

  // Chart colors
  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

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

      {/* Daily Views Chart */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Vues Quotidiennes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.dailyViews}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="date" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="views"
              name="Vues"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ fill: '#f97316' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Popular Pages */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Pages Populaires</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.popularPages.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="page_path" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
              <YAxis stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="views" name="Vues" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Sources de Trafic</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.trafficSources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.trafficSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Device Breakdown */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">Appareils Utilisés</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.deviceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.deviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

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
