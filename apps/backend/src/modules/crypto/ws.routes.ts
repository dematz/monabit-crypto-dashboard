import type { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/auth.middleware.js';
import { subscribeBinance, getSubscribersCount, isBinanceConnected } from './binance-ws.js';

export async function wsModule(app: FastifyInstance) {
  app.get('/ws/prices', { websocket: true }, (socket) => {
    const unsub = subscribeBinance((data) => {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify(data));
      }
    });

    socket.on('close', () => {
      unsub();
    });

    socket.on('error', () => {
      unsub();
    });
  });

  app.get('/ws/status', { preHandler: [authenticate] }, async () => ({
    connected: isBinanceConnected(),
    subscribers: getSubscribersCount(),
  }));
}
