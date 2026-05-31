# MonaBit Frontend

React 18 SPA for the MonaBit crypto dashboard. Built with Vite 5, TypeScript, Tailwind CSS, TanStack Query, Zustand, and Recharts.

See the [root README](../../README.md) for project-wide documentation.

---

## Tech Stack

| Library               | Version | Purpose                                  |
| --------------------- | ------- | ---------------------------------------- |
| React                 | 18.3    | UI framework                             |
| Vite                  | 5.x     | Build tool with code-splitting           |
| TypeScript            | 5.4+    | Type safety                              |
| Tailwind CSS          | 3.4     | Utility-first styling, dark mode support |
| TanStack Query        | 5.x     | Server state cache with auto-refetch     |
| Zustand               | 4.x     | Lightweight client state management      |
| React Router          | 6.x     | Routing with protected routes            |
| Recharts              | 2.x     | SVG charts (lazy-loaded)                 |
| Supabase JS Client    | 2.x     | Auth + database client                   |
| Zod                   | 3.x     | Runtime validation (shared with backend) |
| Lucide React          | 0.383   | Icons (tree-shakeable)                   |
| clsx + tailwind-merge | latest  | Conditional Tailwind classes             |
| Sonner                | 2.x     | Toast notifications                      |
| vitest                | 1.x     | Unit testing                             |

---

## Project Structure

```
apps/frontend/
├── src/
│   ├── App.tsx                      # Root component, providers, protected routes
│   ├── main.tsx                     # Entry point
│   ├── pages/
│   │   ├── auth/login.tsx           # Email/password + Google OAuth login
│   │   ├── dashboard/
│   │   │   ├── dashboard.tsx        # Main dashboard with top 10 + KPIs + chart
│   │   │   └── settings.tsx         # User preferences (theme, currency)
│   │   └── users/users-page.tsx     # Admin user management
│   ├── components/
│   │   ├── features/
│   │   │   ├── ai-assistant.tsx     # Groq AI chat panel
│   │   │   ├── alert-modal.tsx      # Create/edit price alerts
│   │   │   ├── crypto-table.tsx     # Top 10 crypto table with favorites + search
│   │   │   ├── kpi-card.tsx         # Market overview KPIs
│   │   │   ├── price-chart.tsx      # Coin detail chart view
│   │   │   ├── recharts-area-chart.tsx   # Lazy-loaded area chart
│   │   │   └── recharts-sparkline.tsx    # Lazy-loaded sparkline
│   │   ├── layout/
│   │   │   ├── app-shell.tsx        # Main layout with sidebar
│   │   │   └── app-sidebar.tsx      # Navigation sidebar
│   │   ├── ui/
│   │   │   ├── button.tsx           # Variant button (shadcn-inspired)
│   │   │   ├── change-indicator.tsx # Percentage change badge
│   │   │   ├── crypto-icon.tsx     # Coin logo image with fallback
│   │   │   ├── dropdown-menu.tsx    # Radix dropdown menu
│   │   │   ├── page-header.tsx      # Reusable page title + actions
│   │   │   ├── search-input.tsx     # Reusable search field
│   │   │   └── skeleton.tsx         # Loading skeleton
│   │   └── theme-manager.tsx        # Dark/light mode toggle with persistence
│   ├── services/
│   │   ├── api.ts                   # Axios-like fetch wrapper with token refresh
│   │   ├── auth.ts                  # Supabase auth + profile sync
│   │   ├── crypto-api.ts            # Crypto data fetching (Zod-validated)
│   │   ├── groq-api.ts              # AI assistant API client
│   │   ├── supabase.ts             # Supabase client instance
│   │   └── users-api.ts             # User CRUD API client
│   ├── hooks/
│   │   ├── use-auth-listener.ts    # Auth state change listener
│   │   ├── use-binance-ws.ts       # Binance WebSocket real-time prices
│   │   ├── use-chart-colors.ts     # Dynamic chart color palette
│   │   ├── use-refresh-ms.ts       # Auto-refresh interval hook
│   │   └── use-top10-crypto.ts    # Shared TanStack Query for top 10 data
│   ├── stores/
│   │   └── app-store.ts            # Zustand store (auth state, user, preferences)
│   ├── lib/
│   │   ├── format.ts               # Locale-safe currency/percent formatters
│   │   ├── utils.ts                 # Class name utilities
│   │   ├── schemas.ts               # Zod schemas for API response validation
│   │   └── mock-data.ts            # Dev mock data for crypto
│   ├── types/
│   │   └── index.ts                 # Shared type re-exports
│   └── styles/
│       └── globals.css              # Tailwind base + custom CSS variables
├── nginx.conf                       # Cloud Run SPA config (no proxy)
├── nginx.docker.conf                # Docker Compose config (proxies /api + /ws)
├── Dockerfile                        # Multi-stage: Vite build → Nginx serve
├── vite.config.ts                    # Manual chunks for bundle optimization
├── vitest.config.ts                  # Test config with happy-dom environment
└── package.json
```

---

## Key Features

### Authentication

- Email/password registration and login via Supabase Auth
- Google OAuth with redirect-based flow
- `ProtectedRoute` component handles:
  - Redirect to `/login` when not authenticated
  - OAuth hash race condition: detects `#access_token=` in URL, shows "Signing in..." spinner, waits for Supabase to process the session
- Automatic token refresh on 401 responses
- Inactive user detection: shows toast and redirects to login

### Dashboard

- Top 10 cryptocurrencies table with real-time price updates via Binance WebSocket
- KPI cards: total market cap, 24h volume, BTC dominance, active cryptocurrencies
- Price chart with lazy-loaded Recharts (7D/1M/1Y ranges)
- Crypto icons rendered from CoinGecko image URLs with lazy loading and fallback
- Change indicators (percentage badges) for 24h price changes
- Search/filter functionality with locale-safe formatting

### Favorites & Alerts

- Favorite coins: synced to backend via `/users/me/favorites`
- Price alerts: create above/below price conditions, deactivate when triggered
- Both persisted to Supabase PostgreSQL with RLS policies

### AI Assistant

- Groq-powered market analysis chat (`llama3-70b-8192`)
- Backend injects current market context (top 10 prices) into each prompt
- Graceful fallback to simulated responses when `GROQ_API_KEY` is not set

### Code Splitting

Vite `manualChunks` configuration splits the bundle into 9 vendor chunks:

```
vendor-react    → React + ReactDOM
vendor-router   → React Router
vendor-query    → TanStack Query
vendor-charts   → Recharts (lazy-loaded per page)
vendor-ui       → Radix UI components
vendor-supabase → Supabase JS Client
vendor-store    → Zustand
index           → App code
login           → Login page (lazy)
```

---

## Routing

| Path        | Component      | Auth  | Description                   |
| ----------- | -------------- | ----- | ----------------------------- |
| `/login`    | `LoginPage`    | No    | Email/password + Google OAuth |
| `/`         | `Dashboard`    | Yes   | Top 10, KPIs, chart           |
| `/users`    | `UsersPage`    | Admin | User management table         |
| `/settings` | `SettingsPage` | Yes   | Preferences (theme, currency) |
| `*`         | `Navigate`     | —     | Redirect to `/login`          |

---

## State Management

**Zustand** (`app-store.ts`):

- Auth state: `user`, `session`, `isAuthenticated`, `isLoading`
- User profile: `profile` with `role`, `is_active`, `display_name`
- Preferences: `theme`, `currency`, `refreshInterval`
- Sync actions: `fetchAndSetProfile()`, `updatePreferences()`

**TanStack Query** (`use-top10-crypto.ts`, service hooks):

- Server state cache with stale-while-revalidate
- Automatic background refetch
- Shared `useTop10Crypto()` hook prevents duplicate requests

---

## Environment Variables

| Variable                 | Description            | Default                         |
| ------------------------ | ---------------------- | ------------------------------- |
| `VITE_PORT`              | Dev server port        | `3100`                          |
| `VITE_API_URL`           | Backend API base URL   | `http://localhost:4000`         |
| `VITE_WS_URL`            | Backend WebSocket URL  | `ws://localhost:4000/ws/prices` |
| `VITE_SUPABASE_URL`      | Supabase project URL   | —                               |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | —                               |

> `VITE_*` variables are baked at build time. Changing them requires a rebuild.

---

## Testing

55 unit tests covering:

- `lib/format.test.ts` — locale-safe currency and percentage formatting
- `lib/utils.test.ts` — utility functions (`cn`, `formatTimeAgo`)
- `lib/schemas.test.ts` — Zod schema validation for API responses
- `components/ui/change-indicator.test.tsx` — change badge rendering
- `components/ui/crypto-icon.test.tsx` — icon image vs fallback rendering

```bash
pnpm --filter @monabit/frontend test
pnpm --filter @monabit/frontend test:watch
```

---

## Nginx Configuration

Two configs are provided:

- **`nginx.conf`** — For Cloud Run: serves the SPA static files, no proxy blocks (frontend and backend are separate Cloud Run services)
- **`nginx.docker.conf`** — For Docker Compose: proxies `/api/*` and `/ws/*` to the backend container, serves SPA for everything else

---

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start dev server (port 3100)
pnpm --filter @monabit/frontend dev

# Type check
pnpm --filter @monabit/frontend typecheck

# Lint
pnpm --filter @monabit/frontend lint

# Build for production
pnpm --filter @monabit/frontend build
```
