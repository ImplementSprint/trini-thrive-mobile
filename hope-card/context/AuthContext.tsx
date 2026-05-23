import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { setToken as setApiToken, setUnauthorizedHandler } from '../services/api';

const TOKEN_KEY = 'hopecard_jwt';

export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  persona: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  saveToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwt(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      persona: payload.persona,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setLocalToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const clearToken = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setApiToken(null);
    setLocalToken(null);
    setUser(null);
  }, []);

  const saveToken = useCallback(async (jwt: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, jwt);
    setApiToken(jwt);
    setLocalToken(jwt);
    setUser(decodeJwt(jwt));
  }, []);

  // Load persisted token on mount
  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then((stored) => {
      if (stored) {
        setApiToken(stored);
        setLocalToken(stored);
        setUser(decodeJwt(stored));
      }
      setIsLoading(false);
    });
  }, []);

  // Wire 401 handler — clear token and redirect to login
  const clearTokenRef = useRef(clearToken);
  clearTokenRef.current = clearToken;

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearTokenRef.current();
      router.replace('/(auth)/login');
    });
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, saveToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
