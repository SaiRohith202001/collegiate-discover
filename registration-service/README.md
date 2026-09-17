# Registration Service (MongoDB Microservice)

This is the registration-owned data tier for the application. It connects directly to MongoDB (`registration_db` database, `registrations` collection); the main application never reads this MongoDB database directly.

**Dependency on Event Service:** Registration Service does NOT own or connect to event data (`event_db`). Instead, on every `POST /registrations`, it calls Event Service's HTTP API (`GET {EVENT_SERVICE_URL}/events/:id`) to validate the event exists and to snapshot its `title`, `venue`, and `date` into the registration record. This demonstrates **API-level cross-service database access** instead of shared/direct database coupling.

## Run

```powershell
$env:REGISTRATION_SERVICE_PORT=4100
$env:MONGODB_URI="mongodb://127.0.0.1:27017"
$env:EVENT_SERVICE_URL="http://localhost:4300"
node registration-service/server.mjs
```

> Make sure Event Service (see [event-service/README.md](../event-service/README.md)) is running and seeded first, otherwise registrations will fail with `502 Bad Gateway`.

The service exposes `GET /health`, `GET /registrations`, `POST /registrations`, and `DELETE /registrations/:id`. On startup, it connects to MongoDB and ensures a unique active `(eventId, studentId)` index for duplicate prevention. The `/health` endpoint also reports whether it can reach Event Service.

To use it from the frontend, start Vite with:

```powershell
$env:VITE_REGISTRATION_SERVICE_URL="http://localhost:4100"
$env:VITE_EVENT_SERVICE_URL="http://localhost:4300"
npm run dev
```

Without those variables, the UI intentionally retains its localStorage/mock-data fallback for offline development.

## Migration

Export the browser key `campusly.registrations` as a JSON array, save it as `registration-service/localstorage-export.json`, then run:

```powershell
node registration-service/migrate-localstorage.mjs
```

The migration is repeatable, preserves IDs, and never deletes the source export or existing service records. It imports records into MongoDB with `updateOne` and `upsert: true`.

