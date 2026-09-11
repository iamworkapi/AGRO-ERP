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
import { z } from "zod";

const directSaleSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required."),
  warehouseId: z.string().min(1, "Warehouse is required."),
  customer: z.string().min(1, "Customer name is required."),
  lineItems: z.array(z.object({
    productId: z.string().min(1, "Product is required."),
    productName: z.string().min(1, "Product name is required."),
    quantity: z.coerce.number().positive("Quantity must be positive."),
    unitPrice: z.coerce.number().min(0, "Price cannot be negative."),
  })).min(1, "At least one product is required."),
  notes: z.string().optional(),
});

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

export const directSaleToVendor = asyncHandler(async (req, res) => {
  const payload = directSaleSchema.parse(req.body);
  const result = await service.directSaleToVendor(req.user, payload);
  res.status(201).json({ success: true, data: result });
});

export const updateSalesInvoiceStatus = asyncHandler(async (req, res) => {
  const { status } = updateSalesInvoiceStatusSchema.parse(req.body);
  res.json({ success: true, data: await service.updateSalesInvoiceStatus(req.user, req.params.id, status) });
});

export const deleteSalesInvoice = asyncHandler(async (req, res) => {
  await service.deleteSalesInvoice(req.user, req.params.id);
  sendSuccess(res, { deleted: true }, 200);
});
