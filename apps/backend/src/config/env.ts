import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  APP_VERSION: z.string().default('0.0.0'),
  LOG_LEVEL: z.string().default('info'),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  COINGECKO_API_URL: z.string().default('https://api.coingecko.com/api/v3'),
  COINGECKO_API_KEY: z.string().default(''),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  MOCK_CRYPTO: z.coerce.boolean().default(true),
  CACHE_TTL_TOP10: z.coerce.number().default(60),
  CACHE_TTL_MARKET_OVERVIEW: z.coerce.number().default(120),
  CACHE_TTL_COIN_HISTORY: z.coerce.number().default(300),
  OLLAMA_HOST: z.string().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('llama3.2'),
  BINANCE_WS_URL: z.string().default('wss://stream.binance.com:9443'),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  process.stderr.write(
    `Invalid environment variables: ${JSON.stringify(result.error.flatten().fieldErrors)}\n`,
  );
  process.exit(1);
}

export const config = result.data;
