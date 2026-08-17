import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Registration } from "../models/Registration.js";

const router = express.Router();

/** Only authenticated admins may call these endpoints. */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  return next();
}

router.use(requireAuth, requireAdmin);

/**
 * GET /api/admin/stats
 * Returns per-event registration counts: total, scanned, pending.
 */
router.get("/stats", async (req, res, next) => {
  try {
    const docs = await Registration.find({ status: "registered" })
      .select("eventId qrScanned")
      .lean();

    const map = new Map();
    for (const doc of docs) {
      const existing = map.get(doc.eventId) ?? { eventId: doc.eventId, total: 0, scanned: 0, pending: 0 };
      existing.total += 1;
      if (doc.qrScanned) {
        existing.scanned += 1;
      } else {
        existing.pending += 1;
      }
      map.set(doc.eventId, existing);
    }

    return res.status(200).json({ stats: Array.from(map.values()) });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/admin/scan
 * Body: { registrationId: string }
 * Marks the QR as scanned (single-use). Returns the updated registration.
 */
router.post("/scan", async (req, res, next) => {
  try {
    const { registrationId } = req.body;
    if (!registrationId || typeof registrationId !== "string") {
      return res.status(400).json({ error: "registrationId is required." });
    }

    const doc = await Registration.findOne({ registrationId: registrationId.trim(), status: "registered" });
    if (!doc) {
      return res.status(404).json({ error: "Registration not found." });
    }

    if (doc.qrScanned) {
      return res.status(409).json({
        error: "QR already scanned — entry denied.",
        scannedAt: doc.scannedAt ? new Date(doc.scannedAt).toISOString() : null,
      });
    }

    doc.qrScanned = true;
    doc.scannedAt = new Date();
    await doc.save();

    return res.status(200).json({
      message: "Entry granted.",
      registrationId: doc.registrationId,
      fullName: doc.fullName,
      eventId: doc.eventId,
      scannedAt: doc.scannedAt.toISOString(),
    });
  } catch (error) {
    return next(error);
  }
});

export { router as adminRouter };
