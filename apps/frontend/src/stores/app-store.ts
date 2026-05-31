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
import { fetchPreferences, updatePreferences as apiUpdatePreferences } from '@/services/users-api';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      currency: 'USD',
      refreshInterval: 30,
      favorites: ['bitcoin', 'ethereum'],
      aiOpen: false,
      user: null,
      token: null,

      setTheme: async (theme) => {
        set({ theme });
        const user = get().user;
        if (user) apiUpdatePreferences({ theme }).catch(() => {});
      },

      setCurrency: async (currency) => {
        set({ currency });
        const user = get().user;
        if (user) apiUpdatePreferences({ currency }).catch(() => {});
      },

      setRefreshInterval: async (refreshInterval) => {
        set({ refreshInterval });
        const user = get().user;
        if (user) apiUpdatePreferences({ refresh_interval: refreshInterval }).catch(() => {});
      },

      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      setAiOpen: (aiOpen) => set({ aiOpen }),

      setSession: (user, token) => {
        set({ user, token });
        fetchPreferences()
          .then((prefs) => {
            set({
              theme: (prefs.theme as Theme) ?? 'dark',
              currency: (prefs.currency as Currency) ?? 'USD',
              refreshInterval: prefs.refresh_interval ?? 30,
            });
          })
          .catch(() => {});
      },

      logout: () => set({ user: null, token: null }),
    }),
    { name: 'monabit-app' },
  ),
);

setTokenGetter(() => useAppStore.getState().token);
