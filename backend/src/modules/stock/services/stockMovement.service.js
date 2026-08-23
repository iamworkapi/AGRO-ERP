import { StockMovement } from "../models/StockMovement.js";
import { Godown } from "../../warehouses/models/Godown.js";
import { Item } from "../../inventory/models/Item.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";
import { parsePagination, paginationMeta } from "../../common/utils/pagination.js";

function requireGodown(warehouseId, godownId) {
  return Godown.findOne({ _id: godownId, warehouse: warehouseId });
}

function requireItem(warehouseId, itemId) {
  return Item.findOne({ _id: itemId, warehouse: warehouseId });
}

// List stock movements filtered by warehouse + optional godown + item.
export async function listStockMovements(actor, { warehouseId, godownId, itemId, movementType, page, limit }) {
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
  if (godownId) filter.godown = godownId;
  if (itemId) filter.item = itemId;
  if (movementType) filter.movementType = movementType;

  const { page: pageNum, limit: pageSize, skip } = parsePagination({ page, limit });
  const [list, total] = await Promise.all([
    StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate("godown", "name code")
      .populate("item", "name itemCode")
      .populate("fromGodown", "name code")
      .populate("toGodown", "name code")
      .populate("performedBy", "name email"),
    StockMovement.countDocuments(filter),
  ]);

  return { list, meta: paginationMeta({ page: pageNum, limit: pageSize, total }) };
}

// Record a stock movement and update the Item stockQty atomically.
// Types: inward (+qty), outward (-qty), transfer (move between godowns), adjustment (+/- delta).
export async function createStockMovement(actor, payload) {
  await assertCanAccessWarehouse(actor, payload.warehouseId);

  const godown = await requireGodown(payload.warehouseId, payload.godownId);
  if (!godown) throw ApiError.notFound("Godown not found in this warehouse.");

  const item = await requireItem(payload.warehouseId, payload.itemId);
  if (!item) throw ApiError.notFound("Item not found in this warehouse.");

  const qty = Math.abs(parseFloat(payload.quantity) || 0);
  if (qty <= 0) throw ApiError.badRequest("Quantity must be greater than zero.");

  const unit = payload.unit || item.unit;

  if (payload.movementType === "transfer") {
    const toGodown = await requireGodown(payload.warehouseId, payload.toGodownId);
    if (!toGodown) throw ApiError.notFound("Destination godown not found.");
    if (payload.toGodownId === payload.godownId) {
      throw ApiError.badRequest("Source and destination godowns must be different.");
    }

    const movement = await StockMovement.create({
      warehouse: payload.warehouseId,
      godown: payload.godownId,
      item: payload.itemId,
      movementType: "transfer",
      quantity: qty,
      unit,
      fromGodown: payload.godownId,
      toGodown: payload.toGodownId,
      reason: payload.reason,
      referenceNo: payload.referenceNo,
      performedBy: actor.profile._id,
    });

    // Decrease item total stockQty by qty (it gets added back in to-godown)
    item.stockQty = Math.max(0, item.stockQty - qty);
    await item.save();

    await recordAudit({ actor, action: "stock_movement.transfer", entityType: "stock_movement", entityId: movement._id, warehouseId: payload.warehouseId, metadata: { itemId: item._id, qty, unit, from: payload.godownId, to: payload.toGodownId } });
    return movement;
  }

  // inward / outward / adjustment
  let newStock = item.stockQty;

  if (payload.movementType === "inward") {
    newStock = item.stockQty + qty;
  } else if (payload.movementType === "outward") {
    newStock = item.stockQty - qty;
    if (newStock < 0) throw ApiError.badRequest("Insufficient stock for this outward movement.");
  } else if (payload.movementType === "adjustment") {
    newStock = payload.adjustToQty ?? item.stockQty + qty;
    if (newStock < 0) throw ApiError.badRequest("Adjusted stock cannot be negative.");
  }

  item.stockQty = newStock;
  await item.save();

  const movement = await StockMovement.create({
    warehouse: payload.warehouseId,
    godown: payload.godownId,
    item: payload.itemId,
    movementType: payload.movementType,
    quantity: qty,
    unit,
    reason: payload.reason,
    referenceNo: payload.referenceNo,
    performedBy: actor.profile._id,
  });

  await recordAudit({ actor, action: `stock_movement.${payload.movementType}`, entityType: "stock_movement", entityId: movement._id, warehouseId: payload.warehouseId, metadata: { itemId: item._id, qty, unit, newStock } });
  return movement;
}

export async function getMovementSummary(actor, warehouseId) {
  let effectiveWarehouseId = warehouseId;
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) {
    return { totalMovements: 0, totalInwardQty: 0, totalOutwardQty: 0, netQty: 0, byItem: [] };
  }
  await assertCanAccessWarehouse(actor, effectiveWarehouseId);

  const match = { $match: { warehouse: effectiveWarehouseId } };
  const [totalMovements, summary] = await Promise.all([
    StockMovement.countDocuments({ warehouse: effectiveWarehouseId }),
    StockMovement.aggregate([
      match,
      {
        $group: {
          _id: "$item",
          totalQty: {
            $sum: {
              $cond: [
                { $in: ["$movementType", ["inward", "adjustment"]] },
                "$quantity",
                { $cond: [{ $eq: ["$movementType", "outward"] }, { $multiply: [-1, "$quantity"] }, 0] },
              ],
            },
          },
        },
      },
      { $lookup: { from: "items", localField: "_id", foreignField: "_id", as: "item" } },
      { $unwind: "$item" },
      { $project: { itemId: "$_id", itemName: "$item.name", itemCode: "$item.itemCode", netQty: "$totalQty" } },
    ]),
  ]);

  return { totalMovements, byItem: summary };
}
