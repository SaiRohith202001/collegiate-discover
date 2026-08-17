import bcrypt from "bcryptjs";
import express from "express";
import rateLimit from "express-rate-limit";
import { User } from "../models/User.js";
import {
  clearAuthCookies,
  getRefreshExpiryDate,
  hashToken,
  readRefreshTokenFromRequest,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { loginSchema, signupSchema } from "../utils/validators.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

const toInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

const issueAuth = async (res, user) => {
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  const refreshHash = hashToken(refreshToken);

  user.refreshTokens = [
    ...(user.refreshTokens ?? []).filter((token) => token.expiresAt > new Date()),
    { tokenHash: refreshHash, expiresAt: getRefreshExpiryDate() },
  ];
  await user.save();

  setAuthCookies(res, accessToken, refreshToken);
};

router.post("/signup", async (req, res, next) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "Invalid signup input." });
    }

    const payload = parsed.data;
    const existing = await User.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = await User.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash,
      studentId: payload.studentId,
      department: payload.department,
      year: payload.year,
      phone: payload.phone,
      avatarInitials: toInitials(payload.name),
      savedEventIds: [],
      refreshTokens: [],
    });

    await issueAuth(res, user);
    return res.status(201).json({ user: user.toPublicProfile() });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message ?? "Invalid login input." });
    }

    const payload = parsed.data;
    const user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const passwordValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    await issueAuth(res, user);
    return res.status(200).json({ user: user.toPublicProfile() });
  } catch (error) {
    return next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = readRefreshTokenFromRequest(req);
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token missing." });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload?.sub) {
      return res.status(401).json({ error: "Invalid refresh token." });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    const refreshHash = hashToken(refreshToken);
    const hasToken = (user.refreshTokens ?? []).some(
      (token) => token.tokenHash === refreshHash && token.expiresAt > new Date(),
    );
    if (!hasToken) {
      return res.status(401).json({ error: "Refresh token invalid or expired." });
    }

    user.refreshTokens = (user.refreshTokens ?? []).filter(
      (token) => token.tokenHash !== refreshHash && token.expiresAt > new Date(),
    );
    await issueAuth(res, user);
    return res.status(200).json({ user: user.toPublicProfile() });
  } catch (error) {
    return res.status(401).json({ error: "Refresh failed." });
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = readRefreshTokenFromRequest(req);
    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        if (payload?.sub) {
          const user = await User.findById(payload.sub);
          if (user) {
            const refreshHash = hashToken(refreshToken);
            user.refreshTokens = (user.refreshTokens ?? []).filter(
              (token) => token.tokenHash !== refreshHash,
            );
            await user.save();
          }
        }
      } catch {
        // Intentionally ignore invalid refresh token during logout.
      }
    }

    clearAuthCookies(res);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.status(200).json({ user: req.user.toPublicProfile() });
});

export { router as authRouter };
