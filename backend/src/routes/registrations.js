import express from "express";
import QRCode from "qrcode";
import { requireAuth } from "../middleware/auth.js";
import { Registration } from "../models/Registration.js";
import { registrationSchema } from "../utils/validators.js";

const router = express.Router();

router.use(requireAuth);

const makeRegistrationId = (department) => {
  const code = (department.match(/[A-Z]{2,4}/)?.[0] ?? "GEN").slice(0, 4);
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `REG-${code}-2026-0${suffix}`;
};

const serializeRegistration = (doc) => ({
  id: doc._id.toString(),
  registrationId: doc.registrationId,
  eventId: doc.eventId,
  fullName: doc.fullName,
  studentId: doc.studentId,
  email: doc.email,
  phone: doc.phone,
  department: doc.department,
  year: doc.year,
  teamName: doc.teamName || undefined,
  teamMembers: doc.teamMembers ?? [],
  status: doc.status,
  createdAt: new Date(doc.createdAt).toISOString(),
  qrCode: doc.qrCode ?? "",
  qrScanned: doc.qrScanned ?? false,
  scannedAt: doc.scannedAt ? new Date(doc.scannedAt).toISOString() : null,
});

router.get("/", async (req, res, next) => {
  try {
    const docs = await Registration.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ registrations: docs.map(serializeRegistration) });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = registrationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "Invalid registration payload." });
    }

    const payload = parsed.data;
    const registrationId = makeRegistrationId(payload.department);
    const qrCode = await QRCode.toDataURL(registrationId, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    const doc = await Registration.create({
      userId: req.user._id,
      registrationId,
      eventId: payload.eventId,
      fullName: payload.fullName,
      studentId: payload.studentId,
      email: payload.email.toLowerCase(),
      phone: `+91${payload.phone}`,
      department: payload.department,
      year: payload.year,
      teamName: payload.teamName || "",
      teamMembers: payload.teamMembers ?? [],
      status: "registered",
      qrCode,
      qrScanned: false,
      scannedAt: null,
    });

    return res.status(201).json({ registration: serializeRegistration(doc) });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await Registration.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ error: "Registration not found." });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export { router as registrationsRouter };
