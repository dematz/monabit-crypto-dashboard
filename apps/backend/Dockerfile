FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/db/package.json ./packages/db/

RUN pnpm install --frozen-lockfile

COPY packages/shared-types ./packages/shared-types
COPY packages/shared-utils ./packages/shared-utils
COPY packages/db ./packages/db
COPY tsconfig.base.json ./
COPY apps/backend ./apps/backend

RUN pnpm --filter @monabit/backend build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types ./packages/shared-types
COPY --from=builder /app/packages/shared-utils ./packages/shared-utils

USER appuser
EXPOSE 8080
CMD ["node", "dist/server.js"]