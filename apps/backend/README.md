# MonaBit Backend

Fastify 4 + TypeScript API server for the MonaBit crypto dashboard. Handles authentication, user management, crypto data aggregation, real-time WebSocket price relay, and AI-powered market analysis.

See the [root README](../../README.md) for project-wide documentation.

---

## Tech Stack

| Library               | Version | Purpose                                      |
| --------------------- | ------- | -------------------------------------------- |
| Node.js               | 20 LTS  | Runtime                                      |
| Fastify               | 4.x     | HTTP framework                               |
| TypeScript            | 5.4+    | Type safety                                  |
| Zod                   | 3.x     | Request/response validation (shared schemas) |
| Pino                  | 9.x     | Structured JSON logging                      |
| @supabase/supabase-js | 2.x     | Database + Auth (service role)               |
| axios                 | 1.x     | CoinGecko HTTP client                        |
| ws                    | 8.x     | Binance WebSocket client                     |
| node-cache            | 5.x     | In-memory TTL cache                          |
| @fastify/cors         | 9.x     | CORS middleware                              |
| @fastify/helmet       | 11.x    | Security headers                             |
| @fastify/rate-limit   | 9.x     | Per-route rate limiting                      |
| @fastify/websocket    | 10.x    | WebSocket server (Fastify 4 compatibility)   |
| vitest                | 1.x     | Unit and integration testing                 |

---

## Project Structure

```
apps/backend/
├── src/
│   ├── server.ts                    # Fastify bootstrap, plugins, modules, shutdown
│   ├── config/
│   │   ├── env.ts                   # Zod-validated environment variables
│   │   └── index.ts                 # Config exports
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts       # GET /auth/me, POST /auth/logout
│   │   │   ├── auth.middleware.ts   # JWT Bearer validation + requireAdmin
│   │   │   ├── auth.service.ts      # Supabase auth integration
│   │   │   └── auth.routes.test.ts  # Auth endpoint tests
│   │   ├── users/
│   │   │   ├── users.routes.ts      # CRUD routes for users, preferences, favorites, alerts
│   │   │   ├── users.repository.ts  # Supabase query functions
│   │   │   ├── users.schema.ts      # Zod request/response schemas
│   │   │   ├── users.schema.test.ts # Schema validation tests
│   │   │   ├── preferences.repository.ts
│   │   │   ├── preferences.schema.ts
│   │   │   ├── preferences.schema.test.ts
│   │   │   ├── favorites.repository.ts
│   │   │   ├── alerts.repository.ts
│   │   │   ├── alerts-favorites.schema.ts
│   │   │   └── alerts-favorites.schema.test.ts
│   │   ├── crypto/
│   │   │   ├── crypto.routes.ts     # GET /crypto/top10, /market-overview, /history/:coinId
│   │   │   ├── crypto.service.ts    # CoinGecko data fetching + cache layer
│   │   │   ├── crypto.cache.ts      # node-cache instance with per-endpoint TTL
│   │   │   ├── coingecko-client.ts   # Resilient CoinGecko client (retry + circuit breaker)
│   │   │   ├── coingecko.mock.ts     # Mock data for development (MOCK_CRYPTO=true)
│   │   │   ├── coingecko.mock.test.ts# Mock data validation tests
│   │   │   ├── binance-ws.ts        # Binance WebSocket client with auto-reconnect
│   │   │   ├── crypto.routes.test.ts # Crypto endpoint tests
│   │   │   ├── crypto.service.test.ts# Service logic tests
│   │   │   └── ws.routes.ts          # GET /ws/prices (WebSocket relay), GET /ws/status
│   │   └── groq/
│   │       ├── groq.routes.ts        # POST /ai/ask (rate-limited)
│   │       └── groq.service.ts       # Groq API proxy with market context injection
│   ├── shared/
│   │   ├── audit/
│   │   │   └── index.ts             # Fire-and-forget audit logging middleware
│   │   ├── errors/
│   │   │   └── index.ts             # HttpError class + global error handler
│   │   ├── health/
│   │   │   └── index.ts             # GET /health (database + CoinGecko + Binance WS)
│   │   ├── logger/
│   │   │   └── index.ts             # Pino logger with redaction config
│   │   └── middleware/
│   │       └── index.ts             # Shared middleware exports
│   └── lib/
│       └── supabase.ts              # Supabase admin client (service role)
├── Dockerfile                        # Multi-stage: build → run on Node 20-alpine
├── vitest.config.ts                  # Test configuration
├── tsconfig.json
├── eslint.config.js
└── package.json
```

---

## API Endpoints

### Authentication

| Method | Path           | Auth   | Description                             |
| ------ | -------------- | ------ | --------------------------------------- |
| `GET`  | `/auth/me`     | Bearer | Get current user + profile              |
| `POST` | `/auth/logout` | Bearer | Invalidate session (rate-limited 10/hr) |

### Users

| Method   | Path                                   | Auth         | Description        |
| -------- | -------------------------------------- | ------------ | ------------------ |
| `GET`    | `/users`                               | Bearer+Admin | List all users     |
| `POST`   | `/users`                               | Bearer+Admin | Create user        |
| `GET`    | `/users/me`                            | Bearer       | Get own profile    |
| `PATCH`  | `/users/me`                            | Bearer       | Update own profile |
| `GET`    | `/users/me/preferences`                | Bearer       | Get preferences    |
| `PATCH`  | `/users/me/preferences`                | Bearer       | Upsert preferences |
| `GET`    | `/users/me/favorites`                  | Bearer       | List favorites     |
| `POST`   | `/users/me/favorites`                  | Bearer       | Add favorite       |
| `DELETE` | `/users/me/favorites/:coinId`          | Bearer       | Remove favorite    |
| `GET`    | `/users/me/alerts`                     | Bearer       | List price alerts  |
| `POST`   | `/users/me/alerts`                     | Bearer       | Create alert       |
| `PATCH`  | `/users/me/alerts/:alertId/deactivate` | Bearer       | Deactivate alert   |
| `DELETE` | `/users/me/alerts/:alertId`            | Bearer       | Delete alert       |
| `GET`    | `/users/:id`                           | Bearer+Admin | Get user by ID     |
| `PATCH`  | `/users/:id`                           | Bearer+Admin | Update user        |
| `DELETE` | `/users/:id`                           | Bearer+Admin | Deactivate user    |

### Crypto

| Method | Path                              | Auth   | Description                          |
| ------ | --------------------------------- | ------ | ------------------------------------ | ------ | --------------------------- |
| `GET`  | `/crypto/top10`                   | Bearer | Top 10 cryptocurrencies (cached 60s) |
| `GET`  | `/crypto/market-overview`         | Bearer | Global market KPIs (cached 120s)     |
| `GET`  | `/crypto/history/:coinId?range=1D | 7D     | 1M`                                  | Bearer | Price history (cached 300s) |

### AI

| Method | Path      | Auth   | Description                          |
| ------ | --------- | ------ | ------------------------------------ |
| `POST` | `/ai/ask` | Bearer | Ask AI about market (10 req/hr/user) |

Request body: `{ "question": "string" }`

The backend injects current market context (top 10 prices) into the prompt before forwarding to Groq. When `GROQ_API_KEY` is empty, returns a graceful fallback message.

### WebSocket

| Path                    | Auth   | Description                  |
| ----------------------- | ------ | ---------------------------- |
| `GET /ws/prices?token=` | Bearer | Real-time Binance price feed |
| `GET /ws/status`        | Bearer | Binance WS connection status |

WebSocket messages are JSON: `{ "s": "BTCUSDT", "c": "73000.00", "P": "2.5", "t": 1234567890 }`

### Health

| Method | Path      | Auth | Description                                   |
| ------ | --------- | ---- | --------------------------------------------- |
| `GET`  | `/health` | No   | Service health (database, CoinGecko, Binance) |

---

## Authentication Flow

1. Frontend authenticates with Supabase Auth (email/password or Google OAuth)
2. Supabase returns a JWT token
3. Frontend sends `Authorization: Bearer <token>` on every API request
4. Backend validates the token via `supabaseAdmin.auth.getUser(token)`
5. Middleware extracts `user.id`, `user.email`, and `profile.role`
6. Admin-only routes additionally check `profile.role === 'admin'`
7. Inactive users (`is_active === false`) receive `403 Forbidden`

---

## Crypto Data Pipeline

### CoinGecko (REST, Cached)

```
Client request → Check node-cache (TTL-based)
  → Cache hit: return data + timestamp
  → Cache miss: fetch from CoinGecko API
    → Success: cache result, return to client
    → 429 Rate Limited: retry once (2s delay)
    → Failure: if circuit breaker open (3 consecutive failures)
      → Serve stale cache (up to 5 min) if available
      → Otherwise return error
```

| Data            | TTL  | Endpoint                   |
| --------------- | ---- | -------------------------- |
| Top 10 coins    | 60s  | `/coins/markets`           |
| Market overview | 120s | `/global`                  |
| Coin history    | 300s | `/coins/{id}/market_chart` |

On startup, `warmupCache()` pre-fetches top 10 and market overview to avoid cold-startCoinGecko spikes.

### Binance WebSocket (Real-time)

- Connects to `wss://stream.binance.com:9443/ws` for the top 10 ticker streams
- Backend relays prices to connected frontend clients via `/ws/prices`
- Auto-reconnects on disconnect with exponential backoff
- Cloud Run terminates connections after 60 min; backend reconnects automatically

---

## Environment Variables

| Variable                    | Required | Default                            | Description                             |
| --------------------------- | -------- | ---------------------------------- | --------------------------------------- |
| `NODE_ENV`                  | Yes      | `development`                      | Environment                             |
| `PORT`                      | Yes      | `4000`                             | Server port                             |
| `SUPABASE_URL`              | Yes      | —                                  | Supabase project URL                    |
| `SUPABASE_ANON_KEY`         | Yes      | —                                  | Supabase anonymous key                  |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes      | —                                  | Supabase admin key                      |
| `ALLOWED_ORIGINS`           | Yes      | `http://localhost:3000`            | CORS origins (comma-separated)          |
| `MOCK_CRYPTO`               | No       | `true`                             | Use mock data instead of CoinGecko      |
| `COINGECKO_API_URL`         | No       | `https://api.coingecko.com/api/v3` | CoinGecko base URL                      |
| `COINGECKO_API_KEY`         | No       | —                                  | CoinGecko Pro API key (optional)        |
| `BINANCE_WS_URL`            | No       | `wss://stream.binance.com:9443`    | Binance WebSocket URL                   |
| `GROQ_API_KEY`              | No       | —                                  | Groq API key for AI assistant           |
| `GROQ_MODEL`                | No       | `llama-3.3-70b-versatile`          | Groq model name                         |
| `GROQ_TIMEOUT`              | No       | `30000`                            | Groq request timeout (ms)               |
| `CACHE_TTL_TOP10`           | No       | `60`                               | Cache TTL for top 10 (seconds)          |
| `CACHE_TTL_MARKET_OVERVIEW` | No       | `120`                              | Cache TTL for market overview (seconds) |
| `CACHE_TTL_COIN_HISTORY`    | No       | `300`                              | Cache TTL for coin history (seconds)    |
| `LOG_LEVEL`                 | No       | `info`                             | Pino log level                          |
| `APP_VERSION`               | No       | `0.1.0`                            | Version reported by /health             |

All variables are validated with Zod at startup. Invalid values cause the server to exit with a clear error message.

---

## Validation

All endpoints use Zod schemas for request validation:

- Request bodies validated with `.parse()` — returns 400 on invalid input
- Response types inferred from Zod schemas (shared with frontend via `@monabit/shared-types`)
- `HttpError` class with `statusCode` for controlled error responses
- Global error handler differentiates `ZodError` (400), `HttpError` (custom status), and unexpected errors (500)

---

## Testing

44 unit tests covering:

- `users.schema.test.ts` — User CRUD request/response validation
- `preferences.schema.test.ts` — Preferences validation
- `alerts-favorites.schema.test.ts` — Alerts and favorites validation
- `auth.routes.test.ts` — Auth endpoint behavior
- `crypto.routes.test.ts` — Crypto endpoint routing
- `crypto.service.test.ts` — Cache behavior, mock data validation
- `coingecko.mock.test.ts` — Mock data structure correctness

```bash
pnpm --filter @monabit/backend test
pnpm --filter @monabit/backend test:watch
```

---

## Security

| Layer            | Implementation                                        |
| ---------------- | ----------------------------------------------------- |
| Authentication   | JWT Bearer via Supabase Auth                          |
| Authorization    | Role-based (`admin` / `user`) via middleware          |
| Inactive users   | 403 Forbidden on deactivated accounts                 |
| CORS             | Whitelisted origins via `ALLOWED_ORIGINS`             |
| Rate limiting    | 100 req/min global, 10 req/min auth, 10 req/hr AI     |
| Helmet           | HSTS, CSP, X-Frame-Options, X-Content-Type-Options    |
| Input validation | Zod `.parse()` on all request bodies/params           |
| SQL injection    | Supabase parameterized queries (no raw SQL)           |
| Audit logging    | Fire-and-forget middleware logs all POST/PATCH/DELETE |
| Pino redaction   | Sensitive fields (password, token) redacted from logs |

---

## Deployment

### Docker (Multi-stage)

```dockerfile
# Stage 1: Build with pnpm monorepo
# Stage 2: Run with node:20-alpine
```

- Exposes port 8080 (Cloud Run default)
- Health check at `/health`
- `min:1, max:3` instances (Binance WS requires persistent connection)
- 512Mi memory allocation

### Cloud Run Secrets

Production secrets are injected via GCP Secret Manager:

```
SUPABASE_URL=supabase-url:latest
SUPABASE_ANON_KEY=supabase-anon-key:latest
SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest
ALLOWED_ORIGINS=allowed-origins:latest
COINGECKO_API_KEY=coingecko-api-key:latest
GROQ_API_KEY=groq-api-key:latest
```

---

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start dev server (port 4000)
pnpm --filter @monabit/backend dev

# Type check
pnpm --filter @monabit/backend typecheck

# Lint
pnpm --filter @monabit/backend lint

# Build
pnpm --filter @monabit/backend build

# Run all tests
pnpm --filter @monabit/backend test
```
