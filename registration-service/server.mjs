import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";

const port = Number(process.env.REGISTRATION_SERVICE_PORT || 4100);
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB_NAME || "registration_db";
const eventServiceUrl = (process.env.EVENT_SERVICE_URL || "http://localhost:4300").replace(/\/$/, "");

const client = new MongoClient(mongoUri);
let db;
let registrationsCollection;

async function initDb() {
  await client.connect();
  db = client.db(dbName);
  registrationsCollection = db.collection("registrations");

  // Create unique index for duplicate prevention (active registrations for event + student)
  try {
    await registrationsCollection.createIndex(
      { eventId: 1, studentId: 1 },
      {
        unique: true,
        partialFilterExpression: { status: "registered" },
        name: "unique_active_registration",
      },
    );
    await registrationsCollection.createIndex(
      { registrationId: 1 },
      { unique: true, sparse: true },
    );
  } catch (indexErr) {
    console.warn("[registration-service] Note on index creation:", indexErr.message);
  }

  console.log(`[registration-service] Connected to MongoDB at ${mongoUri}`);
  console.log(`[registration-service] Using database: ${dbName}, collection: registrations`);
}

function toRegistrationResponse(doc) {
  return {
    id: doc.id || doc._id.toString(),
    registrationId: doc.registrationId,
    eventId: doc.eventId,
    ...(doc.eventTitle ? { eventTitle: doc.eventTitle } : {}),
    ...(doc.eventVenue ? { eventVenue: doc.eventVenue } : {}),
    ...(doc.eventDate ? { eventDate: doc.eventDate } : {}),
    fullName: doc.fullName,
    studentId: doc.studentId,
    email: doc.email,
    phone: doc.phone,
    department: doc.department,
    year: doc.year,
    ...(doc.teamName ? { teamName: doc.teamName } : {}),
    ...(Array.isArray(doc.teamMembers) && doc.teamMembers.length ? { teamMembers: doc.teamMembers } : {}),
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

const requiredFields = ["eventId", "fullName", "studentId", "email", "phone", "department", "year"];
function validate(input) {
  const missing = requiredFields.filter((field) => typeof input[field] !== "string" || !input[field].trim());
  if (missing.length) return `Missing required fields: ${missing.join(", ")}`;
  if (input.teamMembers !== undefined && !Array.isArray(input.teamMembers)) {
    return "teamMembers must be an array";
  }
  return null;
}

function makeRegistrationId(department) {
  const code = (department.match(/[A-Z]{2,4}/)?.[0] || "GEN").slice(0, 4);
  return `REG-${code}-2026-${String(Date.now()).slice(-5)}`;
}

function send(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
  });
  response.end(status === 204 ? "" : JSON.stringify(body));
}

async function requestBody(request) {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  return JSON.parse(raw || "{}");
}

/**
 * API-Level DB Access: Registration Service never connects to event_db directly.
 * It calls the Event Service's HTTP API to fetch event details owned by that service.
 */
async function fetchEventFromEventService(eventId) {
  const response = await fetch(`${eventServiceUrl}/events/${encodeURIComponent(eventId)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Event Service responded with ${response.status}`);
  return response.json();
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    response.end();
    return;
  }

  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === "/health" && request.method === "GET") {
      let eventServiceConnected = false;
      try {
        const eventHealthRes = await fetch(`${eventServiceUrl}/health`, { signal: AbortSignal.timeout(2000) });
        eventServiceConnected = eventHealthRes.ok;
      } catch {
        eventServiceConnected = false;
      }
      send(response, 200, {
        service: "registration",
        status: "ok",
        database: "MongoDB",
        mongoUri,
        dbName,
        eventServiceUrl,
        eventServiceConnected,
        dataAccessPattern: "API-Level Cross-Service Access (No Shared DB with Event Service)",
      });
      return;
    }

    if (url.pathname === "/registrations" && request.method === "GET") {
      const docs = await registrationsCollection.find({}).sort({ createdAt: -1 }).toArray();
      send(response, 200, docs.map(toRegistrationResponse));
      return;
    }

    if (url.pathname === "/registrations" && request.method === "POST") {
      const input = await requestBody(request);
      const validationError = validate(input);
      if (validationError) {
        send(response, 400, { error: validationError });
        return;
      }

      // API-Level DB Access: verify the event exists by calling Event Service's API
      // instead of connecting to event_db directly.
      let event;
      try {
        event = await fetchEventFromEventService(input.eventId);
      } catch (err) {
        send(response, 502, { error: `Could not reach Event Service at ${eventServiceUrl}: ${err.message}` });
        return;
      }

      if (!event) {
        send(response, 404, { error: `Event '${input.eventId}' was not found in the Event Service` });
        return;
      }

      const normalizedStudentId = input.studentId.trim();

      // Check for duplicate active registration
      const existing = await registrationsCollection.findOne({
        eventId: input.eventId,
        studentId: { $regex: new RegExp(`^${normalizedStudentId}$`, "i") },
        status: "registered",
      });

      if (existing) {
        send(response, 409, { error: "This student is already registered for this event" });
        return;
      }

      const id = randomUUID();
      const registrationDoc = {
        id,
        registrationId: makeRegistrationId(input.department),
        eventId: input.eventId,
        eventTitle: event.title,
        eventVenue: event.venue,
        eventDate: event.date,
        fullName: input.fullName.trim(),
        studentId: normalizedStudentId,
        email: input.email.trim(),
        phone: input.phone.trim(),
        department: input.department.trim(),
        year: input.year.trim(),
        teamName: input.teamName ? input.teamName.trim() : null,
        teamMembers: Array.isArray(input.teamMembers) ? input.teamMembers : [],
        status: "registered",
        createdAt: new Date().toISOString(),
      };

      try {
        await registrationsCollection.insertOne(registrationDoc);
      } catch (err) {
        if (err.code === 11000) {
          send(response, 409, { error: "This student is already registered for this event" });
          return;
        }
        throw err;
      }

      console.log(`[registration-service] created ${registrationDoc.registrationId} in MongoDB for event ${registrationDoc.eventId} (validated via Event Service API)`);

      send(response, 201, toRegistrationResponse(registrationDoc));
      return;
    }

    const match = url.pathname.match(/^\/registrations\/([^/]+)$/);
    if (match && request.method === "DELETE") {
      const regId = decodeURIComponent(match[1]);
      const result = await registrationsCollection.deleteOne({
        $or: [{ id: regId }, { registrationId: regId }],
      });

      if (result.deletedCount === 0) {
        send(response, 404, { error: "Registration not found" });
        return;
      }

      console.log(`[registration-service] cancelled/deleted ${regId} from MongoDB`);
      send(response, 204, {});
      return;
    }

    send(response, 404, { error: "Not found" });
  } catch (error) {
    console.error("[registration-service] request failed", error);
    send(response, 500, { error: "Registration Service failed to process request" });
  }
});

async function start() {
  await initDb();
  server.listen(port, () => {
    console.log(`[registration-service] listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("[registration-service] Failed to start:", err);
  process.exit(1);
});
