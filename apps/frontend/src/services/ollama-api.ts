import { api } from './api';

interface OllamaResponse {
  question: string;
  answer: string;
}

export function askOllama(question: string): Promise<OllamaResponse> {
  return api.post('/ollama/ask', { question });
}
