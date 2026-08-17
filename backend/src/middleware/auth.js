import { User } from "../models/User.js";
import { readAccessTokenFromRequest, verifyAccessToken } from "../utils/tokens.js";

export async function requireAuth(req, res, next) {
  try {
    const token = readAccessTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const payload = verifyAccessToken(token);
    if (!payload?.sub) {
      return res.status(401).json({ error: "Invalid authentication token." });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed." });
  }
}
