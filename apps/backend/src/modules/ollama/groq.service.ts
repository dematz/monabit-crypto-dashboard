import axios from 'axios';
import { config } from '../../config/index.js';
import { logger } from '../../shared/logger/index.js';
import { getTop10, getMarketOverview } from '../crypto/crypto.service.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqChoice {
  message: { content: string };
}

interface GroqResponse {
  choices: GroqChoice[];
}

const BASE_PROMPT =
  'You are MonaBit AI, a cryptocurrency market assistant embedded in a crypto dashboard. You provide concise, accurate analysis based on the live market data provided below. Keep responses under 3 sentences unless asked for detail. Use markdown formatting for clarity. Always include specific numbers from the data when discussing prices or percentages. If the user asks about a coin in the data, reference its actual price and change. If market data is unavailable, answer from general knowledge but note that live data is not available.';

async function buildMarketContext(): Promise<string> {
  try {
    const [top10Result, marketResult] = await Promise.allSettled([getTop10(), getMarketOverview()]);

    const parts: string[] = [];

    if (top10Result.status === 'fulfilled') {
      const assets = top10Result.value.data;
      const lines = assets
        .slice(0, 10)
        .map(
          (a) =>
            `- ${a.name} (${a.symbol.toUpperCase()}): $${a.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, 24h: ${a.price_change_percentage_24h >= 0 ? '+' : ''}${a.price_change_percentage_24h.toFixed(2)}%, market cap: $${(a.market_cap / 1e9).toFixed(1)}B`,
        );
      parts.push('Top 10 cryptocurrencies (live data):\n' + lines.join('\n'));
    }

    if (marketResult.status === 'fulfilled') {
      const m = marketResult.value.data;
      parts.push(
        `Global market: total market cap $${(m.total_market_cap.usd / 1e12).toFixed(2)}T, 24h volume $${(m.total_volume.usd / 1e9).toFixed(1)}B, BTC dominance ${m.market_cap_percentage.btc.toFixed(1)}%, ETH dominance ${m.market_cap_percentage.eth.toFixed(1)}%, 24h change ${m.market_cap_change_percentage_24h_usd >= 0 ? '+' : ''}${m.market_cap_change_percentage_24h_usd.toFixed(2)}%`,
      );
    }

    return parts.length > 0 ? parts.join('\n\n') : '';
  } catch {
    return '';
  }
}

export async function askGroq(question: string): Promise<string> {
  if (!config.GROQ_API_KEY) {
    return 'Groq API key not configured. Set GROQ_API_KEY in your environment to enable AI responses.';
  }

  const marketData = await buildMarketContext();
  const systemContent = marketData
    ? `${BASE_PROMPT}\n\nCurrent market data:\n${marketData}`
    : BASE_PROMPT;

  try {
    const { data } = await axios.post<GroqResponse>(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: question },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${config.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    const choice = data.choices[0];
    return choice
      ? choice.message.content.trim()
      : 'I could not generate a response. Please try again.';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        logger.warn({ err: error.message }, 'Groq API: invalid API key');
        return 'Invalid Groq API key. Please check your GROQ_API_KEY environment variable.';
      }
      if (error.response?.status === 429) {
        logger.warn({ err: error.message }, 'Groq API: rate limited');
        return 'Groq API rate limit exceeded. Please try again later.';
      }
    }
    logger.error({ err: error }, 'Groq API request failed');
    return 'An error occurred while contacting the AI service. Please try again.';
  }
}
