import type { FastifyInstance } from 'fastify';
import { authenticate } from './auth.middleware.js';
import { getMe } from './auth.service.js';

export async function authModule(app: FastifyInstance) {
  app.get(
    '/auth/me',
    {
      preHandler: [authenticate],
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    },
    async (request) => {
      const profile = await getMe(request.user.id);
      return {
        user: request.user,
        profile,
      };
    },
  );

  app.post(
    '/auth/logout',
    {
      preHandler: [authenticate],
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    async () => {
      return { message: 'Session invalidated. Clear your client token.' };
    },
  );
}
