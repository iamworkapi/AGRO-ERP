import { ApiError } from "../../common/utils/ApiError.js";
import * as service from "../services/vendor.service.js";

export async function listVendors(req, res, next) {
  try { res.json({ success: true, data: await service.listVendors(req.user) }); }
  catch (err) { next(err); }
}
export async function getVendor(req, res, next) {
  try { res.json({ success: true, data: await service.getVendor(req.user, req.params.id) }); }
  catch (err) { next(err); }
}
export async function createVendor(req, res, next) {
  try { res.status(201).json({ success: true, data: await service.createVendor(req.user, req.body) }); }
  catch (err) { next(err); }
}
export async function updateVendor(req, res, next) {
  try { res.json({ success: true, data: await service.updateVendor(req.user, req.params.id, req.body) }); }
  catch (err) { next(err); }
}
export async function deleteVendor(req, res, next) {
  try { res.json({ success: true, ...(await service.deleteVendor(req.user, req.params.id)) }); }
  catch (err) { next(err); }
}
