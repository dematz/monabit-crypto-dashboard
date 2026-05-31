import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, requireAdmin } from '../auth/auth.middleware.js';
import { listUsers, getUserById, updateUser, deactivateUser } from './users.repository.js';
import { getPreferences, upsertPreferences } from './preferences.repository.js';
import { listFavorites, addFavorite, removeFavorite } from './favorites.repository.js';
import { listAlerts, createAlert, deactivateAlert, deleteAlert } from './alerts.repository.js';
import { updateUserSchema } from './users.schema.js';
import { updatePreferencesSchema } from './preferences.schema.js';
import { addFavoriteSchema, createAlertSchema } from './alerts-favorites.schema.js';
import { HttpError } from '../../shared/errors/index.js';

const coinIdParamsSchema = z.object({ coinId: z.string().min(1) });
const alertIdParamsSchema = z.object({ alertId: z.string().min(1) });
const userIdParamsSchema = z.object({ id: z.string().min(1) });

export async function usersModule(app: FastifyInstance) {
  app.get('/users', { preHandler: [authenticate, requireAdmin] }, async () => {
    return listUsers();
  });

  app.get('/users/me', { preHandler: [authenticate] }, async (request) => {
    const user = await getUserById(request.user.id);
    if (!user) throw new HttpError(404, 'Profile not found');
    return user;
  });

  app.patch('/users/me', { preHandler: [authenticate] }, async (request) => {
    const input = updateUserSchema.parse(request.body);
    const user = await updateUser(request.user.id, input);
    return user;
  });

  app.get('/users/me/preferences', { preHandler: [authenticate] }, async (request) => {
    const prefs = await getPreferences(request.user.id);
    return prefs ?? { theme: 'dark', currency: 'USD', refresh_interval: 30 };
  });

  app.patch('/users/me/preferences', { preHandler: [authenticate] }, async (request) => {
    const input = updatePreferencesSchema.parse(request.body);
    const prefs = await upsertPreferences(request.user.id, input);
    return prefs;
  });

  app.get('/users/me/favorites', { preHandler: [authenticate] }, async (request) => {
    return listFavorites(request.user.id);
  });

  app.post('/users/me/favorites', { preHandler: [authenticate] }, async (request) => {
    const input = addFavoriteSchema.parse(request.body);
    const fav = await addFavorite(request.user.id, input.coin_id, input.coin_symbol);
    return fav;
  });

  app.delete('/users/me/favorites/:coinId', { preHandler: [authenticate] }, async (request) => {
    const { coinId } = coinIdParamsSchema.parse(request.params);
    const fav = await removeFavorite(request.user.id, coinId);
    return fav;
  });

  app.get('/users/me/alerts', { preHandler: [authenticate] }, async (request) => {
    return listAlerts(request.user.id);
  });

  app.post('/users/me/alerts', { preHandler: [authenticate] }, async (request) => {
    const input = createAlertSchema.parse(request.body);
    const alert = await createAlert(request.user.id, input);
    return alert;
  });

  app.patch(
    '/users/me/alerts/:alertId/deactivate',
    { preHandler: [authenticate] },
    async (request) => {
      const { alertId } = alertIdParamsSchema.parse(request.params);
      const alert = await deactivateAlert(request.user.id, alertId);
      return alert;
    },
  );

  app.delete('/users/me/alerts/:alertId', { preHandler: [authenticate] }, async (request) => {
    const { alertId } = alertIdParamsSchema.parse(request.params);
    const alert = await deleteAlert(request.user.id, alertId);
    return alert;
  });

  app.get('/users/:id', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const { id } = userIdParamsSchema.parse(request.params);
    const user = await getUserById(id);
    if (!user) throw new HttpError(404, 'User not found');
    return user;
  });

  app.patch('/users/:id', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const { id } = userIdParamsSchema.parse(request.params);
    const input = updateUserSchema.parse(request.body);
    return updateUser(id, input);
  });

  app.delete('/users/:id', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const { id } = userIdParamsSchema.parse(request.params);
    const user = await deactivateUser(id);
    return user;
  });
}
