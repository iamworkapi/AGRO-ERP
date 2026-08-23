import { ApiError } from "../../common/utils/ApiError.js";
import * as service from "../services/alert.service.js";

export async function listAlerts(req, res, next) {
  try { res.json({ success: true, data: await service.listAlerts(req.user, req.query) }); }
  catch (err) { next(err); }
}
export async function getAlert(req, res, next) {
  try { res.json({ success: true, data: await service.getAlert(req.user, req.params.id) }); }
  catch (err) { next(err); }
}
export async function createAlert(req, res, next) {
  try { res.status(201).json({ success: true, data: await service.createAlert(req.user, req.body) }); }
  catch (err) { next(err); }
}
export async function acknowledgeAlert(req, res, next) {
  try { res.json({ success: true, data: await service.acknowledgeAlert(req.user, req.params.id) }); }
  catch (err) { next(err); }
}
export async function resolveAlert(req, res, next) {
  try { res.json({ success: true, data: await service.resolveAlert(req.user, req.params.id) }); }
  catch (err) { next(err); }
}
export async function deleteAlert(req, res, next) {
  try { res.json({ success: true, ...(await service.deleteAlert(req.user, req.params.id)) }); }
  catch (err) { next(err); }
}