// One-off bootstrap: the /auth/register endpoint only allows self-signup as
// Warehouse Admin or Supervisor (see validators/auth.validator.js) so the
// Super Admin role can never be granted through a public form. Run this once
// per environment: `npm run create-super-admin` (reads SUPER_ADMIN_* from
// backend/.env).
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { ROLES } from "../src/constants/roles.js";

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const fullName = process.env.SUPER_ADMIN_NAME || "Super Admin";

  if (!email || !password) {
    throw new Error("Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in backend/.env before running this script.");
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error(`An account with email ${email} already exists (role: ${existing.role}, status: ${existing.status}).`);
  }

  const passwordHash = await User.hashPassword(password);
  await User.create({ fullName, email: email.toLowerCase(), passwordHash, role: ROLES.SUPER_ADMIN, status: "active" });

  console.log(`Super Admin created: ${email}`);
}

main()
  .catch((err) => {
    console.error("Failed to create Super Admin:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
