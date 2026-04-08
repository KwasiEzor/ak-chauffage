import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LegalPage from './pages/LegalPage';
import { useContent } from './contexts/ContentContext';

// Admin imports (lazy loaded for code splitting)
import { lazy, Suspense } from 'react';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function App() {
  const { loading, error } = useContent();

  // Show loading state while fetching content
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Show error state if content fails to load
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Erreur de chargement</h1>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/legal/:slug" element={<LegalPage />} />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <Suspense
            fallback={
              <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }
          >
            <AdminApp />
          </Suspense>
        }
      />

      {/* 404 fallback */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-white mb-4">404</h1>
              <p className="text-zinc-400 mb-8">Page non trouvée</p>
              <a href="/" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                Retour à l'accueil
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
