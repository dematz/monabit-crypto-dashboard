import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { authModule } from './auth.routes.js';

vi.mock('./auth.service.js', () => ({
  getMe: vi.fn().mockResolvedValue({ display_name: 'Admin', role: 'admin' }),
}));

vi.mock('./auth.middleware.js', () => ({
  authenticate: async (_req: any, _reply: any) => {},
}));

const mockUser = { id: 'test-user', email: 'admin@monabit.io', role: 'admin' as const };

describe('authModule', () => {
  async function buildApp() {
    const app = Fastify({ logger: false });
    app.addHook('onRequest', async (req, reply) => {
      if (!req.headers.authorization) {
        return reply.status(401).send({ error: 'Missing or invalid authorization header' });
      }
      req.user = mockUser;
    });
    await app.register(authModule);
    return app;
  }

  it('GET /auth/me returns user and profile', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: 'Bearer valid-token' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('user');
    expect(body).toHaveProperty('profile');
    expect(body.user.email).toBe('admin@monabit.io');
  });

  it('GET /auth/me returns 401 without token', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/auth/me' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /auth/logout returns confirmation', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: { authorization: 'Bearer valid-token' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveProperty('message');
    expect(body.message).toContain('Session');
  });

  it('POST /auth/logout returns 401 without token', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'POST', url: '/auth/logout' });
    expect(res.statusCode).toBe(401);
  });
});
