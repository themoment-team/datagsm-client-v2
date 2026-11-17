FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV COREPACK_HOME="/pnpm/corepack"
ENV XDG_CACHE_HOME="/pnpm/cache"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install --global corepack@0.34.5 && corepack enable && corepack prepare pnpm@12.18.0 --activate && pnpm --version && chmod -R a+rX /pnpm
WORKDIR /app

FROM base AS pruner
ARG APP
RUN case "$APP" in client|admin|docs|status|oauth|projects) ;; *) printf 'APP는 client, admin, docs, status, oauth, projects 중 하나여야 합니다\n' >&2; exit 1 ;; esac
COPY . .
RUN pnpm dlx turbo@2.11.10 prune "@datagsm/$APP" --docker

FROM base AS dependencies
COPY --from=pruner /app/out/json/ .
RUN HUSKY=0 pnpm install --frozen-lockfile

FROM dependencies AS builder
ARG APP
ARG API_BASE_URL
COPY --from=pruner /app/out/full/ .
RUN API_BASE_URL="$API_BASE_URL" pnpm --filter "@datagsm/$APP" build

FROM base AS runtime
ARG APP
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app /app
WORKDIR /app/apps/${APP}
USER node
# start 스크립트가 client=3000, admin=3001, docs=3002, status=3003, oauth=3004, projects=3005로 고정한다.
EXPOSE 3000 3001 3002 3003 3004 3005
CMD ["pnpm", "start", "--hostname", "0.0.0.0"]
