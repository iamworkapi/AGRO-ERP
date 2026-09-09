import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import * as service from "../services/goods.service.js";
import {
  createGoodsSchema,
  updateGoodsStatusSchema,
  listGoodsQuerySchema,
} from "../validators/goods.validator.js";
import { ROLES } from "../../common/constants/roles.js";

export const listGoods = asyncHandler(async (req, res) => {
  const q = listGoodsQuerySchema.parse(req.query);
  const { list, meta } = await service.listGoods(req.user, q);
  sendSuccess(res, list, 200, meta);
});

export const getNextSupplierInvoiceNo = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getNextSupplierInvoiceNo() });
});

export const getGoods = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getGoods(req.user, req.params.id) });
});

export const createGoods = asyncHandler(async (req, res) => {
  const payload = createGoodsSchema.parse(req.body);
  res.status(201).json({ success: true, data: await service.createGoods(req.user, payload) });
});

export const updateGoodsStatus = asyncHandler(async (req, res) => {
  const { status } = updateGoodsStatusSchema.parse(req.body);
  res.json({ success: true, data: await service.updateGoodsStatus(req.user, req.params.id, status) });
});

export const deleteGoods = asyncHandler(async (req, res) => {
  await service.deleteGoods(req.user, req.params.id);
  sendSuccess(res, { deleted: true }, 200);
});
