import { Item } from "../models/Item.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "./audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "./warehouseScope.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

export async function listItems(actor, { warehouseId, page, limit }) {
  // Super Admin with no warehouseId gets the org-wide item master; everyone
  // else is always scoped to their own warehouse (see listEmployees for the
  // same pattern).
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
    Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).populate("warehouse", "name code"),
    Item.countDocuments(filter),
  ]);

  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

export async function createItem(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);

  const item = await Item.create({
    warehouse: payload.warehouseId,
    name: payload.name,
    category: payload.category,
    unit: payload.unit,
    stockQty: payload.stockQty ?? 0,
    reorderLevel: payload.reorderLevel,
    addedBy: actor.profile._id,
  });
  await item.populate("warehouse", "name code");

  await recordAudit({ actor, action: "item.create", entityType: "item", entityId: item._id, warehouseId: item.warehouse, metadata: { name: item.name } });
  return item;
}

export async function updateItem(actor, id, payload) {
  const existing = await Item.findById(id);
  if (!existing) throw ApiError.notFound("Item not found.");
  await assertCanAccessWarehouse(actor, existing.warehouse.toString());

  const patch = {};
  for (const field of ["name", "category", "unit", "stockQty", "reorderLevel"]) {
    if (payload[field] !== undefined) patch[field] = payload[field];
  }

  const item = await Item.findByIdAndUpdate(id, patch, { new: true, runValidators: true }).populate("warehouse", "name code");

  await recordAudit({ actor, action: "item.update", entityType: "item", entityId: id, warehouseId: existing.warehouse, metadata: { fields: Object.keys(patch) } });
  return item;
}

export async function deleteItem(actor, id) {
  const existing = await Item.findById(id);
  if (!existing) throw ApiError.notFound("Item not found.");
  await assertCanAccessWarehouse(actor, existing.warehouse.toString());

  await Item.findByIdAndDelete(id);

  await recordAudit({ actor, action: "item.delete", entityType: "item", entityId: id, warehouseId: existing.warehouse, metadata: { name: existing.name } });
  return { id };
}
