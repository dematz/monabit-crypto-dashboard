import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, Currency, SessionUser } from '@/types';

export type { Theme, Currency };

type AppState = {
  theme: Theme;
  currency: Currency;
  refreshInterval: number;
  favorites: string[];
  aiOpen: boolean;
  user: SessionUser;
  setTheme: (t: Theme) => void;
  setCurrency: (c: Currency) => void;
  setRefreshInterval: (n: number) => void;
  toggleFavorite: (id: string) => void;
  setAiOpen: (open: boolean) => void;
  login: (u: NonNullable<SessionUser>) => void;
  logout: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      currency: 'USD',
      refreshInterval: 30,
      favorites: ['bitcoin', 'ethereum'],
      aiOpen: false,
      user: { name: 'María González', email: 'maria@monabit.io', role: 'Admin' },
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
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'monabit-app' },
  ),
);