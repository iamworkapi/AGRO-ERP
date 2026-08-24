// Seeds three ready-to-use login accounts so the app is immediately testable
// after `npm install` + a real MONGODB_URI.
// Uses findOneAndUpdate(upsert) so re-running replaces stale demo accounts
// with the current defaults - credentials never drift between environments.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/modules/users/models/User.js";
import { ROLES } from "../src/modules/common/constants/roles.js";

const DEFAULT_USERS = [
  {
    role: ROLES.SUPER_ADMIN,
    fullName: "Super Admin",
    email: "iamworkapi@gmail.com",
    phone: "9891140379",
    password: "admin12",
  },
  {
    role: ROLES.WAREHOUSE_ADMIN,
    fullName: "Warehouse Admin",
    email: "admin@pralli.com",
    phone: "9999999998",
    password: "admin@123",
  },
  {
    role: ROLES.SUPERVISOR,
    fullName: "Supervisor",
    email: "supervisor@pralli.com",
    phone: "8888888888",
    password: "supervisor12",
  },
];

async function seedOne(user) {
  const passwordHash = await User.hashPassword(user.password);
  await User.findOneAndUpdate(
    { $or: [{ email: user.email }, { phone: user.phone }] },
    { fullName: user.fullName, email: user.email.toLowerCase(), phone: user.phone, passwordHash, role: user.role, status: "active" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`  - ${user.role}: ${user.email} / ${user.phone} / ${user.password}`);
}

export async function seedDefaultUsersIfNeeded() {
  console.log("Seeding default login accounts...");
  for (const u of DEFAULT_USERS) {
    await seedOne(u);
  }
}

async function main() {
  await connectDB();
  await seedDefaultUsersIfNeeded();
  console.log("Done. All accounts are active immediately - no approval step needed.");
}

if (process.argv[1]?.includes("seedDefaultUsers.js")) {
  main()
    .catch((err) => {
      console.error("Failed to seed default users:", err.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

