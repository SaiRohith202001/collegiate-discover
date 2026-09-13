# Inspect the Microservices' MongoDB Databases

This guide shows how to look at the actual MongoDB databases that each microservice owns:

| Service | Database | Collection | Port |
| :--- | :--- | :--- | :--- |
| Event Service | `event_db` | `events` | 4300 |
| Registration Service | `registration_db` | `registrations` | 4100 |

**Key Point:** Each database is PRIVATE to its own microservice. Neither service ever connects directly to the other's database — cross-service data access happens only via HTTP API calls.

---

## Quick Inspection with Node.js

### View All Events in MongoDB

```powershell
node -e "
import { MongoClient } from 'mongodb';
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const docs = await client.db('event_db').collection('events').find({}).toArray();
console.log('Total events:', docs.length);
console.log(JSON.stringify(docs, null, 2));
await client.close();
"
```

### View All Registrations in MongoDB

```powershell
node -e "
import { MongoClient } from 'mongodb';
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const docs = await client.db('registration_db').collection('registrations').find({}).toArray();
console.log('Total registrations:', docs.length);
console.log(JSON.stringify(docs, null, 2));
await client.close();
"
```

### Count Registrations by Event in MongoDB

```powershell
node -e "
import { MongoClient } from 'mongodb';
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const pipeline = [
  { \$group: { _id: '\$eventId', total: { \$sum: 1 }, active: { \$sum: { \$cond: [{ \$eq: ['\$status', 'registered'] }, 1, 0] } } } }
];
const result = await client.db('registration_db').collection('registrations').aggregate(pipeline).toArray();
console.log(JSON.stringify(result, null, 2));
await client.close();
"
```

### Check Collection Indexes in MongoDB

```powershell
node -e "
import { MongoClient } from 'mongodb';
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
console.log('event_db.events indexes:');
console.log(await client.db('event_db').collection('events').indexes());
console.log('registration_db.registrations indexes:');
console.log(await client.db('registration_db').collection('registrations').indexes());
await client.close();
"
```

---

## Inspect Both Microservice Databases Side-by-Side

```powershell
node -e "
import { MongoClient } from 'mongodb';
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();

const eventDocs = await client.db('event_db').collection('events').find({}).toArray();
const regDocs = await client.db('registration_db').collection('registrations').find({}).toArray();

console.log('=== EVENT_DB (Event Service) ===');
console.log('Count:', eventDocs.length);
console.log(JSON.stringify(eventDocs.slice(0, 2), null, 2));

console.log('\n=== REGISTRATION_DB (Registration Service) ===');
console.log('Count:', regDocs.length);
console.log(JSON.stringify(regDocs, null, 2));

await client.close();
"
```

---

## Using `mongosh` (MongoDB Shell)

```powershell
# Event Service database
mongosh event_db --eval "db.events.find().pretty()"
mongosh event_db --eval "db.events.countDocuments()"

# Registration Service database
mongosh registration_db --eval "db.registrations.find().pretty()"
mongosh registration_db --eval "db.registrations.getIndexes()"
```

---

## Demonstrate the API-Level Access Pattern Live

While `Registration Service` is running, trigger a registration and watch its console log a call to `Event Service`:

```powershell
$payload = @{
  eventId = "codestorm-2026"
  fullName = "Demo Student"
  studentId = "DEMO-100"
  email = "demo100@campus.edu"
  phone = "+91 90000 00000"
  department = "CSE"
  year = "2nd Year"
} | ConvertTo-Json

Invoke-RestMethod http://localhost:4100/registrations `
  -Method Post -ContentType 'application/json' -Body $payload | ConvertTo-Json -Depth 3
```

Then confirm the new registration document carries a snapshot of the event, fetched from `event_db` via HTTP — not a direct DB read:

```powershell
node -e "
import { MongoClient } from 'mongodb';
const client = new MongoClient('mongodb://127.0.0.1:27017');
await client.connect();
const doc = await client.db('registration_db').collection('registrations').findOne({ studentId: 'DEMO-100' });
console.log(JSON.stringify(doc, null, 2));
await client.close();
"
```
