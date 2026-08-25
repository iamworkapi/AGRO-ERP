import mongoose from "mongoose";
import { Warehouse } from "../models/Warehouse.js";
import { User } from "../../users/models/User.js";
import { Employee } from "../../employees/models/Employee.js";
import { StockEntry } from "../../stock/models/StockEntry.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { getOwnWarehouseId } from "./warehouseScope.service.js";
import { strongPassword } from "../../auth/validators/auth.validator.js";

function validateStaffPassword(password, label) {
  // Self-registration enforces strongPassword at the validator layer; the
  // warehouse-create flow creates profiles inline, so it has to enforce
  // the same policy itself - otherwise a Super Admin could mint a
  // Supervisor with "abc" and then have no way to reject it.
  const result = strongPassword.safeParse(password);
  if (!result.success) {
    const message = result.error.errors[0]?.message || `Invalid ${label} password.`;
    throw ApiError.badRequest(`${label} password: ${message}`);
  }
}

const STAFF_FIELDS = "fullName phone email avatarUrl address role status";

// Attaches staffCount (active employees) and stockKg (sum of approved
// stock-entry net weight) to each warehouse - two cheap aggregate queries
// covering every warehouse in the result set, instead of an N+1 query per
// row. Returns plain objects (not Mongoose documents) since the computed
// fields don't belong on the schema itself.
async function withStaffAndStockTotals(warehouseDocs) {
  const warehouses = warehouseDocs.map((w) => w.toJSON());
  if (warehouses.length === 0) return warehouses;

  const ids = warehouses.map((w) => w.id);

  const [staffCounts, stockTotals] = await Promise.all([
    Employee.aggregate([
      { $match: { warehouse: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) }, employmentStatus: "active" } },
      { $group: { _id: "$warehouse", count: { $sum: 1 } } },
    ]),
    StockEntry.aggregate([
      { $match: { warehouse: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) }, status: "approved" } },
      { $group: { _id: "$warehouse", totalKg: { $sum: "$netWeightKg" } } },
    ]),
  ]);

  const staffByWarehouse = new Map(staffCounts.map((row) => [row._id.toString(), row.count]));
  const stockByWarehouse = new Map(stockTotals.map((row) => [row._id.toString(), row.totalKg]));

  return warehouses.map((w) => ({
    ...w,
    staffCount: staffByWarehouse.get(w.id) ?? 0,
    stockKg: stockByWarehouse.get(w.id) ?? 0,
  }));
}

function translateWriteError(error) {
  if (error.code === 11000) {
    const key = Object.keys(error.keyPattern || {})[0];
    if (key === "admin") return ApiError.conflict("This Warehouse Admin is already assigned to another warehouse.");
    if (key === "supervisor") return ApiError.conflict("This Warehouse Supervisor is already assigned to another warehouse.");
    return ApiError.conflict("A warehouse with conflicting details already exists.");
  }
  if (error.name === "ValidationError") return ApiError.badRequest(error.message);
  return error;
}

// Validates that adminId/supervisorId (if provided) reference active
// profiles with the correct role, and are distinct from each other -
// Mongo has no cross-collection triggers, so this replaces what a Postgres
// trigger would have enforced.
async function assertEligibleStaff({ adminId, supervisorId }) {
  if (adminId) {
    const admin = await User.findById(adminId).select("role status");
    if (!admin) throw ApiError.badRequest("adminId does not reference an existing profile.");
    if (admin.role !== ROLES.WAREHOUSE_ADMIN) throw ApiError.badRequest("The selected admin must have the Warehouse Admin role.");
    if (admin.status !== "active") throw ApiError.badRequest("The selected admin must be an active, approved account.");
  }
  if (supervisorId) {
    const supervisor = await User.findById(supervisorId).select("role status");
    if (!supervisor) throw ApiError.badRequest("supervisorId does not reference an existing profile.");
    if (supervisor.role !== ROLES.SUPERVISOR) throw ApiError.badRequest("The selected supervisor must have the Supervisor role.");
    if (supervisor.status !== "active") throw ApiError.badRequest("The selected supervisor must be an active, approved account.");
  }
  if (adminId && supervisorId && String(adminId) === String(supervisorId)) {
    throw ApiError.badRequest("A warehouse's admin and supervisor must be different people.");
  }
}

export async function listWarehouses(actor) {
  const filter = {};
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    const ownWarehouseId = await getOwnWarehouseId(actor.profile);
    filter._id = ownWarehouseId ?? null;
  }

  const warehouses = await Warehouse.find(filter)
    .sort({ createdAt: -1 })
    .populate("admin", STAFF_FIELDS)
    .populate("supervisor", STAFF_FIELDS);

  return withStaffAndStockTotals(warehouses);
}

export async function getWarehouseById(actor, id) {
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    const ownWarehouseId = await getOwnWarehouseId(actor.profile);
    if (ownWarehouseId !== id) throw ApiError.forbidden("You can only view your own warehouse.");
  }

  const warehouse = await Warehouse.findById(id).populate("admin", STAFF_FIELDS).populate("supervisor", STAFF_FIELDS);
  if (!warehouse) throw ApiError.notFound("Warehouse not found.");

  const [enriched] = await withStaffAndStockTotals([warehouse]);
  return enriched;
}

// Profiles eligible to be picked in the Create Warehouse form: correct
// role, approved+active, and not already running another warehouse.
async function listAvailableStaff(role, field) {
  const assignedIds = await Warehouse.find({ [field]: { $ne: null } }).distinct(field);
  return User.find({ role, status: "active", _id: { $nin: assignedIds } }).select(STAFF_FIELDS);
}

export const listAvailableAdmins = () => listAvailableStaff(ROLES.WAREHOUSE_ADMIN, "admin");
export const listAvailableSupervisors = () => listAvailableStaff(ROLES.SUPERVISOR, "supervisor");

export async function createWarehouse(actor, payload) {
  let finalAdminId = payload.adminId;
  let finalSupervisorId = payload.supervisorId;

  // 1. Create New Admin Profile if requested
  if (!finalAdminId && payload.newAdmin?.fullName) {
    const adminPassword = payload.newAdmin.password;
    if (!adminPassword) {
      throw ApiError.badRequest("A password is required when creating a new Warehouse Admin.");
    }
    validateStaffPassword(adminPassword, "Warehouse Admin");
    const passwordHash = await User.hashPassword(adminPassword);
    const createdAdmin = await User.create({
      fullName: payload.newAdmin.fullName,
      email: (payload.newAdmin.email || `admin.${Date.now()}@kusumganga.com`).toLowerCase(),
      phone: payload.newAdmin.phone || `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      passwordHash,
      role: ROLES.WAREHOUSE_ADMIN,
      status: "active",
    });
    finalAdminId = createdAdmin._id;
  }

  // 2. Create New Supervisor Profile if requested
  if (!finalSupervisorId && payload.newSupervisor?.fullName) {
    const supervisorPassword = payload.newSupervisor.password;
    if (!supervisorPassword) {
      throw ApiError.badRequest("A password is required when creating a new Warehouse Supervisor.");
    }
    validateStaffPassword(supervisorPassword, "Warehouse Supervisor");
    const passwordHash = await User.hashPassword(supervisorPassword);
    const createdSupervisor = await User.create({
      fullName: payload.newSupervisor.fullName,
      email: (payload.newSupervisor.email || `sup.${Date.now()}@kusumganga.com`).toLowerCase(),
      phone: payload.newSupervisor.phone || `97${Math.floor(10000000 + Math.random() * 90000000)}`,
      passwordHash,
      role: ROLES.SUPERVISOR,
      status: "active",
    });
    finalSupervisorId = createdSupervisor._id;
  }

  if (finalAdminId || finalSupervisorId) {
    await assertEligibleStaff({ adminId: finalAdminId, supervisorId: finalSupervisorId });
  }

  try {
    const warehouse = await Warehouse.create({
      name: payload.name,
      companyName: payload.companyName || "Kusumganga Agro Solutions Pvt. Ltd.",
      commodity: payload.commodity,
      address: payload.address,
      gstin: payload.gstin || "09AALCK4355J1Z2",
      pan: payload.pan || "AALCK4355J",
      contactPerson: payload.contactPerson || "Mr. Jagdeep Singh",
      contactPhone: payload.contactPhone || "7055000315",
      email: payload.email || "kusumganga5@gmail.com",
      helpDeskPhone: payload.helpDeskPhone || "7905525983",
      gpsLat: payload.gpsLat,
      gpsLng: payload.gpsLng,
      admin: finalAdminId || null,
      supervisor: finalSupervisorId || null,
      createdBy: actor.profile._id,
    });

    await recordAudit({ actor, action: "warehouse.create", entityType: "warehouse", entityId: warehouse._id, warehouseId: warehouse._id, metadata: { name: warehouse.name } });
    await warehouse.populate([{ path: "admin", select: STAFF_FIELDS }, { path: "supervisor", select: STAFF_FIELDS }]);
    return { ...warehouse.toJSON(), staffCount: 0, stockKg: 0 };
  } catch (error) {
    throw translateWriteError(error);
  }
}

export async function updateWarehouse(actor, id, payload) {
  await assertEligibleStaff({ adminId: payload.adminId, supervisorId: payload.supervisorId });

  const patch = {};
  if (payload.name !== undefined) patch.name = payload.name;
  if (payload.companyName !== undefined) patch.companyName = payload.companyName;
  if (payload.commodity !== undefined) patch.commodity = payload.commodity;
  if (payload.address !== undefined) patch.address = payload.address;
  if (payload.gstin !== undefined) patch.gstin = payload.gstin;
  if (payload.pan !== undefined) patch.pan = payload.pan;
  if (payload.contactPerson !== undefined) patch.contactPerson = payload.contactPerson;
  if (payload.contactPhone !== undefined) patch.contactPhone = payload.contactPhone;
  if (payload.email !== undefined) patch.email = payload.email;
  if (payload.helpDeskPhone !== undefined) patch.helpDeskPhone = payload.helpDeskPhone;
  if (payload.gpsLat !== undefined) patch.gpsLat = payload.gpsLat;
  if (payload.gpsLng !== undefined) patch.gpsLng = payload.gpsLng;
  if (payload.adminId !== undefined) patch.admin = payload.adminId;
  if (payload.supervisorId !== undefined) patch.supervisor = payload.supervisorId;
  if (payload.status !== undefined) patch.status = payload.status;

  try {
    const warehouse = await Warehouse.findByIdAndUpdate(id, patch, { new: true, runValidators: true })
      .populate("admin", STAFF_FIELDS)
      .populate("supervisor", STAFF_FIELDS);
    if (!warehouse) throw ApiError.notFound("Warehouse not found.");

    await recordAudit({ actor, action: "warehouse.update", entityType: "warehouse", entityId: id, warehouseId: id, metadata: patch });
    const [enriched] = await withStaffAndStockTotals([warehouse]);
    return enriched;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw translateWriteError(error);
  }
}

// Soft delete: deactivate and free up the admin/supervisor so they can be
// assigned elsewhere, but keep the document (and its history) for audit
// purposes.
export async function deactivateWarehouse(actor, id) {
  const warehouse = await Warehouse.findByIdAndUpdate(
    id,
    { status: "inactive", admin: null, supervisor: null },
    { new: true }
  ).select("name status");
  if (!warehouse) throw ApiError.notFound("Warehouse not found.");

  await recordAudit({ actor, action: "warehouse.deactivate", entityType: "warehouse", entityId: id, warehouseId: id });
  return warehouse;
}
