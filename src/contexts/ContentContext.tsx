import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';
import type { SiteContent, SiteSettings } from '../types/content';

interface ContentContextType {
  content: SiteContent | null;
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [contentData, settingsData] = await Promise.all([
        api.getContent(),
        api.getSettings(),
      ]);

      setContent(contentData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ContentContext.Provider
      value={{
        content,
        settings,
        loading,
        error,
        refetch: fetchData,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
