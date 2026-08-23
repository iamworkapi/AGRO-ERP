import { LeaveRequest, Employee } from "../models/index.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

function computeDays(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diff = (to - from) / (1000 * 60 * 60 * 24) + 1;
  return Math.max(0.5, Math.round(diff * 2) / 2);
}

export async function listLeaveRequests(actor, { warehouseId, employeeId, status, page, limit }) {
  let effectiveWarehouseId = warehouseId;
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) {
    return { list: [], meta: paginationMeta({ page: 1, limit: 1, total: 0 }) };
  }
  if (warehouseId && warehouseId !== effectiveWarehouseId) {
    await assertCanAccessWarehouse(actor, effectiveWarehouseId);
  }
  await assertCanAccessWarehouse(actor, effectiveWarehouseId);

  const filter = { warehouse: effectiveWarehouseId };
  if (employeeId) filter.employee = employeeId;
  if (status) filter.status = status;

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    LeaveRequest.find(filter).sort({ fromDate: -1 }).skip(skip).limit(pageSize).populate("employee", "fullName employeeCode").populate("appliedBy", "name email").populate("reviewedBy", "name email"),
    LeaveRequest.countDocuments(filter),
  ]);

  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function createLeaveRequest(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);

  const employee = await Employee.findById(payload.employeeId).select("warehouse fullName");
  if (!employee) throw ApiError.notFound("Employee not found.");
  if (employee.warehouse.toString() !== payload.warehouseId) {
    throw ApiError.badRequest("That employee does not belong to this warehouse.");
  }

  const totalDays = computeDays(payload.fromDate, payload.toDate);

  const leave = await LeaveRequest.create({
    warehouse: payload.warehouseId,
    employee: payload.employeeId,
    leaveType: payload.leaveType || "casual",
    fromDate: payload.fromDate,
    toDate: payload.toDate,
    totalDays,
    reason: payload.reason || "",
    appliedBy: actor.profile._id,
  });

  await leave.populate("employee", "fullName employeeCode").populate("appliedBy", "name email");

  await recordAudit({ actor, action: "leave_request.create", entityType: "leave_request", entityId: leave._id, warehouseId: payload.warehouseId, metadata: { employeeId: payload.employeeId, leaveType: leave.leaveType, totalDays } });
  return leave;
}

export async function reviewLeaveRequest(actor, id, decision) {
  const leave = await LeaveRequest.findById(id);
  if (!leave) throw ApiError.notFound("Leave request not found.");
  if (leave.status !== "pending") throw ApiError.badRequest("This leave request has already been reviewed.");

  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    const ownWarehouseId = await getOwnWarehouseId(actor.profile);
    if (ownWarehouseId !== leave.warehouse.toString()) {
      throw ApiError.forbidden("You can only review leave requests in your own warehouse.");
    }
  }

  leave.status = decision;
  leave.reviewedBy = actor.profile._id;
  leave.reviewedAt = new Date();
  leave.reviewedRemark = decision === "approved" ? "Leave approved." : "Leave rejected.";
  await leave.save();
  await leave.populate("employee", "fullName employeeCode").populate("appliedBy", "name email").populate("reviewedBy", "name email");

  await recordAudit({ actor, action: `leave_request.${decision}`, entityType: "leave_request", entityId: id, warehouseId: leave.warehouse, metadata: { employeeId: leave.employee, totalDays: leave.totalDays } });
  return leave;
}

export async function getLeaveSummary(actor, warehouseId) {
  let effectiveWarehouseId = warehouseId;
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) {
    return { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  }
  await assertCanAccessWarehouse(actor, effectiveWarehouseId);

  const docs = await LeaveRequest.find({ warehouse: effectiveWarehouseId });
  const summary = { total: docs.length, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  for (const d of docs) {
    if (summary[d.status] !== undefined) summary[d.status]++;
  }
  return summary;
}
