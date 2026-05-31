import { api } from './api';
import { groqResponseSchema } from '../lib/schemas';

export function askGroq(question: string) {
  return api.post('/ai/ask', { question }).then((data) => groqResponseSchema.parse(data));
}
