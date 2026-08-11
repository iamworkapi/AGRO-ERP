import mongoose from "mongoose";
import { Warehouse } from "../models/Warehouse.js";
import { User } from "../models/User.js";
import { Employee } from "../models/Employee.js";
import { StockEntry } from "../models/StockEntry.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { recordAudit } from "./audit.service.js";
import { getOwnWarehouseId } from "./warehouseScope.service.js";

const STAFF_FIELDS = "fullName phone email";

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
  await assertEligibleStaff({ adminId: payload.adminId, supervisorId: payload.supervisorId });

  try {
    const warehouse = await Warehouse.create({
      name: payload.name,
      commodity: payload.commodity,
      address: payload.address,
      gpsLat: payload.gpsLat,
      gpsLng: payload.gpsLng,
      admin: payload.adminId,
      supervisor: payload.supervisorId,
      createdBy: actor.profile._id,
    });

    await recordAudit({ actor, action: "warehouse.create", entityType: "warehouse", entityId: warehouse._id, warehouseId: warehouse._id, metadata: { name: warehouse.name } });
    await warehouse.populate([{ path: "admin", select: STAFF_FIELDS }, { path: "supervisor", select: STAFF_FIELDS }]);
    // A brand-new warehouse can't have any employees or approved stock yet -
    // no need to run the aggregation just to learn that.
    return { ...warehouse.toJSON(), staffCount: 0, stockKg: 0 };
  } catch (error) {
    throw translateWriteError(error);
  }
}

export async function updateWarehouse(actor, id, payload) {
  await assertEligibleStaff({ adminId: payload.adminId, supervisorId: payload.supervisorId });

  const patch = {};
  if (payload.name !== undefined) patch.name = payload.name;
  if (payload.commodity !== undefined) patch.commodity = payload.commodity;
  if (payload.address !== undefined) patch.address = payload.address;
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
