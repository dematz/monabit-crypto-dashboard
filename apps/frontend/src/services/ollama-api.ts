import { api } from './api';
import { ollamaResponseSchema } from '../lib/schemas';

export function askOllama(question: string) {
  return api.post('/ollama/ask', { question }).then((data) => ollamaResponseSchema.parse(data));
}
