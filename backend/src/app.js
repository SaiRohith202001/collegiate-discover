import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { registrationsRouter } from "./routes/registrations.js";
import { savedEventsRouter } from "./routes/saved-events.js";

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (config.clientOrigins.includes(origin)) {
    return true;
  }

  if (config.nodeEnv !== "production") {
    return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  }

  return false;
}

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/registrations", registrationsRouter);
  app.use("/api/saved-events", savedEventsRouter);
  app.use("/api/admin", adminRouter);

  app.use((error, _req, res, _next) => {
    console.error(error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    res.status(500).json({ error: message });
  });

  return app;
}
