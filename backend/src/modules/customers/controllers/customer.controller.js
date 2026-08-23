import { ApiError } from "../../common/utils/ApiError.js";
import * as service from "../services/customer.service.js";

export async function listCustomers(req, res, next) {
  try { res.json({ success: true, data: await service.listCustomers(req.user) }); }
  catch (err) { next(err); }
}
export async function getCustomer(req, res, next) {
  try { res.json({ success: true, data: await service.getCustomer(req.user, req.params.id) }); }
  catch (err) { next(err); }
}
export async function createCustomer(req, res, next) {
  try { res.status(201).json({ success: true, data: await service.createCustomer(req.user, req.body) }); }
  catch (err) { next(err); }
}
export async function updateCustomer(req, res, next) {
  try { res.json({ success: true, data: await service.updateCustomer(req.user, req.params.id, req.body) }); }
  catch (err) { next(err); }
}
export async function deleteCustomer(req, res, next) {
  try { res.json({ success: true, ...(await service.deleteCustomer(req.user, req.params.id)) }); }
  catch (err) { next(err); }
}