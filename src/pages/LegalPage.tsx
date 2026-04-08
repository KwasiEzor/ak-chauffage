import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { LegalPage as LegalPageType } from '../types/gdpr';

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<LegalPageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLegalPage = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/legal/${slug}`);

        if (!response.ok) {
          throw new Error('Page non trouvée');
        }

        const data = await response.json();
        setPage(data);
      } catch (err) {
        console.error('Error fetching legal page:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la page');
      } finally {
        setLoading(false);
      }
    };

    fetchLegalPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-zinc-400">Chargement...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Page non trouvée</h1>
            <p className="text-zinc-400 mb-8">{error || 'La page demandée n\'existe pas.'}</p>
            <Link
              to="/"
              className="inline-block btn-primary px-8 py-3"
            >
              Retour à l'accueil
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header />

      <main className="container mx-auto px-4 py-20">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2 text-zinc-400">
            <li>
              <Link to="/" className="hover:text-orange-500 transition-colors">
                Accueil
              </Link>
            </li>
            <li className="before:content-['/'] before:mx-2">
              <span className="text-white">{page.title}</span>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {page.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>Dernière mise à jour : {new Date(page.lastUpdated).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</span>
            <span className="before:content-['•'] before:mx-2">
              Version {page.version}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {page.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <section
                key={section.id}
                className="card-premium p-8 print:border-none print:shadow-none"
              >
                <h2 className="text-2xl font-bold mb-4 text-white">
                  {section.heading}
                </h2>
                <div
                  className="prose prose-invert prose-orange max-w-none
                    prose-headings:text-white prose-headings:font-semibold
                    prose-p:text-zinc-300 prose-p:leading-relaxed
                    prose-a:text-orange-500 prose-a:no-underline hover:prose-a:text-orange-400
                    prose-strong:text-white prose-strong:font-semibold
                    prose-ul:text-zinc-300 prose-li:text-zinc-300
                    prose-code:text-orange-500 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-table:border-collapse prose-th:border prose-th:border-zinc-700 prose-th:p-2 prose-th:bg-zinc-900
                    prose-td:border prose-td:border-zinc-700 prose-td:p-2"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </section>
            ))}
        </div>

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="card-premium p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Des questions ?</h3>
            <p className="text-zinc-400 mb-6">
              Si vous avez des questions concernant cette page ou nos pratiques,
              n'hésitez pas à nous contacter.
            </p>
            <Link
              to="/#contact"
              className="inline-block btn-primary px-8 py-3"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      {/* Print Styles */}
      <style>{`
        @media print {
          header, footer, .no-print {
            display: none !important;
          }
          .card-premium {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
