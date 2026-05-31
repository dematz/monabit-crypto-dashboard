import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { logger } from './shared/logger/index.js';
import { config } from './config/index.js';
import { healthRoute } from './shared/health/index.js';
import { authModule } from './modules/auth/auth.routes.js';
import { usersModule } from './modules/users/users.routes.js';
import { cryptoModule } from './modules/crypto/crypto.routes.js';
import { groqModule } from './modules/groq/groq.routes.js';
import { wsModule } from './modules/crypto/ws.routes.js';
import { errorHandler } from './shared/errors/index.js';
import { auditLog } from './shared/audit/index.js';
import { shutdownBinance } from './modules/crypto/binance-ws.js';
import { getTop10, getMarketOverview } from './modules/crypto/crypto.service.js';

async function warmupCache() {
  if (config.MOCK_CRYPTO) {
    logger.info('Cache warmup: skipping (MOCK_CRYPTO=true)');
    return;
  }
  try {
    logger.info('Cache warmup: fetching top10 + market-overview from CoinGecko...');
    await Promise.allSettled([getTop10(), getMarketOverview()]);
    logger.info('Cache warmup: complete');
  } catch {
    logger.warn('Cache warmup: partial failure (will retry on first request)');
  }
}

async function main() {
  const app = Fastify({
    logger: false,
  });

  app.setErrorHandler(errorHandler);

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          'data:',
          'https://assets.coingecko.com',
          'https://coin-images.coingecko.com',
        ],
        connectSrc: [
          "'self'",
          'wss://stream.binance.com:9443',
          config.SUPABASE_URL,
          'https://api.coingecko.com',
        ],
        fontSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  });

  await app.register(cors, {
    origin: config.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim()),
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  app.setNotFoundHandler((_, reply) => {
    reply.status(404).send({ error: 'Not found' });
  });

  await app.register(websocket);

  app.addHook('onResponse', auditLog);

  await app.register(healthRoute);
  await app.register(authModule);
  await app.register(usersModule);
  await app.register(cryptoModule);
  await app.register(groqModule);
  await app.register(wsModule);

  const address = await app.listen({ port: config.PORT, host: '0.0.0.0' });
  logger.info({ address, mockCrypto: config.MOCK_CRYPTO }, 'Server started');

  warmupCache();

  const shutdown = async () => {
    logger.info('Shutting down...');
    shutdownBinance();
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled rejection');
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    process.exit(1);
  });
}

main().catch((err) => {
  logger.fatal(err, 'Failed to start server');
  process.exit(1);
});
