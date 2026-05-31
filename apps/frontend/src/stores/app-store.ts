import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Currency = 'USD' | 'EUR';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
} | null;

type AppState = {
  theme: Theme;
  currency: Currency;
  refreshInterval: number;
  favorites: string[];
  aiOpen: boolean;
  user: SessionUser;
  token: string | null;
  setTheme: (t: Theme) => void;
  setCurrency: (c: Currency) => void;
  setRefreshInterval: (n: number) => void;
  toggleFavorite: (id: string) => void;
  setAiOpen: (open: boolean) => void;
  setSession: (user: NonNullable<SessionUser>, token: string) => void;
  logout: () => void;
};

import { setTokenGetter } from '@/services/api';

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      currency: 'USD',
      refreshInterval: 30,
      favorites: ['bitcoin', 'ethereum'],
      aiOpen: false,
      user: null,
      token: null,
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      setAiOpen: (aiOpen) => set({ aiOpen }),
      setSession: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'monabit-app' },
  ),
);

setTokenGetter(() => useAppStore.getState().token);
