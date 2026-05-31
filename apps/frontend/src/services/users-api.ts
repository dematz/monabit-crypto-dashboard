import { api } from './api';
import { z } from 'zod';
import {
  userProfileSchema,
  userPreferencesSchema,
  favoriteSchema,
  priceAlertSchema,
} from '../lib/schemas';

export function fetchUsers() {
  return api.get('/users').then((data) => z.array(userProfileSchema).parse(data));
}

export function toggleUserStatus(id: string, isActive: boolean) {
  return api
    .patch(`/users/${id}`, { is_active: isActive })
    .then((data) => userProfileSchema.parse(data));
}

export function fetchPreferences() {
  return api.get('/users/me/preferences').then((data) => userPreferencesSchema.parse(data));
}

export function updatePreferences(
  data: Partial<
    Pick<z.infer<typeof userPreferencesSchema>, 'theme' | 'currency' | 'refresh_interval'>
  >,
) {
  return api.patch('/users/me/preferences', data).then((data) => userPreferencesSchema.parse(data));
}

export function fetchFavorites() {
  return api.get('/users/me/favorites').then((data) => z.array(favoriteSchema).parse(data));
}

export function addFavorite(coinId: string, coinSymbol: string) {
  return api
    .post('/users/me/favorites', { coin_id: coinId, coin_symbol: coinSymbol })
    .then((data) => favoriteSchema.parse(data));
}

export function removeFavorite(coinId: string) {
  return api.delete(`/users/me/favorites/${coinId}`).then((data) => favoriteSchema.parse(data));
}

export function createAlert(
  coinId: string,
  coinSymbol: string,
  condition: 'above' | 'below',
  targetPrice: number,
) {
  return api
    .post('/users/me/alerts', {
      coin_id: coinId,
      coin_symbol: coinSymbol,
      condition,
      target_price: targetPrice,
    })
    .then((data) => priceAlertSchema.parse(data));
}
