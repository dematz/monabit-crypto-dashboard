import pino from 'pino';
import { config } from '../../config/index.js';

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: ['req.headers.authorization'],
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: { service: 'monabit-backend', version: config.APP_VERSION },
  ...(config.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  }),
});
