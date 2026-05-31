import type { FastifyRequest, FastifyReply } from 'fastify';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { logger } from '../logger/index.js';

const AUDITABLE_METHODS: readonly string[] = ['POST', 'PATCH', 'DELETE'];

function shouldAudit(request: FastifyRequest): boolean {
  return AUDITABLE_METHODS.includes(request.method);
}

export async function auditLog(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (!shouldAudit(request)) return;

  const userId = (request as { user?: { id?: string } }).user?.id;
  if (!userId) return;
  const action = `${request.method} ${request.url}`;

  try {
    await getSupabaseAdmin()
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        entity_type: request.url.split('/')[1] || 'unknown',
        entity_id:
          typeof request.params === 'object' && request.params !== null && 'id' in request.params
            ? (request.params as { id: string }).id
            : null,
        ip_address: request.ip,
        user_agent: request.headers['user-agent'] ?? null,
      });
  } catch (err) {
    logger.error({ err }, 'Audit log insert failed');
  }
}
