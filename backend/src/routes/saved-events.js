import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { savedEventSchema } from "../utils/validators.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    return res.status(200).json({ eventIds: req.user.savedEventIds ?? [] });
  } catch (error) {
    return next(error);
  }
});

router.post("/toggle", async (req, res, next) => {
  try {
    const parsed = savedEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "Invalid event id." });
    }

    const { eventId } = parsed.data;
    const current = new Set(req.user.savedEventIds ?? []);
    if (current.has(eventId)) {
      current.delete(eventId);
    } else {
      current.add(eventId);
    }

    req.user.savedEventIds = Array.from(current);
    await req.user.save();
    return res.status(200).json({ eventIds: req.user.savedEventIds });
  } catch (error) {
    return next(error);
  }
});

export { router as savedEventsRouter };
