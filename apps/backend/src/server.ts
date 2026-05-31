import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { logger } from './shared/logger/index.js';
import { config } from './config/index.js';
import { healthRoute } from './shared/health/index.js';
import { authModule } from './modules/auth/auth.routes.js';
import { usersModule } from './modules/users/users.routes.js';
import { cryptoModule } from './modules/crypto/crypto.routes.js';
import { ollamaModule } from './modules/ollama/ollama.routes.js';
import { errorHandler } from './shared/errors/index.js';
import { auditLog } from './shared/audit/index.js';

async function main() {
  const app = Fastify({
    logger: false,
  });

  app.setErrorHandler(errorHandler);

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: config.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim()),
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  app.addHook('onResponse', auditLog);

  await app.register(healthRoute);
  await app.register(authModule);
  await app.register(usersModule);
  await app.register(cryptoModule);
  await app.register(ollamaModule);

  const address = await app.listen({ port: config.PORT, host: '0.0.0.0' });
  logger.info({ address, mockCrypto: config.MOCK_CRYPTO }, 'Server started');
}

main().catch((err) => {
  logger.fatal(err, 'Failed to start server');
  process.exit(1);
});
