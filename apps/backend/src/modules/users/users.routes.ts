import type { FastifyInstance } from 'fastify';
import { authenticate, requireAdmin } from '../auth/auth.middleware.js';
import { listUsers, getUserById, updateUser, deactivateUser } from './users.repository.js';
import { updateUserSchema, createUserSchema } from './users.schema.js';
import type { CreateUserInput } from './users.schema.js';

export async function usersModule(app: FastifyInstance) {
  app.get('/users', { preHandler: [authenticate, requireAdmin] }, async () => {
    return listUsers();
  });

  app.post('/users', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const input = createUserSchema.parse(request.body);
    return { message: 'User created (pending Supabase Auth)', input };
  });

  app.get('/users/me', { preHandler: [authenticate] }, async (request) => {
    const user = await getUserById(request.user.id);
    if (!user) return { error: 'Profile not found' };
    return user;
  });

  app.patch('/users/me', { preHandler: [authenticate] }, async (request) => {
    const input = updateUserSchema.parse(request.body);
    const user = await updateUser(request.user.id, input);
    return user;
  });

  app.get('/users/:id', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const { id } = request.params as { id: string };
    const user = await getUserById(id);
    if (!user) return { error: 'User not found' };
    return user;
  });

  app.patch('/users/:id', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const { id } = request.params as { id: string };
    const input = updateUserSchema.parse(request.body);
    return updateUser(id, input);
  });

  app.delete('/users/:id', { preHandler: [authenticate, requireAdmin] }, async (request) => {
    const { id } = request.params as { id: string };
    return deactivateUser(id);
  });
}
