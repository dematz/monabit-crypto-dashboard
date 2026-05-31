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
import { setRefreshTokenFn } from '@/services/api';
import { supabase } from '@/services/supabase';
import {
  fetchPreferences,
  updatePreferences as apiUpdatePreferences,
  fetchFavorites,
  addFavorite as apiAddFavorite,
  removeFavorite as apiRemoveFavorite,
} from '@/services/users-api';

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

      toggleFavorite: async (id) => {
        const current = get().favorites;
        const isFav = current.includes(id);
        set({ favorites: isFav ? current.filter((f) => f !== id) : [...current, id] });
        const user = get().user;
        if (user) {
          if (isFav) {
            apiRemoveFavorite(id).catch(() => set({ favorites: current }));
          } else {
            apiAddFavorite(id, id).catch(() => set({ favorites: current }));
          }
        }
      },

      setAiOpen: (aiOpen) => set({ aiOpen }),

      setSession: (user, token) => {
        set({ user, token });
        Promise.all([
          fetchPreferences()
            .then((prefs) => {
              set({
                theme: prefs.theme as Theme,
                currency: prefs.currency as Currency,
                refreshInterval: prefs.refresh_interval,
              });
            })
            .catch(() => {}),
          fetchFavorites()
            .then((favs) => {
              set({ favorites: favs.map((f) => f.coin_id) });
            })
            .catch(() => {}),
        ]);
      },

      logout: () => set({ user: null, token: null }),
    }),
    { name: 'monabit-app' },
  ),
);

setTokenGetter(() => useAppStore.getState().token);

setRefreshTokenFn(async () => {
  const { data } = await supabase.auth.refreshSession();
  if (data.session) {
    useAppStore.setState({ token: data.session.access_token });
    return data.session.access_token;
  }
  useAppStore.getState().logout();
  return null;
});
