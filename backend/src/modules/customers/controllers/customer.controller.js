import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import { validate } from "../../common/middleware/validate.js";
import * as customerService from "../services/customer.service.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomersQuerySchema,
} from "../validators/customer.validator.js";

export const listCustomers = asyncHandler(async (req, res) => {
  const q = listCustomersQuerySchema.parse(req.query);
  const { list, meta } = await customerService.listCustomers(req.user, q);
  sendSuccess(res, list, 200, meta);
});

export const getCustomer = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await customerService.getCustomer(req.user, req.params.id) });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const payload = createCustomerSchema.parse(req.body);
  res.status(201).json({ success: true, data: await customerService.createCustomer(req.user, payload) });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const payload = updateCustomerSchema.parse(req.body);
  res.json({ success: true, data: await customerService.updateCustomer(req.user, req.params.id, payload) });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  await customerService.deleteCustomer(req.user, req.params.id);
  sendSuccess(res, { deleted: true }, 200);
});
