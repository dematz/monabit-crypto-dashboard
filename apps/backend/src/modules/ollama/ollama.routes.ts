import type { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/auth.middleware.js';
import { askGroq } from './groq.service.js';
import { z } from 'zod';

const askSchema = z.object({
  question: z.string().min(1).max(500),
});

export async function ollamaModule(app: FastifyInstance) {
  app.post(
    '/ollama/ask',
    {
      preHandler: [authenticate],
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    async (request) => {
      const { question } = askSchema.parse(request.body);
      const answer = await askGroq(question);
      return { question, answer };
    },
  );
}
