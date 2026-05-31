import type { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/auth.middleware.js';
import { getSupabaseAdmin } from '../../lib/supabase.js';
import { subscribeBinance, getSubscribersCount, isBinanceConnected } from './binance-ws.js';

export async function wsModule(app: FastifyInstance) {
  app.get('/ws/prices', { websocket: true }, async (socket, req) => {
    const token = (req.query as Record<string, string>)['token'];

    if (!token) {
      socket.send(JSON.stringify({ error: 'Authentication required. Connect with ?token=<jwt>' }));
      socket.close();
      return;
    }

    const {
      data: { user },
      error,
    } = await getSupabaseAdmin().auth.getUser(token);

    if (error || !user) {
      socket.send(JSON.stringify({ error: 'Invalid or expired token' }));
      socket.close();
      return;
    }

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
