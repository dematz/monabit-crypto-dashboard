import type { FastifyRequest, FastifyReply } from 'fastify';
import { getSupabaseAdmin } from '../../lib/supabase.js';

const AUDITABLE_METHODS: readonly string[] = ['POST', 'PATCH', 'DELETE'];

function shouldAudit(request: FastifyRequest): boolean {
  return AUDITABLE_METHODS.includes(request.method);
}

export async function auditLog(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (!shouldAudit(request)) return;

  const userId = request.user.id;
  const action = `${request.method} ${request.url}`;

  void getSupabaseAdmin()
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      entity_type: request.url.split('/')[1] || 'unknown',
      entity_id: (request.params as Record<string, string>).id ?? null,
      ip_address: request.ip,
      user_agent: request.headers['user-agent'] ?? null,
    });
}
