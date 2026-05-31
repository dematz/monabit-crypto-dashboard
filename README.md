# MonaBit — Crypto Dashboard

Fullstack web application for consulting, visualizing, and managing cryptocurrency market information. Built with React, Node.js, Supabase (PostgreSQL), and deployed on Google Cloud Run.

**Live URLs:**

- Frontend: `https://monabit-frontend-XXXXX.us-central1.run.app`
- Backend: `https://monabit-backend-XXXXX.us-central1.run.app`
- Health: `https://monabit-backend-XXXXX.us-central1.run.app/health`

> Detailed documentation: [Frontend README](apps/frontend/README.md) | [Backend README](apps/backend/README.md)

---

## Scope

This project fulfills the technical challenge requirements for a crypto dashboard, covering:

- User registration, login, logout, and Google OAuth authentication
- Protected routes and role-based access (`admin` / `user`)
- User management (list, create, edit, deactivate)
- Dashboard with top 10 cryptocurrencies, KPIs, and charts
- Real-time price updates via WebSocket
- AI-powered market assistant (Groq API)
- User favorites and price alerts
- Audit logging of sensitive operations
- CI/CD pipeline, structured logging, and rate limiting
- Deployed on Google Cloud Run

---

## Tech Stack

| Layer        | Technology                                            | Purpose                                        |
| ------------ | ----------------------------------------------------- | ---------------------------------------------- |
| Frontend     | React 18, Vite 5, TypeScript, Tailwind CSS            | SPA with code-splitting and lazy-loaded charts |
| State        | Zustand, TanStack Query                               | Client state + server cache                    |
| Backend      | Node.js 20, Fastify 4, TypeScript                     | HTTP API + WebSocket relay                     |
| Validation   | Zod (shared between frontend and backend)             | Input validation and type inference            |
| Auth         | Supabase Auth (JWT + Google OAuth)                    | Registration, login, session management        |
| Database     | Supabase (PostgreSQL 15)                              | Persistence with RLS policies                  |
| External API | CoinGecko REST + Binance WebSocket                    | Crypto data + real-time prices                 |
| AI           | Groq API (LLaMA 3 70B)                                | Market analysis assistant                      |
| Infra        | Docker, Cloud Run, Artifact Registry, Secret Manager  | Containerized deployment                       |
| CI/CD        | GitHub Actions (lint, typecheck, test, security scan) | Automated quality gates                        |
| Tooling      | ESLint 9, Prettier, Husky, Commitlint, detect-secrets | Code quality and commit conventions            |

### Architecture

```
Browser ──HTTPS──▶ Cloud Run (Frontend: Nginx + React SPA)
                      │
                      ├── HTTPS API ──▶ Cloud Run (Backend: Fastify)
                      │                    │
                      │                    ├── Supabase (PostgreSQL + Auth)
                      │                    ├── CoinGecko (REST, cached with TTL)
                      │                    └── Binance WebSocket (real-time prices)
                      │
                      └── WSS ──────────▶ Backend WebSocket relay
```

- Two independent Cloud Run services share no state
- Backend has `min:1, max:3` instances (Binance WS requires sticky connection)
- Frontend has `min:0, max:3` instances (scale to zero)
- Secrets injected via GCP Secret Manager at deploy time

### Data Flow

```
1. Frontend requests data via TanStack Query (with stale-while-revalidate)
2. Backend checks node-cache (TTL-based per endpoint)
3. Cache hit → return data + last-updated timestamp
4. Cache miss → fetch from CoinGecko → store in cache → return
5. Binance WebSocket pushes real-time price ticks to connected clients
6. CoinGecko 429 or failure → circuit breaker opens → stale cache fallback
```

---

## Monorepo Structure

```
monabit-crypto-dashboard/
├── apps/
│   ├── frontend/          # React 18 + Vite 5 + TypeScript + Tailwind
│   │   └── README.md        → Detailed frontend documentation
│   └── backend/           # Fastify 4 + TypeScript
│       └── README.md        → Detailed backend documentation
├── packages/
│   ├── shared-types/      # @monabit/shared-types (Zod schemas + TS interfaces)
│   ├── shared-utils/      # @monabit/shared-utils (formatters, validators)
│   └── db/                # @monabit/db (migrations, seed scripts)
├── supabase/
│   ├── migrations/        # SQL migrations with RLS policies
│   ├── seed.sql           # Initial seed data
│   └── config.toml        # Supabase project configuration
├── infra/
│   ├── cloudbuild/        # Cloud Build YAML configs
│   │   ├── cloudbuild.frontend.yaml
│   │   └── cloudbuild.backend.yaml
│   └── docker/            # Docker Compose + nginx configs for local dev
├── scripts/               # Deployment helper (gitignored)
└── .github/workflows/     # CI/CD pipelines
```

---

## Data Model

### Tables

```
auth.users (Supabase managed)
  └── user_profiles (1:1)
        id, display_name, email, avatar_url, role, is_active, created_at, updated_at

  └── user_preferences (1:1)
        id, user_id, theme, currency, refresh_interval, created_at, updated_at

  └── user_favorites (1:N)
        id, user_id, coin_id, coin_symbol, added_at

  └── price_alerts (1:N)
        id, user_id, coin_id, coin_symbol, condition, target_price, is_active, triggered_at, created_at

audit_logs
        id, user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at
```

- **RLS policies**: Users can only read/update their own data; admins can read all profiles; service role writes audit logs
- **Triggers**: `handle_new_user()` auto-creates `user_profiles` + `user_preferences` on signup, including email from auth metadata

---

## Crypto Data Provider

**CoinGecko** (free tier) is the primary data source, supplemented by **Binance WebSocket** for real-time prices.

| Feature  | CoinGecko                        | Binance WebSocket           |
| -------- | -------------------------------- | --------------------------- |
| Data     | Top 10, market overview, history | Real-time price ticks       |
| Rate     | 30 req/min, cached (60–300s TTL) | Continuous stream           |
| Auth     | Optional API key for Pro tier    | None needed for public data |
| Fallback | Circuit breaker + stale cache    | Auto-reconnect with backoff |

---

## Authentication & Security

- **Supabase Auth** (email/password + Google OAuth)
- **JWT Bearer** tokens validated on every backend request
- **Role-based access**: `admin` and `user` roles stored in `user_profiles`
- **Inactive user blocking**: middleware returns 403 for deactivated accounts
- **CORS**: Strict origin whitelist via `ALLOWED_ORIGINS`
- **Rate limiting**: 100 req/min global, 10 req/min auth, 10 req/hr AI
- **Helmet**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Zod validation**: All backend endpoints validated with shared schemas
- **RLS**: Row Level Security enabled on every table
- **Secrets**: GCP Secret Manager for production; `.env` files gitignored
- **Audit logging**: Fire-and-forget pattern for admin actions

---

## Quick Start

### Prerequisites

- Node.js >= 20, pnpm >= 9, Docker, Supabase CLI

### Install & Run

```bash
pnpm install

# Backend (port 4000)
pnpm --filter @monabit/backend dev

# Frontend (port 3100)
pnpm --filter @monabit/frontend dev
```

### Docker Compose

```bash
cp infra/docker/.env.docker.template infra/docker/.env.docker
# Fill in your Supabase credentials in .env.docker
docker compose --env-file infra/docker/.env.docker \
  -f infra/docker/docker-compose.yml up --build -d
```

### Tests

```bash
pnpm test                    # All workspaces
pnpm --filter @monabit/backend test    # Backend (44 tests)
pnpm --filter @monabit/frontend test  # Frontend (55 tests)
```

### Environment Variables

See [`apps/backend/.env.example`](apps/backend/.env.example) and [`apps/frontend/.env.example`](apps/frontend/.env.example) for the full list of required variables.

---

## Deployment

### Google Cloud Run

Deployed via `scripts/deploy.sh` (in `.gitignore`):

```bash
./scripts/deploy.sh           # Full: secrets + backend + frontend + verify
./scripts/deploy.sh backend    # Backend only
./scripts/deploy.sh frontend  # Frontend only
./scripts/deploy.sh secrets   # Update ALLOWED_ORIGINS in Secret Manager
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

- **Site URL**: your frontend Cloud Run URL
- **Redirect URLs**: your frontend Cloud Run URL + `/**`

---

## Infrastructure

```
Google Cloud Platform (us-central1)
├── Cloud Run: monabit-frontend (0–3 instances, 256Mi)
├── Cloud Run: monabit-backend  (1–3 instances, 512Mi)
├── Artifact Registry: monabit-registry
├── Secret Manager: 6 secrets (Supabase, CoinGecko, Groq)
└── GitHub Actions: CI + security scan

Supabase (us-east-1)
├── PostgreSQL 15 (5 tables + RLS)
├── GoTrue (Auth: email/password + Google OAuth)
└── Migrations (2 migrations: schema + triggers)
```

### CI/CD Workflows

| Workflow            | Trigger        | Steps                           |
| ------------------- | -------------- | ------------------------------- |
| `ci-frontend.yml`   | Push to master | Lint → Typecheck → Test → Build |
| `ci-backend.yml`    | Push to master | Lint → Typecheck → Test → Build |
| `security-scan.yml` | PR to master   | Gitleaks + CodeQL + pnpm audit  |
| `pr-review.yml`     | PR to master   | Lint + Typecheck + Test         |

---

## AI-Assisted Development

During development, tools such as Lovable and Claude Code were used to accelerate:

- Initial scaffolding and project setup
- Component generation and boilerplate code
- Documentation drafting
- Test creation
- Code refactoring

All decisions related to:

- Architecture and tech stack selection
- Security model and authentication flow
- Data model and RLS policy design
- API integration strategy
- Deployment and infrastructure
- Quality validation and review

were made and verified manually.

Issues commonly found in AI-generated code were identified and corrected:

- Duplicate and dead code
- Inconsistent typing
- Incomplete or missing input validation
- Race conditions in async flows (e.g., OAuth hash handling)

---

## Project Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Start all workspaces in parallel |
| `pnpm dev:frontend` | Start frontend dev server        |
| `pnpm dev:backend`  | Start backend dev server         |
| `pnpm build`        | Build all workspaces             |
| `pnpm lint`         | Lint all workspaces              |
| `pnpm typecheck`    | TypeScript check all workspaces  |
| `pnpm test`         | Run all tests                    |
| `pnpm format`       | Auto-format with Prettier        |
| `pnpm format:check` | Check formatting without writing |

---

## Known Limitations

- **CoinGecko free tier**: 30 req/min, 10K calls/month. Cache layer mitigates this; upgrade to Pro for production scale.
- **Single Cloud Run instance**: Binance WebSocket is stateful per instance. `min:1, max:3` with requests routed to the same instance. For true horizontal scaling, migrate cache to Redis and extract the WebSocket relay into a dedicated service.
- **Build-time env vars**: `VITE_*` environment variables are baked at Docker build time. Changing them requires a full rebuild and redeploy.
- **WebSocket 60-min disconnect**: Cloud Run terminates connections after 60 minutes. Backend auto-reconnects with exponential backoff.
- **No admin seed UI**: First admin must be seeded via CLI (`pnpm seed:admin`).

### Future Improvements

- Redis for multi-instance cache sharing
- Dedicated WebSocket process separated from HTTP server
- Supabase Realtime for cross-tab synchronization
- Push notifications for price alerts
- Portfolio tracking
- E2E tests with Playwright
- CoinGecko Pro upgrade for higher rate limits

---

## License

Private repository. All rights reserved.
