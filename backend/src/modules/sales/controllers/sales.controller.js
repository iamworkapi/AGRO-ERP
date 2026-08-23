import { ApiError } from "../../common/utils/ApiError.js";
import * as service from "../services/sales.service.js";

export async function listSalesInvoices(req, res, next) {
  try { const data = await service.listSalesInvoices(req.user); res.json({ success: true, count: data.length, data }); }
  catch (err) { next(err); }
}

export async function getSalesInvoice(req, res, next) {
  try { res.json({ success: true, data: await service.getSalesInvoice(req.user, req.params.id) }); }
  catch (err) { next(err); }
}

export async function createSalesInvoice(req, res, next) {
  try { res.status(201).json({ success: true, data: await service.createSalesInvoice(req.user, req.body) }); }
  catch (err) { next(err); }
}

export async function updateSalesInvoiceStatus(req, res, next) {
  try { res.json({ success: true, data: await service.updateSalesInvoiceStatus(req.user, req.params.id, req.body.status) }); }
  catch (err) { next(err); }
}

export async function deleteSalesInvoice(req, res, next) {
  try { res.json({ success: true, ...(await service.deleteSalesInvoice(req.user, req.params.id)) }); }
  catch (err) { next(err); }
}
