# Node/Express-style microservice image for the Registration Service.
# Uses plain Node (no framework) + the official mongodb driver — see server.mjs.
# Calls the Event Service over HTTP to validate events (API-level access,
# no shared database between services).
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY registration-service/ ./registration-service/

RUN addgroup -S app && adduser -S app -G app
USER app

ENV REGISTRATION_SERVICE_PORT=4100
EXPOSE 4100

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.REGISTRATION_SERVICE_PORT||4100)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "registration-service/server.mjs"]
