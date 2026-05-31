import type { FastifyInstance } from 'fastify';
import { authenticate } from './auth.middleware.js';
import { getMe } from './auth.service.js';

export async function authModule(app: FastifyInstance) {
  app.get('/auth/me', { preHandler: [authenticate] }, async (request) => {
    const profile = await getMe(request.user.id);
    return {
      user: request.user,
      profile,
    };
  });

  app.post('/auth/logout', { preHandler: [authenticate] }, async () => {
    return { message: 'Session invalidated. Clear your client token.' };
  });
}
