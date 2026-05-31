# Changelog

All notable changes to the MonaBit Crypto Dashboard project.

---

## Phase 1 — Scaffolding & Core Features

Initial project setup, base features, and first deployment.

- Monorepo scaffolded with pnpm workspaces + Turborepo
- React 18 + Vite 5 frontend with Tailwind CSS
- Fastify 4 + TypeScript backend
- Supabase Auth integration (email/password registration and login)
- JWT Bearer token authentication with role-based access (admin/user)
- Inactive user blocking (403 on deactivated accounts)
- CoinGecko REST API integration with node-cache TTL layer
- Binance WebSocket real-time price relay
- Top 10 crypto dashboard, KPI cards, price charts
- User preferences (theme, currency) synced with backend
- `@monabit/shared-types` and `@monabit/shared-utils` packages
- Docker Compose for local development
- ESLint 9 flat config, Prettier, Husky, Commitlint

## Phase 2 — Auth, Data, Deployment

Google OAuth, real CoinGecko data, and Cloud Run deployment.

- Google OAuth via Supabase `signInWithOAuth` with redirect flow
- Protected route hash race condition resolved (`#access_token=` detection + spinner)
- Supabase `site_url` and redirect URLs configured for Cloud Run
- Logout invalidates Supabase session (`supabase.auth.signOut()`)
- `MOCK_CRYPTO=false` enabled for production — real CoinGecko data flows end-to-end
- CoinGecko API key header (`x-cg-demo-api-key`) support for higher rate limits
- `MOCK_CRYPTO` boolean parsing bug fixed (`z.coerce.boolean()` → `z.string().transform()`)
- `user_profiles.email` column added and merged from `auth.admin.listUsers()`
- Admin password reset via Supabase Admin API
- User management: list, create, deactivate, edit profile
- Favorites and price alerts CRUD
- Groq AI market assistant with injected market context (top 10 prices + KPIs)
- Frontend deployed to Cloud Run (`monabit-frontend`)
- Backend deployed to Cloud Run (`monabit-backend`)
- GCP Secret Manager configured for all production secrets
- Docker configs split: `nginx.conf` (Cloud Run) vs `nginx.docker.conf` (local proxy)

## Phase 3 — Refactoring & Security Hardening

Code quality, security audit, and dead code removal.

- 43 unused shadcn/ui components removed (only button, skeleton, dropdown-menu kept)
- 33 unused npm dependencies removed (radix-ui, cmdk, react-hook-form, etc.)
- Shared hooks extracted: `useAuthListener`, `useTop10Crypto`, `fetchAndSetProfile`
- Shared UI components created: `ChangeIndicator`, `SearchInput`, `PageHeader`
- `buttonVariants` split into `button.variants.ts` (react-refresh lint fix)
- ESLint strict-type-checked config per package
- Zod frontend validation schemas (`lib/schemas.ts`) — all API responses validated at service boundary
- All `request.params as { id }` replaced with `z.object().parse()` (6 routes)
- `PriceAlert` type derived from `z.infer<typeof priceAlertSchema>` — eliminated `as` casts
- `HttpError` class with statusCode for structured error responses
- `ZodError` → 400 in global error handler
- CORS whitelist configured via `ALLOWED_ORIGINS` env var
- Helmet enabled with restrictive Content Security Policy
- Rate limiting: 100 req/min global, 30/min auth, 10/min AI
- `.env.docker` removed from git tracking, `.env.docker.template` created with placeholders
- `console.error` in config replaced with `process.stderr.write` (circular dep fix)

## Phase 4 — Production Readiness

CoinGecko resilience, circuit breaker, and final deployment.

- CoinGecko 3-layer resilience: 429 retry (2s delay, 1 attempt) → circuit breaker (3 failures → 5 min open) → stale cache fallback (up to 5 min expired)
- Cache warmup on startup: `getTop10()` + `getMarketOverview()` pre-fetched before first request
- `CryptoIcon` component: renders CoinGecko image URLs with lazy loading + symbol fallback
- `sparkline_in_7d.price` data integrated from CoinGecko (168 data points per coin)
- Backend lint: `input.role ?? 'user'` → `input.role` (Zod schema already provides default)
- CI/CD: test step added to `ci-frontend.yml` (55 tests), `npm audit` → `pnpm audit` in security scan
- PR review workflow replaced with real lint+typecheck+test pipeline
- Comprehensive project README created
- All non-admin users deleted from Supabase, admin password reset
- Repository history reorganized: consolidated iterative commits into logical milestones, removed internal development artifacts

## Security Measures Applied

- JWT Bearer authentication on all data endpoints
- Role-based access control (admin/user) with middleware
- Inactive user blocking (403 response)
- CORS strict origin whitelist
- Content Security Policy (CSP) with Helmet
- Rate limiting per route (auth 30/min, logout 10/min, AI 10/min)
- Zod validation on all request bodies and params
- Row Level Security (RLS) on all Supabase tables
- Supabase `service_role` permissions granted for admin operations
- WebSocket connections require `?token=<jwt>` query param
- Pino structured logging with field redaction
- Audit logging middleware (fire-and-forget on POST/PATCH/DELETE)
- Secrets in GCP Secret Manager, never in git
- `detect-secrets` pre-commit hook + Gitleaks in CI

## Deployment Issues Resolved

| Issue                                                      | Resolution                                                              |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `@fastify/websocket@11` incompatible with Fastify 4        | Downgraded to v10                                                       |
| Cloud Run rejects `PORT=8080` env var (reserved)           | Removed from `--set-env-vars`                                           |
| Empty `coingecko-api-key` secret causes deploy error       | Removed empty secret, added conditionally                               |
| `cloud-sdk` Cloud Build image fails to pull                | Separated build+push from deploy (manual `gcloud run deploy`)           |
| `nginx.conf` references Docker hostname in Cloud Run       | Split into `nginx.conf` (SPA only) and `nginx.docker.conf` (with proxy) |
| Docker cache serves stale nginx.conf on rebuild            | `--no-cache` flag in Cloud Build                                        |
| `SHORT_SHA` not populated in manual `gcloud builds submit` | Explicit `--substitutions` with `git rev-parse --short HEAD`            |
| Multiline `--substitutions` breaks `gcloud builds submit`  | Flattened to single quoted string                                       |

## Tests

- Frontend: 55 unit tests (format, utils, schemas, components)
- Backend: 44 unit tests (schemas, mock data, auth, crypto)
- CI runs lint → typecheck → test → build on every push
