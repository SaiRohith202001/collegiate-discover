# Classroom Demonstration Guide: Microservices & Data Tier

Use this guide to demonstrate the microservice architecture to your B.Tech DevOps students in real-time.

---

## Pre-Demo Checklist

- [ ] MongoDB running locally (`mongodb://127.0.0.1:27017`)
- [ ] Event Service seeded and connected to MongoDB (`event_db`)
- [ ] Registration Service connected to MongoDB (`registration_db`) and to Event Service API
- [ ] Can access `http://localhost:8081` in browser
- [ ] Can access `http://localhost:4300/health` (Event Service)
- [ ] Can access `http://localhost:4100/health` (Registration Service)
- [ ] Have explanation documents ready:
  - [ ] `MICROSERVICE_EXPLANATION.md` (for concepts)
  - [ ] `registration-service/INSPECT_DATABASE.md` (for hands-on)

---

## 5-Minute Live Demo Script

### Minute 1: Show the Architecture Diagram

**What to Say:**
> "In a monolithic system, everything is in one place. The database is shared. Everyone touches everything. Today we'll show you the modern approach: two independent microservices, each with its own MongoDB database, talking to each other only through HTTP APIs."

**Show on screen:**
```
Before (Monolithic):
┌─────────────────────────────────────┐
│        Main Application             │
└────────────────┬────────────────────┘
                 ↓
         ┌───────────────┐
         │ Shared Database│  ← Events AND Registrations here!
         └───────────────┘

After (Microservices):
┌──────────────────────┐         ┌──────────────────────────┐
│  Event Service (4300)│◀────────│ Registration Service(4100)│
└──────────┬───────────┘  HTTP   └──────────┬────────────────┘
           ↓                                ↓
  MongoDB (event_db)              MongoDB (registration_db)
```

### Minute 2: Open the Running Frontend

**Action:**
1. Open browser to `http://localhost:8081`
2. Show the CAMPUSLY home page
3. Navigate to `/events`
4. Click on an event
5. Show the registration form

**What to Say:**
> "The Explore Events page you see is served by Event Service on port 4300, backed by its own MongoDB database. When you click 'Register', a completely different microservice — Registration Service on port 4100 — takes over."

### Minute 3: Perform a Registration

**Action:**
1. Click "Register" for an event
2. Fill in the form
3. Click "Confirm Registration"
4. Show the success message with Registration ID

**What to Say:**
> "Watch what happens behind the scenes: Registration Service receives your form, but before saving anything, it calls Event Service's API to confirm the event actually exists and to fetch its title, venue and date. Only Registration Service touches MongoDB `registration_db`. It never queries `event_db` directly!"

### Minute 4: Show the Service APIs & Databases

**Action:**

Open PowerShell and run:

```powershell
# Check both service health endpoints
Invoke-RestMethod http://localhost:4300/health | ConvertTo-Json
Invoke-RestMethod http://localhost:4100/health | ConvertTo-Json

# Registration Service reports whether it can reach Event Service:
# "eventServiceConnected": true
# "dataAccessPattern": "API-Level Cross-Service Access (No Shared DB with Event Service)"
```

**View the MongoDB collections using mongosh (or node):**
```powershell
mongosh event_db --eval "db.events.find().pretty()"
mongosh registration_db --eval "db.registrations.find().pretty()"
```

**View the actual data via API:**
```powershell
Invoke-RestMethod http://localhost:4300/events | ConvertTo-Json -Depth 3
Invoke-RestMethod http://localhost:4100/registrations | ConvertTo-Json -Depth 3
```

**What to Say:**
> "Look! `event_db.events` and `registration_db.registrations` are two completely separate MongoDB databases. Registration documents even contain a snapshot of event details — `eventTitle`, `eventVenue`, `eventDate` — captured at registration time via the API call. This is data isolation with API-level cross-service access."

### Minute 5: Demonstrate Validation & Duplicate Prevention

**Action 1 — Try registering for a non-existent event:**
```powershell
$payload = @{
  eventId = "does-not-exist"
  fullName = "Test Student"
  studentId = "TEST-001"
  email = "test@campus.edu"
  phone = "+91 90000 00000"
  department = "CSE"
  year = "1st Year"
} | ConvertTo-Json

Invoke-RestMethod http://localhost:4100/registrations `
  -Method Post -ContentType 'application/json' -Body $payload

# Output: 404 Not Found
# Error: "Event 'does-not-exist' was not found in the Event Service"
```

**What to Say:**
> "Registration Service asked Event Service 'does this event exist?' via its API. Event Service said no, so Registration Service rejected the request — all before ever writing to MongoDB."

**Action 2 — Try registering the same student for the same event twice:**
```powershell
$payload = @{
  eventId = "codestorm-2026"
  fullName = "Sai Rohith"
  studentId = "21CSE0182"
  email = "sai.rohith@campus.edu"
  phone = "+91 98765 43210"
  department = "CSE"
  year = "3rd Year"
} | ConvertTo-Json

Invoke-RestMethod http://localhost:4100/registrations `
  -Method Post -ContentType 'application/json' -Body $payload

# Output: 409 Conflict
# Error: "This student is already registered for this event"
```

**What to Say:**
> "This time the event exists, but Registration Service's MongoDB compound unique index `{ eventId: 1, studentId: 1 }` on active registrations blocks the duplicate. This is enforced at the MongoDB index level — the database itself guarantees data integrity!"

---

## Extended Demo: 15 Minutes

If you have more time, add these sections:

### Show Both MongoDB Databases Side-by-Side

```powershell
node -e "
import { MongoClient } from 'mongodb';
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
console.log('--- Event DB ---');
console.log(await client.db('event_db').collection('events').find({}).toArray());
console.log('--- Registration DB ---');
console.log(await client.db('registration_db').collection('registrations').find({}).toArray());
await client.close();
"
```

### Show the Event Re-Seed / Migration Command

```powershell
# Re-seed (or seed for the first time) the Event Service's MongoDB database
npm run event-seed
```

**What to Say:**
> "This script upserts the event catalog directly into Event Service's own MongoDB database. It never touches `registration_db`. Each service's data lifecycle is managed independently — this is the essence of the Database-per-Service pattern."

### Simulate Event Service Being Down

Stop the Event Service process, then try registering again:

```powershell
Invoke-RestMethod http://localhost:4100/registrations `
  -Method Post -ContentType 'application/json' -Body $payload

# Output: 502 Bad Gateway
# Error: "Could not reach Event Service at http://localhost:4300: ..."
```

**What to Say:**
> "This is a real production concern: if a dependent service goes down, calls that rely on it fail gracefully with a clear error, rather than silently corrupting data or crashing the whole system."
