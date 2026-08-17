/**
 * Seed an admin user into MongoDB.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Override defaults via environment variables:
 *   ADMIN_EMAIL    (default: admin@campusly.com)
 *   ADMIN_PASSWORD (default: Admin@123  — must meet the password policy)
 *   MONGODB_URI    (default: from .env)
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";

const MONGO_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/campus_discover";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "admin@campusly.com").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin@123";

async function run() {
  console.log(`Connecting to MongoDB: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`✅ Promoted existing user "${ADMIN_EMAIL}" to admin.`);
    } else {
      console.log(`ℹ️  Admin user "${ADMIN_EMAIL}" already exists — no changes needed.`);
    }
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    name: "Admin",
    email: ADMIN_EMAIL,
    passwordHash,
    studentId: "ADMIN-001",
    department: "Administration",
    year: "N/A",
    phone: "0000000000",
    avatarInitials: "AD",
    role: "admin",
    savedEventIds: [],
    refreshTokens: [],
  });

  console.log(`✅ Admin user created:`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`\n⚠️  Change the password after first login!`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
