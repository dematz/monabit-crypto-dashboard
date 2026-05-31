import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getSupabaseAdmin } from '../../lib/supabase.js';

const roleSchema = z.enum(['admin', 'user']);

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const {
    data: { user },
    error,
  } = await getSupabaseAdmin().auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }

  const roleParse = roleSchema.safeParse(user.user_metadata.role);

  request.user = {
    id: user.id,
    email: user.email ?? '',
    role: roleParse.success ? roleParse.data : 'user',
  };
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (request.user.role !== 'admin') {
    return reply.status(403).send({ error: 'Forbidden: admin role required' });
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser;
  }
}
