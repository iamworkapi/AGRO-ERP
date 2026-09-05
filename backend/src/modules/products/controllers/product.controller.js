import { ApiError } from "../../common/utils/ApiError.js";
import * as service from "../services/product.service.js";

export async function listProducts(req, res, next) {
  try { const data = await service.listProducts(); res.json({ success: true, data }); }
  catch (err) { next(err); }
}

export async function getProduct(req, res, next) {
  try { res.json({ success: true, data: await service.getProduct(req.params.id) }); }
  catch (err) { next(err); }
}

export async function createProduct(req, res, next) {
  try { res.status(201).json({ success: true, data: await service.createProduct(req.user, req.body) }); }
  catch (err) { next(err); }
}

export async function updateProduct(req, res, next) {
  try { res.json({ success: true, data: await service.updateProduct(req.user, req.params.id, req.body) }); }
  catch (err) { next(err); }
}

export async function deleteProduct(req, res, next) {
  try {
    await service.deleteProduct(req.user, req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
}
