import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { logger } from '../logger/index.js';

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    logger.warn({ requestId: request.id, path: request.url }, 'Validation error');
    return reply.status(400).send({
      error: 'Validation error',
      details: error.flatten().fieldErrors,
    });
  }

  if (error instanceof HttpError) {
    logger.warn({ err: error, requestId: request.id }, 'HTTP error');
    return reply.status(error.statusCode).send({ error: error.message });
  }

  logger.error({ err: error, requestId: request.id }, 'Unhandled error');
  reply.status(500).send({ error: 'Internal server error' });
}
