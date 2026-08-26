// Seeds default login accounts, assigns Rambabu as Supervisor for Bettiah Hub,
// and ensures Bettiah Hub has an active weighbridge machine.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/modules/users/models/User.js";
import { Warehouse } from "../src/modules/warehouses/models/Warehouse.js";
import { WeightMachine } from "../src/modules/weighment/models/WeightMachine.js";
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
    fullName: "Rambabu",
    email: "rambabu@pralli.com",
    phone: "8888888888",
    password: "supervisor12",
  },
  {
    role: ROLES.SUPERVISOR,
    fullName: "Rambabu",
    email: "supervisor@pralli.com",
    phone: "8888888889",
    password: "supervisor12",
  },
];

async function seedUsers() {
  const seededUsers = {};
  for (const user of DEFAULT_USERS) {
    const passwordHash = await User.hashPassword(user.password);
    const doc = await User.findOneAndUpdate(
      { $or: [{ email: user.email.toLowerCase() }, { phone: user.phone }] },
      { fullName: user.fullName, email: user.email.toLowerCase(), phone: user.phone, passwordHash, role: user.role, status: "active" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    seededUsers[user.email.toLowerCase()] = doc;
    console.log(`  - ${user.role}: ${user.email} / ${user.phone} / ${user.password}`);
  }
  return seededUsers;
}

async function seedBettiahWarehouse(users) {
  const rambabu = users["rambabu@pralli.com"] || users["supervisor@pralli.com"];
  const admin = users["admin@pralli.com"];

  let bettiahWh = await Warehouse.findOne({
    $or: [{ code: "WH-BTT-01" }, { name: { $regex: /bettiah|betaih/i } }],
  });

  if (!bettiahWh) {
    bettiahWh = await Warehouse.create({
      name: "Bettiah Hub",
      code: "WH-BTT-01",
      commodity: "Biomass / PRALLI",
      address: "Bettiah, West Champaran, Bihar - 845438",
      companyName: "Kusumganga Agro Solutions Pvt. Ltd.",
      supervisor: rambabu?._id,
      admin: admin?._id,
      status: "active",
    });
    console.log("  - Created Bettiah Warehouse Hub (WH-BTT-01) assigned to Supervisor Rambabu.");
  } else {
    bettiahWh.name = "Bettiah Hub";
    bettiahWh.supervisor = rambabu?._id;
    if (!bettiahWh.admin) bettiahWh.admin = admin?._id;
    bettiahWh.status = "active";
    await bettiahWh.save();
    console.log("  - Updated Bettiah Warehouse Hub assigned to Supervisor Rambabu.");
  }

  // Ensure an active weight machine exists for Bettiah Hub
  const existingMachine = await WeightMachine.findOne({ warehouse: bettiahWh._id });
  if (!existingMachine) {
    await WeightMachine.create({
      warehouse: bettiahWh._id,
      machineCode: "WM-BTT-01",
      make: "Avery Weigh-Tronix",
      model: "ZM510 Precision Indicator",
      capacityKg: 60000,
      status: "active",
      installedOn: new Date(),
    });
    console.log("  - Registered active Weighbridge WM-BTT-01 for Bettiah Hub.");
  }
}

export async function seedDefaultUsersIfNeeded() {
  console.log("Seeding default login accounts and warehouse assignments...");
  const users = await seedUsers();
  await seedBettiahWarehouse(users);
}

async function main() {
  await connectDB();
  await seedDefaultUsersIfNeeded();
  console.log("Done. Rambabu assigned as Supervisor for Bettiah Hub.");
}

if (process.argv[1]?.includes("seedDefaultUsers.js")) {
  main()
    .catch((err) => {
      console.error("Failed to seed default users:", err.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}
