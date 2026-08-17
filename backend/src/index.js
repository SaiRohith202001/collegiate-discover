import { createApp } from "./app.js";
import { config } from "./config.js";
import { connectDatabase } from "./db.js";

async function start() {
  await connectDatabase();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Auth API listening at http://localhost:${config.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
