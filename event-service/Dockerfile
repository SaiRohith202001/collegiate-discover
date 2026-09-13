# Node/Express-style microservice image for the Event Service.
# Uses plain Node (no framework) + the official mongodb driver — see server.mjs.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only this service's manifest is needed; it has no separate package.json,
# so it shares the repo root's dependencies (mongodb driver already listed there).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY event-service/ ./event-service/

RUN addgroup -S app && adduser -S app -G app
USER app

ENV EVENT_SERVICE_PORT=4300
EXPOSE 4300

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.EVENT_SERVICE_PORT||4300)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "event-service/server.mjs"]
