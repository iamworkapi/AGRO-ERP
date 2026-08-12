// Seeds one ready-to-use login per role so the app is testable immediately
// after `npm install` + a real MONGODB_URI, without hand-registering and
// approving accounts first. Idempotent - safe to re-run, existing accounts
// are left untouched and reported, not overwritten.
//
// DEV/DEMO ONLY: these are well-known default passwords. Never run this
// script against a production database, and rotate/delete these accounts
// before going anywhere near real data.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { ROLES } from "../src/constants/roles.js";

// Identifiers/passwords here match the "Quick Demo Login Roles" buttons on
// the frontend's Login page exactly - if you change the defaults on one
// side, change them on the other too.
const DEFAULT_USERS = [
  {
    role: ROLES.SUPER_ADMIN,
    fullName: process.env.SUPER_ADMIN_NAME || "Super Admin",
    email: (process.env.SUPER_ADMIN_EMAIL || "superadmin@pralli.com").toLowerCase(),
    password: process.env.SUPER_ADMIN_PASSWORD || "Password@123",
  },
  {
    role: ROLES.WAREHOUSE_ADMIN,
    fullName: process.env.DEFAULT_ADMIN_NAME || "Warehouse Admin",
    email: (process.env.DEFAULT_ADMIN_EMAIL || "admin@pralli.com").toLowerCase(),
    password: process.env.DEFAULT_ADMIN_PASSWORD || "Password@123",
  },
  {
    role: ROLES.SUPERVISOR,
    fullName: process.env.DEFAULT_SUPERVISOR_NAME || "Warehouse Supervisor",
    email: (process.env.DEFAULT_SUPERVISOR_EMAIL || "supervisor@pralli.com").toLowerCase(),
    password: process.env.DEFAULT_SUPERVISOR_PASSWORD || "Password@123",
  },
];

async function seedOne({ role, fullName, email, phone, password }) {
  const lookup = email ? { email } : { phone };
  const existing = await User.findOne(lookup);
  if (existing) {
    console.log(`  - skip ${role}: account already exists (${email || phone}, status: ${existing.status})`);
    return;
  }

  const passwordHash = await User.hashPassword(password);
  await User.create({ fullName, email, phone, passwordHash, role, status: "active" });
  console.log(`  - created ${role}: ${email || phone} / ${password}`);
}

export async function seedDefaultUsersIfNeeded() {
  console.log("Checking default login accounts (dev/demo only)...");
  for (const u of DEFAULT_USERS) {
    await seedOne(u);
  }
}

async function main() {
  await connectDB();
  await seedDefaultUsersIfNeeded();
  console.log("Done. These accounts are active immediately - no approval step needed.");
}

if (process.argv[1]?.includes("seedDefaultUsers.js")) {
  main()
    .catch((err) => {
      console.error("Failed to seed default users:", err.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

