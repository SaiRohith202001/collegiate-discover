import crypto from "crypto";
import jwt from "jsonwebtoken";
import ms from "ms";
import { config, isProduction } from "../config.js";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

const parseExpiryDate = (ttl) => {
  const ttlMs = ms(ttl);
  if (typeof ttlMs !== "number") {
    throw new Error(`Invalid token TTL value: ${ttl}`);
  }
  return new Date(Date.now() + ttlMs);
};

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId, type: "access" }, config.jwtAccessSecret, {
    expiresIn: config.accessTokenTtl,
  });
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: "refresh" }, config.jwtRefreshSecret, {
    expiresIn: config.refreshTokenTtl,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtAccessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}

export function getRefreshExpiryDate() {
  return parseExpiryDate(config.refreshTokenTtl);
}

export function setAuthCookies(res, accessToken, refreshToken) {
  const shared = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  };

  res.cookie(ACCESS_COOKIE, accessToken, {
    ...shared,
    maxAge: ms(config.accessTokenTtl),
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...shared,
    maxAge: ms(config.refreshTokenTtl),
  });
}

export function clearAuthCookies(res) {
  const shared = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  };
  res.clearCookie(ACCESS_COOKIE, shared);
  res.clearCookie(REFRESH_COOKIE, shared);
}

export function readAccessTokenFromRequest(req) {
  const header = req.get("Authorization");
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return req.cookies?.[ACCESS_COOKIE] ?? "";
}

export function readRefreshTokenFromRequest(req) {
  return req.cookies?.[REFRESH_COOKIE] ?? "";
}
