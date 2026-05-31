#!/usr/bin/env bash
# deploy.sh — Build, push, and deploy MonaBit to Cloud Run
#
# All project-specific values (GCP project, region, URLs, secrets) come from
# infra/docker/.env.docker — never hardcode them here.
#
# Prerequisites:
#   1. gcloud CLI installed and authenticated:
#        gcloud auth login
#   2. infra/docker/.env.docker filled in (copy from .env.docker.template)
#
# Usage:
#   ./scripts/deploy.sh              # Deploy both services
#   ./scripts/deploy.sh backend      # Backend only
#   ./scripts/deploy.sh frontend     # Frontend only
#   ./scripts/deploy.sh secrets      # Update GCP Secret Manager only
#   ./scripts/deploy.sh mock:off     # Set MOCK_CRYPTO=false on backend
#   ./scripts/deploy.sh mock:on      # Set MOCK_CRYPTO=true on backend
#   ./scripts/deploy.sh verify       # Check deployment status & IAM
# =============================================================================

set -euo pipefail

# ─── Load env file ────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/infra/docker/.env.docker"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Missing ${ENV_FILE}"
  echo "   Copy infra/docker/.env.docker.template → .env.docker and fill in values."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
echo "✅ Loaded env from ${ENV_FILE}"

# ─── Required vars ────────────────────────────────────────────────────────────

require() {
  local name="$1"
  local val="${!name:-}"
  if [[ -z "$val" ]]; then
    echo "❌ Missing ${name}. Add it to infra/docker/.env.docker"
    exit 1
  fi
}

require "GCP_PROJECT"
require "GCP_REGION"
require "GCP_BACKEND_SERVICE"
require "GCP_FRONTEND_SERVICE"
require "GCP_REGISTRY"
require "BACKEND_URL"
require "FRONTEND_URL"
require "SUPABASE_URL"
require "SUPABASE_ANON_KEY"
require "SUPABASE_SERVICE_ROLE_KEY"

ACTION="${1:-all}"
if [[ "$ACTION" != "frontend" ]]; then
  require "COINGECKO_API_KEY"
  require "GROQ_API_KEY"
fi

# ─── Derived vars ─────────────────────────────────────────────────────────────

BACKEND_IMAGE="${GCP_REGISTRY}/backend"
FRONTEND_IMAGE="${GCP_REGISTRY}/frontend"
WS_URL="wss://${BACKEND_URL#https://}/ws/prices"
ORIGINS="${FRONTEND_URL},${BACKEND_URL}"

# ─── Helpers ──────────────────────────────────────────────────────────────────

check_gcloud() {
  if ! gcloud auth print-access-token &>/dev/null; then
    echo "❌ gcloud not authenticated. Run: gcloud auth login"
    exit 1
  fi

  local active_project
  active_project="$(gcloud config get-value project 2>/dev/null || true)"
  if [[ "$active_project" != "$GCP_PROJECT" ]]; then
    echo "⚠ Project mismatch: active=${active_project}, expected=${GCP_PROJECT}"
    echo "   Run: gcloud config set project ${GCP_PROJECT}"
    exit 1
  fi
}

section() {
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "  $1"
  echo "═══════════════════════════════════════════════════════════════"
}

# ─── Secrets ──────────────────────────────────────────────────────────────────

update_secrets() {
  section "Updating GCP Secret Manager secrets"

  echo -n "$ORIGINS" | gcloud secrets versions add allowed-origins --data-file=-
  echo "✅ allowed-origins"

  echo -n "$SUPABASE_URL" | gcloud secrets versions add supabase-url --data-file=-
  echo "✅ supabase-url"

  echo -n "$SUPABASE_ANON_KEY" | gcloud secrets versions add supabase-anon-key --data-file=-
  echo "✅ supabase-anon-key"

  echo -n "$SUPABASE_SERVICE_ROLE_KEY" | gcloud secrets versions add supabase-service-role-key --data-file=-
  echo "✅ supabase-service-role-key"

  echo -n "$COINGECKO_API_KEY" | gcloud secrets versions add coingecko-api-key --data-file=-
  echo "✅ coingecko-api-key"

  echo -n "$GROQ_API_KEY" | gcloud secrets versions add groq-api-key --data-file=-
  echo "✅ groq-api-key"
}

# ─── Backend ──────────────────────────────────────────────────────────────────

build_backend() {
  section "Building & pushing backend"

  local sha
  sha="$(git rev-parse --short HEAD)"
  gcloud builds submit \
    --config infra/cloudbuild/cloudbuild.backend.yaml \
    --substitutions SHORT_SHA="${sha}" \
    .

  echo "${sha}" > /tmp/monabit-backend-sha
  echo "✅ Backend build + push done (tag: ${sha})"
}

deploy_backend() {
  section "Deploying backend"

  local tag
  tag="$(cat /tmp/monabit-backend-sha 2>/dev/null || \
    gcloud artifacts docker images list "${BACKEND_IMAGE}" --include-tags --filter="tags:*" --format='value(tags)' --limit=1 2>/dev/null || echo "latest")"

  gcloud run deploy "$GCP_BACKEND_SERVICE" \
    --image="${BACKEND_IMAGE}:${tag}" \
    --region="$GCP_REGION" --platform=managed \
    --no-allow-unauthenticated \
    --min-instances=1 --max-instances=3 --memory=512Mi \
    --set-env-vars="NODE_ENV=production,COINGECKO_API_URL=${COINGECKO_API_URL:-https://api.coingecko.com/api/v3},MOCK_CRYPTO=${MOCK_CRYPTO:-false},BINANCE_WS_URL=${BINANCE_WS_URL:-wss://stream.binance.com:9443},CACHE_TTL_TOP10=${CACHE_TTL_TOP10:-60},CACHE_TTL_MARKET_OVERVIEW=${CACHE_TTL_MARKET_OVERVIEW:-120},CACHE_TTL_COIN_HISTORY=${CACHE_TTL_COIN_HISTORY:-300},LOG_LEVEL=${LOG_LEVEL:-info},APP_VERSION=${APP_VERSION:-0.1.0},GROQ_MODEL=${GROQ_MODEL:-llama-3.3-70b-versatile},GROQ_TIMEOUT=${GROQ_TIMEOUT:-30000}" \
    --set-secrets="SUPABASE_URL=supabase-url:latest,SUPABASE_ANON_KEY=supabase-anon-key:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest,ALLOWED_ORIGINS=allowed-origins:latest,COINGECKO_API_KEY=coingecko-api-key:latest,GROQ_API_KEY=groq-api-key:latest"

  gcloud run services add-iam-policy-binding "$GCP_BACKEND_SERVICE" \
    --region="$GCP_REGION" \
    --member="allUsers" \
    --role="roles/run.invoker"

  echo "✅ Backend deployed + IAM invoker binding applied"
}

# ─── Frontend ─────────────────────────────────────────────────────────────────

build_frontend() {
  section "Building & pushing frontend"

  gcloud builds submit \
    --config infra/cloudbuild/cloudbuild.frontend.yaml \
    --substitutions "_VITE_API_URL=${BACKEND_URL},_VITE_WS_URL=${WS_URL},_VITE_SUPABASE_URL=${SUPABASE_URL}" \
    .

  echo "✅ Frontend build + push done"
}

deploy_frontend() {
  section "Deploying frontend"

  gcloud run deploy "$GCP_FRONTEND_SERVICE" \
    --image="${FRONTEND_IMAGE}:latest" \
    --region="$GCP_REGION" --platform=managed \
    --allow-unauthenticated \
    --min-instances=0 --max-instances=3 --memory=256Mi

  echo "✅ Frontend deployed"
}

# ─── Mock toggle ──────────────────────────────────────────────────────────────

set_mock() {
  local value="$1"
  section "Setting MOCK_CRYPTO=${value}"

  gcloud run services update "$GCP_BACKEND_SERVICE" \
    --region="$GCP_REGION" \
    --update-env-vars="MOCK_CRYPTO=${value}"

  echo "✅ MOCK_CRYPTO=${value} applied"
}

# ─── Verification ─────────────────────────────────────────────────────────────

verify() {
  section "Verifying deployments"

  echo "→ Frontend: ${FRONTEND_URL}"
  local frontend_code
  frontend_code=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" 2>/dev/null || echo "000")
  echo "  HTTP ${frontend_code}"

  echo "→ Backend: ${BACKEND_URL}/health"
  local backend_code
  backend_code=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/health" 2>/dev/null || echo "000")
  echo "  HTTP ${backend_code}"

  if [[ "$backend_code" == "200" ]]; then
    echo "→ Backend response:"
    curl -s "${BACKEND_URL}/health" | head -5
  fi

  local has_invoker
  has_invoker=$(gcloud run services get-iam-policy "$GCP_BACKEND_SERVICE" --region="$GCP_REGION" --format="value(bindings)" 2>/dev/null | grep -c "allUsers" || echo "0")
  if [[ "$has_invoker" -ge 1 ]]; then
    echo "✅ Backend IAM: allUsers has roles/run.invoker"
  else
    echo "⚠️  Backend IAM: allUsers missing roles/run.invoker — run 'deploy backend' to fix"
  fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────

main() {
  check_gcloud

  local action="${1:-all}"

  case "$action" in
    all)
      update_secrets
      build_backend
      deploy_backend
      build_frontend
      deploy_frontend
      verify
      ;;
    backend)
      build_backend
      deploy_backend
      verify
      ;;
    frontend)
      build_frontend
      deploy_frontend
      verify
      ;;
    secrets)
      update_secrets
      ;;
    mock:on)
      set_mock "true"
      ;;
    mock:off)
      set_mock "false"
      ;;
    verify)
      verify
      ;;
    *)
      echo "Usage: $0 [all|backend|frontend|secrets|mock:on|mock:off|verify]"
      exit 1
      ;;
  esac

  echo ""
  echo "✅ Done"
}

main "$@"