# Event Microservice (MongoDB)

Owns event catalog data in a dedicated MongoDB database (`event_db`).

## Key Classroom Architectural Concept

- **Database Isolation**: Event Service owns `event_db`, completely separate from `registration_db`.
- **API-Level DB Access**: The Registration Service does NOT connect to `event_db` directly. When Registration Service needs event details (e.g. to validate an event exists, get its title/venue, or check the registration deadline), it calls the Event Service HTTP API (`GET /events/:id`).

## Quick Start

### 1. Seed the Event Database
```powershell
npm run event-seed
```

### 2. Run Event Service
```powershell
npm run event-service
# Runs on http://localhost:4300
```

### 3. Check Health Endpoint
```powershell
Invoke-RestMethod http://localhost:4300/health | ConvertTo-Json
```

### 4. Inspect Events in MongoDB
```powershell
mongosh event_db --eval "db.events.find().pretty()"
```

## API Endpoints

- `GET /health` — service + DB status
- `GET /events` — list events (supports `?category=`, `?search=`, `?status=`)
- `GET /events/:id` — get a single event by id (used by Registration Service)
