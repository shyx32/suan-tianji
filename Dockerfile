# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
# Use corepack npm/node only — avoid pnpm workspace footguns in Docker
RUN corepack disable || true

FROM base AS deps
COPY package.json package-lock.json* pnpm-lock.yaml* ./
# Prefer npm ci when lock present; fall back to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi

FROM deps AS builder
COPY . .
# Guard against accidental workspace file
RUN rm -f pnpm-workspace.yaml
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT=standalone
RUN npx next build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]

FROM deps AS worker
COPY . .
RUN rm -f pnpm-workspace.yaml
ENV NODE_ENV=production
CMD ["npx", "tsx", "scripts/worker.ts"]

FROM deps AS migrate
COPY . .
RUN rm -f pnpm-workspace.yaml
CMD ["npx", "tsx", "scripts/migrate.ts"]
