import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ServicesEditor = lazy(() => import('./pages/ServicesEditor'));
const FAQsEditor = lazy(() => import('./pages/FAQsEditor'));
const TestimonialsEditor = lazy(() => import('./pages/TestimonialsEditor'));
const ProjectsEditor = lazy(() => import('./pages/ProjectsEditor'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary'));
const SettingsEditor = lazy(() => import('./pages/SettingsEditor'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));
const HeroEditor = lazy(() => import('./pages/HeroEditor'));
const LegalEditor = lazy(() => import('./pages/LegalEditor'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Invoices = lazy(() => import('./pages/Invoices'));
const InvoiceEditor = lazy(() => import('./pages/InvoiceEditor'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminLayout = lazy(() => import('./components/Layout/AdminLayout'));

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <RouteLoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default function AdminApp() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="contacts" element={<Contacts />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="invoices/new" element={<InvoiceEditor />} />
                  <Route path="invoices/:id" element={<InvoiceEditor />} />
                  <Route path="services" element={<ServicesEditor />} />
                  <Route path="faqs" element={<FAQsEditor />} />
                  <Route path="testimonials" element={<TestimonialsEditor />} />
                  <Route path="projects" element={<ProjectsEditor />} />
                  <Route path="hero" element={<HeroEditor />} />
                  <Route path="media" element={<MediaLibrary />} />
                  <Route path="legal" element={<LegalEditor />} />
                  <Route path="settings" element={<SettingsEditor />} />
                  <Route path="system-settings" element={<SystemSettings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
