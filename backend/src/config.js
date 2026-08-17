import dotenv from "dotenv";

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.AUTH_SERVER_PORT, 5001),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://localhost:27017/campus_discover",
  clientOrigins: (process.env.CLIENT_ORIGIN ?? "http://localhost:8081")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? "7d",
};

export const isProduction = config.nodeEnv === "production";

if (!config.jwtAccessSecret || !config.jwtRefreshSecret) {
  throw new Error(
    "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be defined in environment variables.",
  );
}
