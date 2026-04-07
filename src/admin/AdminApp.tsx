import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServicesEditor from './pages/ServicesEditor';
import FAQsEditor from './pages/FAQsEditor';
import TestimonialsEditor from './pages/TestimonialsEditor';
import ProjectsEditor from './pages/ProjectsEditor';
import AdminLayout from './components/Layout/AdminLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<Dashboard />} />
                <Route path="services" element={<ServicesEditor />} />
                <Route path="faqs" element={<FAQsEditor />} />
                <Route path="testimonials" element={<TestimonialsEditor />} />
                <Route path="projects" element={<ProjectsEditor />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
