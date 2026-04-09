import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminApi, setToken, removeToken } from '../utils/api';
import type { User } from '../types/content';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const verifyAuth = async () => {
      // Only verify if we have a token or we're on an admin route
      const hasToken = localStorage.getItem('admin_token');
      const isAdminRoute = window.location.pathname.startsWith('/admin');

      if (!hasToken && !isAdminRoute) {
        // No token and not on admin route - skip verification
        setLoading(false);
        return;
      }

      if (!hasToken) {
        // No token but on admin route - just stop loading
        setLoading(false);
        return;
      }

      // We have a token - verify it
      try {
        const response = await adminApi.verifyToken();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          removeToken();
        }
      } catch (error) {
        // Silent fail - token is invalid, remove it
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await adminApi.login(username, password);
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
