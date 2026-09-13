import { createServer } from "node:http";
import { MongoClient } from "mongodb";

const port = Number(process.env.EVENT_SERVICE_PORT || 4300);
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB_NAME || "event_db";

const client = new MongoClient(mongoUri);
let db;
let eventsCollection;

async function initDb() {
  await client.connect();
  db = client.db(dbName);
  eventsCollection = db.collection("events");

  try {
    await eventsCollection.createIndex({ id: 1 }, { unique: true, name: "unique_event_id" });
    await eventsCollection.createIndex({ category: 1 }, { name: "index_category" });
    await eventsCollection.createIndex({ date: 1 }, { name: "index_date" });
  } catch (err) {
    console.warn("[event-service] Note on index creation:", err.message);
  }

  console.log(`[event-service] Connected to MongoDB at ${mongoUri}`);
  console.log(`[event-service] Using database: ${dbName}, collection: events`);
}

function send(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
  });
  response.end(status === 204 ? "" : JSON.stringify(body));
}

function toEventResponse(doc) {
  const { _id, ...rest } = doc;
  return rest;
}

function byDate(a, b) {
  return a.date.localeCompare(b.date);
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,OPTIONS",
      "access-control-allow-headers": "content-type",
    });
    response.end();
    return;
  }

  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === "/health" && request.method === "GET") {
      const count = await eventsCollection.countDocuments();
      send(response, 200, {
        service: "event",
        status: "ok",
        database: "MongoDB",
        mongoUri,
        dbName,
        eventsCount: count,
      });
      return;
    }

    // GET /events?category=&search=&status=
    if (url.pathname === "/events" && request.method === "GET") {
      const category = url.searchParams.get("category");
      const search = url.searchParams.get("search")?.trim().toLowerCase();
      const status = url.searchParams.get("status");

      const filter = {};
      if (category && category !== "All") filter.category = category;
      if (status) filter.status = status;

      let docs = await eventsCollection.find(filter).toArray();

      if (search) {
        docs = docs.filter((event) =>
          [event.title, event.subtitle, event.category, event.department, event.organizer, event.venue]
            .join(" ")
            .toLowerCase()
            .includes(search),
        );
      }

      docs.sort(byDate);
      send(response, 200, docs.map(toEventResponse));
      return;
    }

    // GET /events/:id — used by Registration Service for API-level cross-service lookups
    const match = url.pathname.match(/^\/events\/([^/]+)$/);
    if (match && request.method === "GET") {
      const eventId = decodeURIComponent(match[1]);
      const doc = await eventsCollection.findOne({ id: eventId });
      if (!doc) {
        send(response, 404, { error: "Event not found" });
        return;
      }
      send(response, 200, toEventResponse(doc));
      return;
    }

    send(response, 404, { error: "Not found" });
  } catch (error) {
    console.error("[event-service] request failed", error);
    send(response, 500, { error: "Event Service failed to process request" });
  }
});

async function start() {
  await initDb();
  server.listen(port, () => {
    console.log(`[event-service] listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("[event-service] Failed to start:", err);
  process.exit(1);
});
