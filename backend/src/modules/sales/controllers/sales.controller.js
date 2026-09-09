import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import { authorize } from "../../common/middleware/authorize.js";
import { validate } from "../../common/middleware/validate.js";
import * as service from "../services/sales.service.js";
import {
  createSalesInvoiceSchema,
  updateSalesInvoiceStatusSchema,
  listSalesInvoicesQuerySchema,
} from "../validators/sales.validator.js";
import { ROLES } from "../../common/constants/roles.js";

export const listSalesInvoices = asyncHandler(async (req, res) => {
  const q = listSalesInvoicesQuerySchema.parse(req.query);
  const { list, meta } = await service.listSalesInvoices(req.user, q);
  sendSuccess(res, list, 200, meta);
});

export const getSalesInvoice = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getSalesInvoice(req.user, req.params.id) });
});

export const createSalesInvoice = asyncHandler(async (req, res) => {
  const payload = createSalesInvoiceSchema.parse(req.body);
  res.status(201).json({ success: true, data: await service.createSalesInvoice(req.user, payload) });
});

export const updateSalesInvoiceStatus = asyncHandler(async (req, res) => {
  const { status } = updateSalesInvoiceStatusSchema.parse(req.body);
  res.json({ success: true, data: await service.updateSalesInvoiceStatus(req.user, req.params.id, status) });
});

export const deleteSalesInvoice = asyncHandler(async (req, res) => {
  await service.deleteSalesInvoice(req.user, req.params.id);
  sendSuccess(res, { deleted: true }, 200);
});
