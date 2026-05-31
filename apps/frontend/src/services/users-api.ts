import type { UserProfile, UserPreferences } from '@monabit/shared-types';
import { api } from './api';

export function fetchUsers(): Promise<UserProfile[]> {
  return api.get('/users');
}

export function deactivateUser(id: string): Promise<UserProfile> {
  return api.delete(`/users/${id}`);
}

export function updateUser(
  id: string,
  data: Partial<Pick<UserProfile, 'display_name' | 'role' | 'is_active'>>,
): Promise<UserProfile> {
  return api.patch(`/users/${id}`, data);
}

export function fetchPreferences(): Promise<UserPreferences> {
  return api.get('/users/me/preferences');
}

export function updatePreferences(
  data: Partial<Pick<UserPreferences, 'theme' | 'currency' | 'refresh_interval'>>,
): Promise<UserPreferences> {
  return api.patch('/users/me/preferences', data);
}

export interface Favorite {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  added_at: string;
}

export function fetchFavorites(): Promise<Favorite[]> {
  return api.get('/users/me/favorites');
}

export function addFavorite(coinId: string, coinSymbol: string): Promise<Favorite> {
  return api.post('/users/me/favorites', { coin_id: coinId, coin_symbol: coinSymbol });
}

export function removeFavorite(coinId: string): Promise<Favorite> {
  return api.delete(`/users/me/favorites/${coinId}`);
}

export interface PriceAlert {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  condition: 'above' | 'below';
  target_price: number;
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
}

export function fetchAlerts(): Promise<PriceAlert[]> {
  return api.get('/users/me/alerts');
}

export function createAlert(
  coinId: string,
  coinSymbol: string,
  condition: 'above' | 'below',
  targetPrice: number,
): Promise<PriceAlert> {
  return api.post('/users/me/alerts', {
    coin_id: coinId,
    coin_symbol: coinSymbol,
    condition,
    target_price: targetPrice,
  });
}

export function deactivateAlert(alertId: string): Promise<PriceAlert> {
  return api.patch(`/users/me/alerts/${alertId}/deactivate`);
}

export function deleteAlert(alertId: string): Promise<PriceAlert> {
  return api.delete(`/users/me/alerts/${alertId}`);
}
