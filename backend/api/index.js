import "dotenv/config";
import { app } from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { seedDefaultUsersIfNeeded } from "../scripts/seedDefaultUsers.js";

let booted = false;
async function ensureReady() {
  if (booted) return;
  await connectDB();
  await seedDefaultUsersIfNeeded();
  booted = true;
}

export default async function handler(req, res) {
  await ensureReady();
  return app(req, res, () => {});
}
