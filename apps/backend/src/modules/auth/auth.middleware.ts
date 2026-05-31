import type { FastifyRequest, FastifyReply } from 'fastify';
import { getSupabaseAdmin } from '../../lib/supabase.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }

  request.user = {
    id: user.id,
    email: user.email!,
    role: (user.user_metadata?.role as 'admin' | 'user') ?? 'user',
  };
}

export function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (request.user?.role !== 'admin') {
    reply.status(403).send({ error: 'Forbidden: admin role required' });
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser;
  }
}
