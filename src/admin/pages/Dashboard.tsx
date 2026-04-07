import { useContent } from '../../contexts/ContentContext';
import { Link } from 'react-router-dom';
import {
  Wrench,
  MessageSquare,
  Star,
  Briefcase,
  TrendingUp,
  Eye,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard() {
  const { content } = useContent();

  const stats = [
    {
      name: 'Services',
      value: content?.services?.length || 0,
      icon: Wrench,
      href: '/admin/services',
      color: 'bg-blue-500',
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="text-sm text-zinc-400">{stat.name}</div>
          </Link>
        ))}
      </div>

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
