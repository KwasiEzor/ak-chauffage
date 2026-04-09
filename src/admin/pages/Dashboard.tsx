import { useContent } from '../../contexts/ContentContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import type { InvoiceStats } from '../../types/invoice';
import {
  Wrench,
  MessageSquare,
  Star,
  Briefcase,
  TrendingUp,
  Eye,
  ArrowRight,
  Receipt,
  Users,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsStats {
  totalPageViews: number;
  uniqueVisitors: number;
  dailyViews: { date: string; views: number }[];
}

export default function Dashboard() {
  const { content } = useContent();
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStats | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [invoices, analytics] = await Promise.all([
          adminApi.getInvoiceStats(),
          adminApi.getAnalyticsStats(7).catch(() => null), // Gracefully handle if analytics not available
        ]);
        setInvoiceStats(invoices);
        setAnalyticsStats(analytics);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      name: 'Services',
      value: content?.services?.length || 0,
      icon: Wrench,
      href: '/admin/services',
      color: 'bg-blue-500',
    },
    {
      name: 'Factures',
      value: invoiceStats?.total || 0,
      icon: Receipt,
      href: '/admin/invoices',
      color: 'bg-orange-500',
      subtitle: `${invoiceStats?.paid || 0} payées`,
    },
    {
      name: 'FAQs',
      value: content?.faqs?.length || 0,
      icon: MessageSquare,
      href: '/admin/faqs',
      color: 'bg-green-500',
    },
    {
      name: 'Testimonials',
      value: content?.testimonials?.length || 0,
      icon: Star,
      href: '/admin/testimonials',
      color: 'bg-yellow-500',
    },
    {
      name: 'Projects',
      value: content?.projects?.length || 0,
      icon: Briefcase,
      href: '/admin/projects',
      color: 'bg-purple-500',
    },
  ];

  const quickActions = [
    {
      name: 'Edit Services',
      description: 'Manage your service offerings',
      href: '/admin/services',
      icon: Wrench,
    },
    {
      name: 'View Public Site',
      description: 'See how your changes look',
      href: '/',
      icon: Eye,
      external: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Welcome back! Here's an overview of your content.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-orange-500 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-zinc-600 group-hover:text-orange-500 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="flex flex-col">
              <div className="text-sm text-zinc-400">{stat.name}</div>
              {stat.subtitle && <div className="text-xs text-zinc-500">{stat.subtitle}</div>}
            </div>
          </Link>
        ))}
      </div>

      {/* Visitor Analytics Summary */}
      {analyticsStats && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Visiteurs (7 derniers jours)</h2>
              <p className="text-sm text-zinc-400">Aperçu de l'activité du site</p>
            </div>
            <Link
              to="/admin/analytics"
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-lg transition-colors text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              Voir tout
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-900/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{analyticsStats.totalPageViews}</p>
                  <p className="text-xs text-zinc-400">Vues totales</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{analyticsStats.uniqueVisitors}</p>
                  <p className="text-xs text-zinc-400">Visiteurs uniques</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {analyticsStats.uniqueVisitors > 0
                      ? (analyticsStats.totalPageViews / analyticsStats.uniqueVisitors).toFixed(1)
                      : '0'}
                  </p>
                  <p className="text-xs text-zinc-400">Pages/visite</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsStats.dailyViews}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  dataKey="date"
                  stroke="#a1a1aa"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#a1a1aa" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  name="Vues"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              target={action.external ? '_blank' : undefined}
              className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 hover:border-orange-500 transition-colors group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <action.icon className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1 group-hover:text-orange-500 transition-colors">
                  {action.name}
                </h3>
                <p className="text-sm text-zinc-400">{action.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-orange-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-400">Last Updated:</span>
            <span className="text-white ml-2">{new Date().toLocaleString()}</span>
          </div>
          <div>
            <span className="text-zinc-400">Content Status:</span>
            <span className="text-green-500 ml-2">✓ Loaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
