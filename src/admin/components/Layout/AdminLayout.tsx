import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
  Flame,
  LayoutDashboard,
  Wrench,
  MessageSquare,
  Star,
  Briefcase,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Mail,
  User,
  Server,
  TrendingUp,
  Receipt,
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Contacts', href: '/admin/contacts', icon: Mail },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Factures', href: '/admin/invoices', icon: Receipt },
  { name: 'Services', href: '/admin/services', icon: Wrench },
  { name: 'FAQs', href: '/admin/faqs', icon: MessageSquare },
  { name: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { name: 'Projects', href: '/admin/projects', icon: Briefcase },
  { name: 'Hero Section', href: '/admin/hero', icon: Flame },
  { name: 'Media Library', href: '/admin/media', icon: Image },
  { name: 'Legal Pages', href: '/admin/legal', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'System Settings', href: '/admin/system-settings', icon: Server },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-800 border-r border-zinc-700 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-zinc-700">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-white">AK CHAUFFAGE</div>
              <div className="text-xs text-zinc-400">Admin Panel</div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-zinc-700">
            <div className="flex items-center gap-3 mb-3 px-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{user?.username}</div>
                <div className="text-xs text-zinc-500">{user?.role}</div>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/admin/profile"
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="p-6 lg:p-8">{children}</main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
