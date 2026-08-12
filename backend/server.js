import { app } from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error("Database initialization warning:", err.message);
  }

  app.listen(env.port, () => {
    console.log(`🚀 AgriPrali ERP backend listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
});

