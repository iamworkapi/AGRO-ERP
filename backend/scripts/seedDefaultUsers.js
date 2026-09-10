// Seeds only the Super Admin account on first run.
// Warehouse Admins and Supervisors are created by the Super Admin
// via the frontend UI.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/modules/users/models/User.js";
import { ROLES } from "../src/modules/common/constants/roles.js";

async function seedSuperAdmin() {
  const existing = await User.findOne({ email: "iamworkapi@gmail.com" });
  if (existing) {
    // Always reset the super admin password to the current seed value
    existing.passwordHash = await User.hashPassword("SuperAdmin@2026");
    if (existing.status !== "active" || existing.role !== ROLES.SUPER_ADMIN) {
      existing.status = "active";
      existing.role = ROLES.SUPER_ADMIN;
    }
    await existing.save();
    return;
  }

  const passwordHash = await User.hashPassword("SuperAdmin@2026");
  await User.create({
    fullName: "Super Admin",
    email: "iamworkapi@gmail.com",
    phone: "9891140379",
    passwordHash,
    role: ROLES.SUPER_ADMIN,
    status: "active",
  });
}

export async function seedDefaultUsersIfNeeded() {
  console.log("Seeding Super Admin...");
  await seedSuperAdmin();
  console.log("  - Super Admin: iamworkapi@gmail.com / 9891140379 / SuperAdmin@2026");
}

async function main() {
  await connectDB();
  await seedDefaultUsersIfNeeded();
}

if (process.argv[1]?.includes("seedDefaultUsers.js")) {
  main()
    .catch((err) => {
      console.error("Failed to seed:", err.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}
