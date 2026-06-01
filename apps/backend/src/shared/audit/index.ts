import type { FastifyRequest, FastifyReply } from 'fastify';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { logger } from '../logger/index.js';

const AUDITABLE_METHODS: readonly string[] = ['POST', 'PATCH', 'DELETE'];

function shouldAudit(request: FastifyRequest): boolean {
  return AUDITABLE_METHODS.includes(request.method);
}

function getClientIp(request: FastifyRequest): string {
  const headers: Record<string, unknown> = request.headers as Record<string, unknown>;
  const forwarded = headers['x-forwarded-for'];
  const ip =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0]?.trim()
      : Array.isArray(forwarded)
        ? forwarded[0]?.toString().trim()
        : undefined;
  return ip ?? request.ip;
}

export async function auditLog(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (!shouldAudit(request)) return;

  const userId = (request as { user?: { id?: string } }).user?.id;
  if (!userId) return;
  const action = `${request.method} ${request.url}`;

  const entityId =
    typeof request.params === 'object' && request.params !== null && 'id' in request.params
      ? (request.params as { id: string }).id
      : (request as unknown as Record<string, unknown>).createdEntityId
        ? String((request as unknown as Record<string, unknown>).createdEntityId)
        : null;

  const metadata: Record<string, unknown> = {};
  if (request.body && typeof request.body === 'object') {
    const body = request.body as Record<string, unknown>;
    for (const key of Object.keys(body)) {
      if (key !== 'password') metadata[key] = body[key];
    }
  }

  try {
    await getSupabaseAdmin()
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        entity_type: request.url.split('/')[1] || 'unknown',
        entity_id: entityId,
        ip_address: getClientIp(request),
        user_agent:
          (request.headers as Record<string, string | string[] | undefined>)['user-agent'] ?? null,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
      });
  } catch (err) {
    logger.error({ err }, 'Audit log insert failed');
  }
}
