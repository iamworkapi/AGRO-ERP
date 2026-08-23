import { ApiError } from "../../common/utils/ApiError.js";
import * as service from "../services/purchase.service.js";

export async function listPurchaseOrders(req, res, next) {
  try {
    const data = await service.listPurchaseOrders(req.user);
    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
}

export async function getPurchaseOrder(req, res, next) {
  try { res.json({ success: true, data: await service.getPurchaseOrder(req.user, req.params.id) }); }
  catch (err) { next(err); }
}

export async function createPurchaseOrder(req, res, next) {
  try { res.status(201).json({ success: true, data: await service.createPurchaseOrder(req.user, req.body) }); }
  catch (err) { next(err); }
}

export async function updatePurchaseOrderStatus(req, res, next) {
  try { res.json({ success: true, data: await service.updatePurchaseOrderStatus(req.user, req.params.id, req.body.status) }); }
  catch (err) { next(err); }
}

export async function deletePurchaseOrder(req, res, next) {
  try { res.json({ success: true, ...(await service.deletePurchaseOrder(req.user, req.params.id)) }); }
  catch (err) { next(err); }
}
