import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { MongoClient } from "mongodb";

const source = resolve(process.argv[2] || "./registration-service/localstorage-export.json");
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB_NAME || "registration_db";

const input = JSON.parse(await readFile(source, "utf8"));
const registrations = Array.isArray(input) ? input : input["campusly.registrations"];
if (!Array.isArray(registrations)) throw new Error("Expected an array or campusly.registrations array");

const client = new MongoClient(mongoUri);
await client.connect();
const db = client.db(dbName);
const collection = db.collection("registrations");

let added = 0;
let existingCount = 0;

for (const item of registrations) {
  const filter = item.id ? { id: item.id } : { registrationId: item.registrationId };
  const doc = {
    id: item.id,
    registrationId: item.registrationId,
    eventId: item.eventId,
    fullName: item.fullName || "",
    studentId: item.studentId || "",
    email: item.email || "",
    phone: item.phone || "",
    department: item.department || "",
    year: item.year || "",
    teamName: item.teamName || null,
    teamMembers: item.teamMembers || [],
    status: item.status || "registered",
    createdAt: item.createdAt || new Date().toISOString(),
  };

  const result = await collection.updateOne(
    filter,
    { $setOnInsert: doc },
    { upsert: true },
  );

  if (result.upsertedCount > 0) {
    added++;
  } else {
    existingCount++;
  }
}

await client.close();
console.log(`MongoDB Migration complete: ${added} added, ${existingCount} already present.`);

