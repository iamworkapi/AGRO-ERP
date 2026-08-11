import { AttendanceRecord } from "../models/AttendanceRecord.js";
import { Employee } from "../models/Employee.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { recordAudit } from "./audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "./warehouseScope.service.js";
import { parsePagination, paginationMeta } from "../utils/pagination.js";

const POPULATE = [
  { path: "warehouse", select: "name code" },
  { path: "employee", select: "fullName employeeCode" },
];

export async function listAttendance(actor, { warehouseId, page, limit }) {
  // Super Admin with no warehouseId gets the org-wide log; everyone else is
  // always scoped to their own warehouse (see listEmployees for the same
  // pattern).
  let filter = {};
  if (actor.profile.role === ROLES.SUPER_ADMIN && !warehouseId) {
    filter = {};
  } else {
    let effectiveWarehouseId = warehouseId;
    if (actor.profile.role !== ROLES.SUPER_ADMIN) {
      effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
    }
    if (!effectiveWarehouseId) return { list: [], meta: paginationMeta({ page: 1, limit: 1, total: 0 }) };
    await assertCanAccessWarehouse(actor, effectiveWarehouseId);
    filter = { warehouse: effectiveWarehouseId };
  }

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    AttendanceRecord.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(pageSize).populate(POPULATE),
    AttendanceRecord.countDocuments(filter),
  ]);

  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

// A manual check-in/out correction - always starts 'pending' regardless of
// what the caller sends, so every entry gets a Warehouse Admin/Super Admin
// sign-off before it counts as Present (see markPresent below).
export async function createAttendanceRecord(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);

  const employee = await Employee.findById(payload.employeeId).select("warehouse");
  if (!employee) throw ApiError.notFound("Employee not found.");
  if (employee.warehouse.toString() !== payload.warehouseId) {
    throw ApiError.badRequest("That employee does not belong to this warehouse.");
  }

  try {
    const record = await AttendanceRecord.create({
      warehouse: payload.warehouseId,
      employee: payload.employeeId,
      date: payload.date,
      checkInTime: payload.checkInTime,
      checkOutTime: payload.checkOutTime,
      reason: payload.reason,
      status: "pending",
      recordedBy: actor.profile._id,
    });
    await record.populate(POPULATE);

    await recordAudit({ actor, action: "attendance.create", entityType: "attendance_record", entityId: record._id, warehouseId: record.warehouse, metadata: { employeeId: payload.employeeId, date: payload.date } });
    return record;
  } catch (error) {
    if (error.code === 11000) throw ApiError.conflict("An attendance record for this employee on this date already exists.");
    if (error.name === "ValidationError") throw ApiError.badRequest(error.message);
    throw error;
  }
}

// The admin-oversight step - deliberately restricted to Warehouse
// Admin/Super Admin at the route level (see attendance.routes.js), the same
// separation StockEntry uses between whoever logs it and whoever signs off.
export async function markPresent(actor, id) {
  const existing = await AttendanceRecord.findById(id);
  if (!existing) throw ApiError.notFound("Attendance record not found.");

  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    const ownWarehouseId = await getOwnWarehouseId(actor.profile);
    if (ownWarehouseId !== existing.warehouse.toString()) {
      throw ApiError.forbidden("You can only review attendance records in your own warehouse.");
    }
  }

  existing.status = "present";
  existing.reviewedBy = actor.profile._id;
  existing.reviewedAt = new Date();
  await existing.save();
  await existing.populate(POPULATE);

  await recordAudit({ actor, action: "attendance.mark_present", entityType: "attendance_record", entityId: id, warehouseId: existing.warehouse });
  return existing;
}
