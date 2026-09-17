# Microservice Architecture: Real-Time Classroom Explanation

## What We Built

Two independently owned microservices, each with its own **MongoDB** database, demonstrating how a monolithic system evolves into microservices with the **Database-per-Service** pattern.

1. **Event Service** (port `4300`) → owns MongoDB database `event_db`
2. **Registration Service** (port `4100`) → owns MongoDB database `registration_db`

---

## BEFORE: Monolithic Architecture

```
┌─────────────────────────────────────┐
│   Frontend (React)                  │
│   - Event Discovery                 │
│   - Registration Form               │
│   - My Registrations                │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Monolithic Application            │
│   - All business logic              │
│   - All data access                 │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   SINGLE Database (Shared)          │
│   - Events Table  ← Our focus       │
│   - Users Table                     │
│   - Registrations Table ← Our focus │
│   - Quizzes Table                   │
│   - Certificates Table              │
└─────────────────────────────────────┘
```

**Problem:** One team owns everything. One database failure breaks everything.

---

## AFTER: Microservice Architecture with Isolated Data Tiers

```
┌───────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
└──────────────┬─────────────────────────────┬──────────────┘
               │                             │
               │ HTTP /events                │ HTTP /registrations
               ▼                             ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│   Event Service (:4300)     │◀──│ Registration Service (:4100)│
│  - Owns event catalog       │   │  - Business logic/validation│
│  - GET /events, /events/:id │   │  - GET /events/:id (API call)│
└──────────────┬──────────────┘   └──────────────┬──────────────┘
               │ Direct DB                       │ Direct DB
               ▼                                 ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│ MongoDB: event_db           │   │ MongoDB: registration_db    │
│  - Collection: events       │   │  - Collection: registrations│
│  - Private to Event Service │   │  - Private to Reg Service   │
└─────────────────────────────┘   └─────────────────────────────┘
```

**Key Architectural Principles Taught to Students:**
1. **Database-per-Service Pattern**: `Event Service` owns `event_db`; `Registration Service` owns `registration_db`. Neither ever connects to the other's database.
2. **API-Level DB Access**: When a student registers for an event, `Registration Service` calls `Event Service`'s HTTP API (`GET /events/:id`) to fetch and validate the event — it never queries `event_db` directly.
3. **Data Snapshotting**: Once fetched via the API, key event fields (`title`, `venue`, `date`) are snapshotted into the registration document — this is a common real-world pattern to avoid an extra API call every time a registration is displayed.
4. **Fail-Safe Boundaries**: If the event doesn't exist, Registration Service returns `404`. If Event Service is down, it returns `502 Bad Gateway` — demonstrating what happens when a dependent service is unavailable.

---

## The Microservices & MongoDB Databases

### 1. Event Microservice (Port 4300)
- **Database**: MongoDB (`event_db`)
- **Collection**: `events`
- **Key Feature**: Unique index on `id` field; supports filtering by `category`, `search`, `status`.
- **Endpoints**: `GET /health`, `GET /events`, `GET /events/:id`

### 2. Registration Microservice (Port 4100)
- **Database**: MongoDB (`registration_db`)
- **Collection**: `registrations`
- **Key Feature**: Compound unique index `{ eventId: 1, studentId: 1 }` with `partialFilterExpression: { status: "registered" }` for active duplicate prevention.
- **API Access Pattern**: Calls Event Service API (`http://localhost:4300/events/:id`) on every registration attempt to validate the event exists and to snapshot its details.
- **Endpoints**: `GET /health`, `GET /registrations`, `POST /registrations`, `DELETE /registrations/:id`

---

## The Database Collection & Document Schemas

### Collection: `event_db.events`

```json
{
  "_id": "ObjectId(...)",
  "id": "codestorm-2026",
  "title": "CodeStorm 2026",
  "subtitle": "24-Hour National Level Hackathon",
  "category": "Hackathon",
  "date": "2026-08-29",
  "venue": "Main Auditorium",
  "department": "CSE Department",
  "organizer": "Department of Computer Science & Engineering",
  "registrationDeadline": "2026-08-26",
  "maxParticipants": 400,
  "registeredParticipants": 312,
  "status": "upcoming"
}
```

### Collection: `registration_db.registrations`

```json
{
  "_id": "ObjectId(...)",
  "id": "9e7f95a0-aa62-4f87-a6da-7bfc3eb61664",
  "registrationId": "REG-GEN-2026-24573",
  "eventId": "codestorm-2026",
  "eventTitle": "CodeStorm 2026",
  "eventVenue": "Main Auditorium",
  "eventDate": "2026-08-29",
  "fullName": "Sai Rohith",
  "studentId": "21CSE0182",
  "email": "sai.rohith@campus.edu",
  "phone": "+91 98765 43210",
  "department": "Computer Science & Engineering",
  "year": "3rd Year",
  "teamName": "MongoDB Team",
  "teamMembers": ["Student One", "Student Two"],
  "status": "registered",
  "createdAt": "2026-09-12T02:30:24.573Z"
}
```

Notice `eventTitle`, `eventVenue`, and `eventDate` — these were fetched live from Event Service via HTTP API and snapshotted at registration time. `Registration Service` never touched `event_db` to get them.

### Index: Duplicate Prevention in MongoDB

```javascript
await registrationsCollection.createIndex(
  { eventId: 1, studentId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "registered" },
    name: "unique_active_registration"
  }
);
```

**What does this do?**
- Guarantees: Same student CANNOT register for same event twice
- Only counts ACTIVE registrations (`status: "registered"`)
- Enforced directly by MongoDB at the database level!

---

## The API: How Services Talk to Each Other

### 1. **Registration Service calls Event Service (API-Level DB Access)**

```
GET http://localhost:4300/events/codestorm-2026

Response:
{
  "id": "codestorm-2026",
  "title": "CodeStorm 2026",
  "venue": "Main Auditorium",
  "date": "2026-08-29",
  ...
}
```

This happens **inside** the Registration Service's `POST /registrations` handler, before it ever writes to MongoDB.

### 2. **Create Registration** (Student clicks "Register" button)

```
POST http://localhost:4100/registrations
Content-Type: application/json

{
  "eventId": "codestorm-2026",
  "fullName": "Sai Rohith",
  "studentId": "21CSE0182",
  "email": "sai.rohith@campus.edu",
  "phone": "+91 98765 43210",
  "department": "Computer Science & Engineering",
  "year": "3rd Year"
}

Response (201 Created):
{
  "id": "...",
  "registrationId": "REG-CSE-2026-67400",
  "eventTitle": "CodeStorm 2026",
  "eventVenue": "Main Auditorium",
  ...
}
```

### 3. **Registering for a Non-Existent Event**

```
POST http://localhost:4100/registrations
{ "eventId": "does-not-exist", ... }

Response (404 Not Found):
{
  "error": "Event 'does-not-exist' was not found in the Event Service"
}
```

### 4. **Duplicate Prevention** (Same student tries again)

```
Response (409 Conflict):
{
  "error": "This student is already registered for this event"
}
```

### 5. **Cancel Registration**

```
DELETE http://localhost:4100/registrations/{id}

Response (204 No Content)
```

---

## Hands-On: Query Both MongoDB Databases Directly

```powershell
node -e "
import { MongoClient } from 'mongodb';
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();

const eventDocs = await client.db('event_db').collection('events').find({}).toArray();
const regDocs = await client.db('registration_db').collection('registrations').find({}).toArray();

console.log('=== EVENT_DB (Event Service) ===');
console.log('Count:', eventDocs.length);

console.log('=== REGISTRATION_DB (Registration Service) ===');
console.log('Count:', regDocs.length);
console.log(JSON.stringify(regDocs, null, 2));

await client.close();
"
```

---

## Why Microservices Matter (for DevOps Class)

### Scaling Scenario

**Monolithic:** If registrations spike, the ENTIRE system needs more resources.

**Microservice:** Only Registration Service scales independently; Event Service (read-heavy, browsing traffic) can scale separately with its own caching strategy.

### Deployment Scenario

**Monolithic:** Bug in Event Service? Redeploy EVERYTHING.

**Microservice:** Bug in Event Service? Only that service redeploys — Registration Service keeps running (though new registrations would fail validation until Event Service is back, which is a great discussion point about service dependencies).

### Data Isolation

**Monolithic:** One team touches all data — Events table and Registrations table live in the same database.

**Microservice:** Each team owns their data.

```
Event Team          → event_db (ONLY Event Service connects to it)
Registration Team   → registration_db (ONLY Registration Service connects to it)
```

---

## Live Demonstration Commands

### Start the Services

```powershell
# Terminal 1: Seed & start Event Service
npm run event-seed
$env:EVENT_SERVICE_PORT='4300'
npm run event-service

# Terminal 2: Start Registration Service
$env:REGISTRATION_SERVICE_PORT='4100'
$env:EVENT_SERVICE_URL='http://localhost:4300'
npm run registration-service

# Terminal 3: Start the Frontend
$env:VITE_REGISTRATION_SERVICE_URL='http://localhost:4100'
$env:VITE_EVENT_SERVICE_URL='http://localhost:4300'
npm run dev
```

### Test the Services

```powershell
# Health checks (Registration Service reports whether it can reach Event Service)
Invoke-RestMethod http://localhost:4300/health | ConvertTo-Json -Compress
Invoke-RestMethod http://localhost:4100/health | ConvertTo-Json -Compress

# Create a registration (triggers Registration Service -> Event Service API call)
$payload = @{
  eventId = "codestorm-2026"
  fullName = "Demo Student"
  studentId = "DEMO-001"
  email = "demo@example.com"
  phone = "+91 9999999999"
  department = "CSE"
  year = "3rd Year"
} | ConvertTo-Json

Invoke-RestMethod http://localhost:4100/registrations `
  -Method Post `
  -ContentType 'application/json' `
  -Body $payload

# List all registrations
Invoke-RestMethod http://localhost:4100/registrations | ConvertTo-Json -Depth 5
```

---

## Summary for Your Students

### Key Takeaways

1. **Monolithic → Microservice Journey**
   - Start simple (everything in one place)
   - Extract services when team/scaling needs grow
   - Event Service and Registration Service are the FIRST extracted services

2. **Data Ownership**
   - Event Service owns ONLY event catalog data (`event_db`)
   - Registration Service owns ONLY registration data (`registration_db`)
   - Neither service can directly access the other's database

3. **API Boundary & Inter-Service Calls**
   - Frontend talks to Event Service for browsing, and Registration Service for registering
   - Registration Service talks to Event Service via HTTP to validate events
   - Clear contract: HTTP endpoints define the boundary between services
