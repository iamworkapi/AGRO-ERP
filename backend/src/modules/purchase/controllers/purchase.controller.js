import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import * as service from "../services/purchase.service.js";
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderStatusSchema,
  listPurchaseOrdersQuerySchema,
} from "../validators/purchase.validator.js";
import { ROLES } from "../../common/constants/roles.js";

export const listPurchaseOrders = asyncHandler(async (req, res) => {
  const q = listPurchaseOrdersQuerySchema.parse(req.query);
  const { list, meta } = await service.listPurchaseOrders(req.user, q);
  sendSuccess(res, list, 200, meta);
});

export const getPurchaseOrder = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getPurchaseOrder(req.user, req.params.id) });
});

export const createPurchaseOrder = asyncHandler(async (req, res) => {
  const payload = createPurchaseOrderSchema.parse(req.body);
  res.status(201).json({ success: true, data: await service.createPurchaseOrder(req.user, payload) });
});

export const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
  const { status } = updatePurchaseOrderStatusSchema.parse(req.body);
  res.json({ success: true, data: await service.updatePurchaseOrderStatus(req.user, req.params.id, status) });
});

export const deletePurchaseOrder = asyncHandler(async (req, res) => {
  await service.deletePurchaseOrder(req.user, req.params.id);
  sendSuccess(res, { deleted: true }, 200);
});
