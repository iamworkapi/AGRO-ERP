import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as itemService from "../services/item.service.js";

export const list = asyncHandler(async (req, res) => {
  const { list, meta } = await itemService.listItems(req.user, req.query);
  sendSuccess(res, list, 200, meta);
});

export const create = asyncHandler(async (req, res) => {
  sendSuccess(res, await itemService.createItem(req.user, req.body), 201);
});

export const update = asyncHandler(async (req, res) => {
  sendSuccess(res, await itemService.updateItem(req.user, req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  sendSuccess(res, await itemService.deleteItem(req.user, req.params.id));
});
