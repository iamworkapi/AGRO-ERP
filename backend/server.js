import { app } from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import { seedDefaultUsersIfNeeded } from "./scripts/seedDefaultUsers.js";

async function start() {
  try {
    await connectDB();
    await seedDefaultUsersIfNeeded();
  } catch (err) {
    console.error("Database initialization warning:", err.message);
  }

  const server = app.listen(env.port, () => {
    console.log(`🚀 AgriPrali ERP backend listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  server.on("error", (err) => {
    console.error("Server error:", err.message);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
});
