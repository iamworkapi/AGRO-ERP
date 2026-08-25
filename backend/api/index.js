import "dotenv/config";
import { app } from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { seedDefaultUsersIfNeeded } from "../scripts/seedDefaultUsers.js";

let readyPromise = null;
async function ensureReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await connectDB();
      await seedDefaultUsersIfNeeded().catch((e) => console.warn("Seed warning:", e.message));
    })();
  }
  return readyPromise;
}

export default async function handler(req, res) {
  try {
    await ensureReady();
  } catch (err) {
    console.error("Handler initialization error:", err);
  }
  return app(req, res);
}
