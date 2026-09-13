# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: build — installs full dependency tree and runs the Vite/TanStack
# Start production build. Vite bakes VITE_* env vars into the client bundle
# at BUILD time, so they must be passed in as build ARGs (not runtime ENV).
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first so this layer is cached unless package files change.
COPY package.json package-lock.json ./
# The repository lockfile may have been generated on Windows and omit Linux
# optional native packages. Resolve from package.json inside Alpine so Vite,
# Tailwind, Lightning CSS, and Rolldown get the correct musl bindings.
RUN rm package-lock.json && npm install --include=optional
# Tailwind's Lightning CSS dependency has the same cross-platform optional
# dependency issue in a Windows-generated lockfile. Install both versions
# used by the current dependency tree (top-level and nested).

COPY . .

# Build-time args: URLs the *browser* uses to reach the microservices.
# These must be host-reachable (published) ports, since the API calls are
# made from client-side code in the user's browser, not from inside the
# frontend container's network namespace.
ARG VITE_REGISTRATION_SERVICE_URL=http://localhost:4100
ARG VITE_EVENT_SERVICE_URL=http://localhost:4300
ENV VITE_REGISTRATION_SERVICE_URL=$VITE_REGISTRATION_SERVICE_URL
ENV VITE_EVENT_SERVICE_URL=$VITE_EVENT_SERVICE_URL

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: runtime — copies only the built Nitro server output (node-server
# preset) into a slim image. No source code, dev dependencies, or build
# tools ship in the final image.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Run as a non-root user for defense-in-depth.
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.output ./.output

USER app

# TanStack Start's node-server preset (h3/srvx) listens on $PORT (default 3000).
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
