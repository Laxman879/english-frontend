'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from './api';

interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  streakCount?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthContextType>({
  user: null, token: null, loading: true,
  loginWithGoogle: async () => {}, loginWithEmail: async () => {}, registerWithEmail: async () => {}, logout: () => {},
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) {
      setToken(saved);
      api.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => { localStorage.removeItem('token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const saveSession = (data: { token: string; user: User }) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const loginWithGoogle = async (accessToken: string) => {
    const { data } = await api.post('/auth/google', { access_token: accessToken });
    if (data.error) throw new Error(data.error);
    saveSession(data);
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveSession(data);
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    saveSession(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, token, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
