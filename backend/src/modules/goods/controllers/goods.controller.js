import { ApiError } from "../../common/utils/ApiError.js";
import * as service from "../services/goods.service.js";

export async function listGoods(req, res, next) {
  try { const data = await service.listGoods(req.user); res.json({ success: true, count: data.length, data }); }
  catch (err) { next(err); }
}

export async function getNextSupplierInvoiceNo(req, res, next) {
  try { res.json({ success: true, data: await service.getNextSupplierInvoiceNo() }); }
  catch (err) { next(err); }
}

export async function getGoods(req, res, next) {
  try { res.json({ success: true, data: await service.getGoods(req.user, req.params.id) }); }
  catch (err) { next(err); }
}

export async function createGoods(req, res, next) {
  try { res.status(201).json({ success: true, data: await service.createGoods(req.user, req.body) }); }
  catch (err) { next(err); }
}

export async function updateGoodsStatus(req, res, next) {
  try { res.json({ success: true, data: await service.updateGoodsStatus(req.user, req.params.id, req.body.status) }); }
  catch (err) { next(err); }
}

export async function deleteGoods(req, res, next) {
  try { res.json({ success: true, ...(await service.deleteGoods(req.user, req.params.id)) }); }
  catch (err) { next(err); }
}
