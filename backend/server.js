import { app } from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";
import { seedDefaultUsersIfNeeded } from "./scripts/seedDefaultUsers.js";

async function start() {
  try {
    await connectDB();
    await seedDefaultUsersIfNeeded();
  } catch (err) {
    console.error("FATAL: Database initialization failed — server will NOT start.", err.message);
    process.exit(1);
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
