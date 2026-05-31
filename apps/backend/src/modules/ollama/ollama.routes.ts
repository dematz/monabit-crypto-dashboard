import type { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/auth.middleware.js';
import { askOllama } from './ollama.service.js';
import { z } from 'zod';

const askSchema = z.object({
  question: z.string().min(1).max(500),
});

export async function ollamaModule(app: FastifyInstance) {
  app.post('/ollama/ask', { preHandler: [authenticate] }, async (request) => {
    const { question } = askSchema.parse(request.body);
    const answer = await askOllama(question);
    return { question, answer };
  });
}
