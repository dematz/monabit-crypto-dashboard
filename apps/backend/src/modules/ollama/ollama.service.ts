import axios from 'axios';
import { config } from '../../config/index.js';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaResponse {
  model: string;
  message: { role: string; content: string };
  done: boolean;
}

const SYSTEM_PROMPT = `You are MonaBit AI, a cryptocurrency market assistant. You provide concise, accurate analysis of crypto markets.
Keep responses under 3 sentences unless asked for detail. Use markdown formatting for clarity.
Always include specific numbers when discussing prices or percentages.`;

export async function askOllama(question: string): Promise<string> {
  try {
    const messages: OllamaMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: question },
    ];

    const { data } = await axios.post<OllamaResponse>(
      `${config.OLLAMA_HOST}/api/chat`,
      {
        model: config.OLLAMA_MODEL,
        messages,
        stream: false,
      },
      { timeout: 30000 },
    );

    return data.message?.content?.trim() || 'I could not generate a response. Please try again.';
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      return 'Ollama is not running. Please start Ollama locally to enable AI responses.';
    }
    if (axios.isAxiosError(error) && error.code === 'ETIMEDOUT') {
      return 'The AI request timed out. Please try again.';
    }
    return 'An error occurred while contacting the AI service. Please try again.';
  }
}
