import { Employee } from "../models/Employee.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants/roles.js";
import { recordAudit } from "./audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "./warehouseScope.service.js";
import { parsePagination, paginationMeta } from "../utils/pagination.js";

const EDITABLE_FIELDS = [
  "fullName",
  "designation",
  "phone",
  "email",
  "avatarUrl",
  "dateOfJoining",
  "address",
  "emergencyContactName",
  "emergencyContactPhone",
];

function pickPatch(payload, fields) {
  const patch = {};
  for (const field of fields) {
    if (payload[field] !== undefined) patch[field] = payload[field] || undefined;
  }
  return patch;
}

export async function listEmployees(actor, { warehouseId, page, limit }) {
  // Super Admin with no warehouseId gets the org-wide roster (the "how many
  // employees per warehouse, with full details" overview) - everyone else
  // is always scoped to their own warehouse, and a Super Admin who does
  // pass warehouseId gets that one warehouse specifically.
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
    Employee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).populate("warehouse", "name code"),
    Employee.countDocuments(filter),
  ]);

  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function createEmployee(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);

  const employee = await Employee.create({
    warehouse: payload.warehouseId,
    addedBy: actor.profile._id,
    ...pickPatch(payload, EDITABLE_FIELDS),
  });
  await employee.populate("warehouse", "name code");

  await recordAudit({ actor, action: "employee.create", entityType: "employee", entityId: employee._id, warehouseId: employee.warehouse, metadata: { fullName: employee.fullName } });
  return employee;
}

async function loadEmployeeOrThrow(id) {
  const employee = await Employee.findById(id);
  if (!employee) throw ApiError.notFound("Employee not found.");
  return employee;
}

export async function updateEmployee(actor, id, payload) {
  const existing = await loadEmployeeOrThrow(id);
  await assertCanAccessWarehouse(actor, existing.warehouse.toString());

  const patch = pickPatch(payload, EDITABLE_FIELDS);
  if (payload.employmentStatus !== undefined) patch.employmentStatus = payload.employmentStatus;

  const employee = await Employee.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).populate("warehouse", "name code");

  await recordAudit({ actor, action: "employee.update", entityType: "employee", entityId: id, warehouseId: existing.warehouse, metadata: { fields: Object.keys(patch) } });
  return employee;
}

export async function deactivateEmployee(actor, id) {
  const existing = await loadEmployeeOrThrow(id);
  await assertCanAccessWarehouse(actor, existing.warehouse.toString());

  const employee = await Employee.findByIdAndUpdate(id, { employmentStatus: "inactive" }, { new: true }).populate("warehouse", "name code");

  await recordAudit({ actor, action: "employee.deactivate", entityType: "employee", entityId: id, warehouseId: existing.warehouse });
  return employee;
}
