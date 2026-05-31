import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { logger } from '../logger/index.js';

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation error',
      details: error.flatten().fieldErrors,
    });
  }

  logger.error({ err: error, requestId: request.id }, 'Unhandled error');
  reply.status(500).send({ error: 'Internal server error' });
}
