# MonaBit — Crypto Dashboard

Fullstack web application for consulting, visualizing, and managing cryptocurrency market information. Built with React, Node.js, Supabase (PostgreSQL), and deployed on Google Cloud Run.

**Live URLs:**

- Frontend: `https://monabit-frontend-290867308628.us-central1.run.app`
- Backend: `https://monabit-backend-290867308628.us-central1.run.app`
- Health: `https://monabit-backend-290867308628.us-central1.run.app/health`

---

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (for containerized development)
- Supabase CLI (for local database)

### Install

```bash
pnpm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable                    | Description                            | Example                                       |
| --------------------------- | -------------------------------------- | --------------------------------------------- |
| `SUPABASE_URL`              | Supabase project URL                   | `https://your-project.supabase.co`            |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key                 | `eyJ...`                                      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin)      | `eyJ...`                                      |
| `COINGECKO_API_KEY`         | CoinGecko Pro API key (optional)       | `CG-...`                                      |
| `GROQ_API_KEY`              | Groq API key for AI assistant          | `gsk_...`                                     |
| `ALLOWED_ORIGINS`           | CORS allowed origins (comma-separated) | `http://localhost:3000,http://localhost:3100` |

### Run Locally

```bash
# Start backend (port 4000)
pnpm --filter @monabit/backend dev

# Start frontend (port 3000)
pnpm --filter @monabit/frontend dev
```

### Run Tests

```bash
pnpm test          # All workspaces
pnpm --filter @monabit/backend test   # Backend only (44 tests)
pnpm --filter @monabit/frontend test  # Frontend only (55 tests)
```

### Seed Admin User

After first deployment, create the admin user:

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
tsx packages/db/seed/seed-admin.ts --email=admin@monabit.io
```

---

## Architecture

```
monabit-crypto-dashboard/
├── apps/
│   ├── frontend/          React 18 + Vite 5 + TypeScript
│   │   ├── src/
│   │   │   ├── pages/       Login, Dashboard, Users, Settings
│   │   │   ├── components/  UI components, features, layout
│   │   │   ├── services/     API clients (auth, crypto, users)
│   │   │   ├── hooks/        Custom React hooks
│   │   │   ├── stores/       Zustand stores
│   │   │   └── lib/          Utilities, Zod schemas, formatters
│   │   └── nginx.conf        SPA + static assets config for Cloud Run
│   └── backend/           Fastify 4 + TypeScript
│       └── src/
│           ├── modules/       auth, users, crypto, groq
│           ├── shared/        errors, health, logger, audit
│           └── config/        Zod-validated env
├── packages/
│   ├── db/                 Database seed scripts
│   ├── shared-types/        Shared TypeScript interfaces
│   └── shared-utils/        Shared utility functions
├── supabase/
│   ├── migrations/           SQL migrations (RLS policies, triggers)
│   └── config.toml           Supabase project config
├── infra/
│   ├── cloudbuild/           Cloud Build configs
│   └── docker/               Docker Compose for local dev
├── scripts/
│   └── deploy.sh             GCP deployment script
└── .github/workflows/        CI/CD (lint, typecheck, test, security)
```

**Two Cloud Run services:**

- **Frontend**: Nginx serving React SPA (port 8080)
- **Backend**: Fastify API server (port 8080)

---

## Crypto Data Provider

**CoinGecko** (free tier) is the primary data source, supplemented by **Binance WebSocket** for real-time price updates.

Why CoinGecko:

- Free tier: 30 req/min, 10,000 calls/month
- Comprehensive coin data (price, market cap, volume, 24h change, sparkline)
- No API key required for basic tier
- Built-in caching layer (node-cache with TTL per endpoint):
  - Top 10: 60s TTL
  - Market overview: 120s TTL
  - Coin history: 300s TTL
- Circuit breaker + 429 retry with stale-while-revalidate fallback
- Optional CoinGecko Pro key for higher rate limits

Binance WebSocket (`wss://stream.binance.com:9443/ws`) provides real-time price ticks for the top 10 pairs, displayed in the dashboard table.

---

## Data Model

### Supabase PostgreSQL Tables

```
auth.users (Supabase managed)
  └── user_profiles (1:1)
        id           UUID PK FK → auth.users.id
        display_name TEXT
        email        TEXT
        avatar_url   TEXT
        role          TEXT DEFAULT 'user'  -- 'admin' | 'user'
        is_active     BOOLEAN DEFAULT true
        created_at    TIMESTAMPTZ
        updated_at    TIMESTAMPTZ

  └── user_preferences (1:1)
        id               UUID PK DEFAULT gen_random_uuid()
        user_id          UUID FK → user_profiles.id UNIQUE
        theme            TEXT DEFAULT 'dark'
        currency         TEXT DEFAULT 'USD'
        refresh_interval INTEGER DEFAULT 30
        created_at       TIMESTAMPTZ
        updated_at        TIMESTAMPTZ

  └── user_favorites (1:N)
        id          UUID PK DEFAULT gen_random_uuid()
        user_id     UUID FK → user_profiles.id
        coin_id     TEXT
        coin_symbol TEXT
        added_at    TIMESTAMPTZ

  └── price_alerts (1:N)
        id            UUID PK DEFAULT gen_random_uuid()
        user_id       UUID FK → user_profiles.id
        coin_id       TEXT
        coin_symbol   TEXT
        condition     TEXT  -- 'above' | 'below'
        target_price  NUMERIC
        is_active     BOOLEAN DEFAULT true
        triggered_at  TIMESTAMPTZ
        created_at    TIMESTAMPTZ

audit_logs
        id           UUID PK
        user_id      UUID FK → auth.users.id (nullable)
        action       TEXT
        entity_type  TEXT
        entity_id    UUID
        metadata     JSONB
        ip_address   INET
        user_agent   TEXT
        created_at   TIMESTAMPTZ
```

**RLS policies:** Users can read/update their own profiles and preferences; admins can read all profiles. Service role has full access for backend operations.

**Triggers:** `handle_new_user()` auto-creates `user_profiles` and `user_preferences` rows when a new user signs up via Supabase Auth, including the email from auth metadata.

---

## Authentication & Security

### Authentication

- **Supabase Auth** handles user registration, login, email verification, and session management
- **Email/password** login with confirmation email
- **Google OAuth** (Supabase `signInWithOAuth`) with redirect-based flow
- **JWT tokens** validated on every backend request via `auth.middleware.ts`
- **Role-based access**: `admin` and `user` roles, stored in `user_profiles.role`
- **Inactive user blocking**: middleware returns 403 for deactivated users

### Security Measures

- **CORS**: Whitelisted origins via `ALLOWED_ORIGINS` env var
- **Rate limiting**: Global 100 req/min, auth routes 10 req/min, AI route 10 req/min (per-route via `@fastify/rate-limit`)
- **Helmet**: Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Input validation**: Zod schemas on all backend endpoints
- **RLS**: Row Level Security on all Supabase tables
- **Secrets**: GCP Secret Manager for production; `.env` files gitignored
- **No hardcoded secrets**: All keys passed via environment variables; `.env.example` documents required vars with placeholder values

---

## API Endpoints

### Auth

| Method | Path           | Auth | Description                       |
| ------ | -------------- | ---- | --------------------------------- |
| `GET`  | `/auth/me`     | Yes  | Get current user + profile        |
| `POST` | `/auth/logout` | Yes  | Invalidate session (rate-limited) |

### Users

| Method   | Path                                   | Auth  | Description        |
| -------- | -------------------------------------- | ----- | ------------------ |
| `GET`    | `/users`                               | Admin | List all users     |
| `POST`   | `/users`                               | Admin | Create user        |
| `GET`    | `/users/me`                            | Yes   | Get own profile    |
| `PATCH`  | `/users/me`                            | Yes   | Update own profile |
| `GET`    | `/users/me/preferences`                | Yes   | Get preferences    |
| `PATCH`  | `/users/me/preferences`                | Yes   | Upsert preferences |
| `GET`    | `/users/me/favorites`                  | Yes   | List favorites     |
| `POST`   | `/users/me/favorites`                  | Yes   | Add favorite       |
| `DELETE` | `/users/me/favorites/:coinId`          | Yes   | Remove favorite    |
| `GET`    | `/users/me/alerts`                     | Yes   | List alerts        |
| `POST`   | `/users/me/alerts`                     | Yes   | Create alert       |
| `PATCH`  | `/users/me/alerts/:alertId/deactivate` | Yes   | Deactivate alert   |
| `DELETE` | `/users/me/alerts/:alertId`            | Yes   | Delete alert       |
| `GET`    | `/users/:id`                           | Admin | Get user by ID     |
| `PATCH`  | `/users/:id`                           | Admin | Update user        |
| `DELETE` | `/users/:id`                           | Admin | Deactivate user    |

### Crypto

| Method | Path                                       | Auth | Description                      |
| ------ | ------------------------------------------ | ---- | -------------------------------- |
| `GET`  | `/crypto/top10`                            | Yes  | Top 10 cryptocurrencies (cached) |
| `GET`  | `/crypto/market-overview`                  | Yes  | Global market KPIs (cached)      |
| `GET`  | `/crypto/history/:coinId?range=1D\|7D\|1M` | Yes  | Price history for a coin         |

### AI

| Method | Path      | Auth | Description                            |
| ------ | --------- | ---- | -------------------------------------- |
| `POST` | `/ai/ask` | Yes  | Ask AI about the market (rate-limited) |

### WebSocket

| Path                    | Auth | Description                  |
| ----------------------- | ---- | ---------------------------- |
| `GET /ws/prices?token=` | Yes  | Real-time Binance price feed |
| `GET /ws/status`        | Yes  | WebSocket connection status  |

### Health

| Method | Path      | Auth | Description                                  |
| ------ | --------- | ---- | -------------------------------------------- |
| `GET`  | `/health` | No   | Service health (database + CoinGecko status) |

---

## Deployment

### Google Cloud Run

Deployed via `scripts/deploy.sh` (in `.gitignore`):

```bash
./scripts/deploy.sh           # Full: secrets + backend + frontend + verify
./scripts/deploy.sh backend    # Backend only
./scripts/deploy.sh frontend  # Frontend only
./scripts/deploy.sh secrets   # Update ALLOWED_ORIGINS in Secret Manager
./scripts/deploy.sh mock:on   # Enable mock crypto data
./scripts/deploy.sh mock:off  # Enable real CoinGecko data
```

### Required GCP Secrets

| Secret Name                 | Description                    |
| --------------------------- | ------------------------------ |
| `supabase-url`              | Supabase project URL           |
| `supabase-anon-key`         | Supabase anonymous key         |
| `supabase-service-role-key` | Supabase admin key             |
| `allowed-origins`           | CORS origins (comma-separated) |
| `coingecko-api-key`         | CoinGecko Pro key (optional)   |
| `groq-api-key`              | Groq AI key                    |

### Supabase Configuration

Set in Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://monabit-frontend-290867308628.us-central1.run.app`
- **Redirect URLs**: `https://monabit-frontend-290867308628.us-central1.run.app/**`

---

## AI Tools Usage

| Tool                   | Purpose                                                 | How Used                                                                                         |
| ---------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Claude (Anthropic)** | Architecture, code generation, debugging, documentation | Planned architecture, generated boilerplate, debugged OAuth race conditions, wrote documentation |
| **opencode (CLI)**     | Interactive development, file editing, shell commands   | Code iteration, lint fixes, deployment debugging, git operations                                 |
| **GitHub Copilot**     | Inline code suggestions                                 | Auto-completion in editor during routine coding                                                  |

### Decisions Made by Me

- Stack selection (React, Fastify, Supabase, Cloud Run)
- Database schema design and RLS policies
- API endpoint design
- Deployment architecture (two Cloud Run services)
- Security measures (rate limiting, Helmet, Zod validation)
- CoinGecko as data provider with Binance WebSocket supplement

### AI Limitations Encountered

- OAuth hash race condition required manual debugging (AI suggested clearing hash immediately, which broke Supabase session processing)
- Cloud Run-specific deployment issues required iterative trial and error
- AI sometimes suggested outdated library APIs or non-existent methods

---

## Features

### Core (Required)

- [x] User registration (email/password)
- [x] User login
- [x] Logout
- [x] Google OAuth login
- [x] Protected routes
- [x] User management (list, create, deactivate)
- [x] Dashboard with top 10 cryptocurrencies
- [x] KPIs (market cap, 24h volume, BTC dominance)
- [x] Price chart (coin detail view)
- [x] External API data (CoinGecko + Binance WebSocket)
- [x] Database persistence (Supabase PostgreSQL)
- [x] Deployed on Cloud Run

### Extras (Implemented)

- [x] Admin/user roles
- [x] Audit logging
- [x] Backend tests (44 tests)
- [x] Frontend tests (55 tests)
- [x] CI/CD (GitHub Actions)
- [x] Crypto data caching (node-cache with TTL)
- [x] Rate limiting (per-route)
- [x] Dark mode
- [x] Search and filters
- [x] Cryptocurrency favorites per user
- [x] Price alerts
- [x] Structured logging (Pino)
- [x] Health endpoint
- [x] AI market assistant (Groq API)
- [x] Edit user profile (pending frontend UI)

### Not Implemented

- [ ] Edit user UI (backend `PATCH /users/:id` exists, frontend UI missing)
- [ ] Hard delete user (only soft deactivate)
- [ ] Email notifications for price alerts
- [ ] E2E tests (Playwright)
- [ ] Redis for multi-instance cache
- [ ] Custom domain mapping

---

## Known Limitations

- **CoinGecko free tier**: 30 req/min, 10K calls/month. Cache layer mitigates this; may need Pro upgrade for production.
- **Single Cloud Run instance**: WebSocket connection is stateful; `min:1, max:1` scaling prevents horizontal scaling. Migrate to Redis + dedicated WS process for scaling.
- **Google OAuth spinner**: When a deactivated user signs in via Google, the "Signing in..." spinner may persist. Login via email/password redirects to `/login` correctly with a toast message.
- **Build-time env vars**: `VITE_API_URL`, `VITE_WS_URL`, and `VITE_SUPABASE_ANON_KEY` are baked at Docker build time. Changing them requires a full rebuild.
- **WebSocket 60-min limit**: Cloud Run terminates connections after 60 minutes. The backend auto-reconnects with exponential backoff.
- **No admin seed in UI**: First admin must be created via `pnpm seed:admin` CLI command.

---

## Project Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Start all workspaces in parallel |
| `pnpm dev:frontend` | Start frontend only              |
| `pnpm dev:backend`  | Start backend only               |
| `pnpm build`        | Build all workspaces             |
| `pnpm lint`         | Lint all workspaces              |
| `pnpm typecheck`    | TypeScript check all workspaces  |
| `pnpm test`         | Run all tests                    |
| `pnpm format`       | Auto-format code with Prettier   |
| `pnpm format:check` | Check formatting without writing |
