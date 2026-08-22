import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as profileService from "../services/profile.service.js";

export const list = asyncHandler(async (req, res) => {
  const profiles = await profileService.listProfiles(req.user, req.query);
  sendSuccess(res, profiles);
});

export const create = asyncHandler(async (req, res) => {
  const profile = await profileService.createProfile(req.user, req.body);
  sendSuccess(res, profile, 201);
});

export const approve = asyncHandler(async (req, res) => {
  const profile = await profileService.approveProfile(req.user, req.params.id);
  sendSuccess(res, profile);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfileStatus(req.user, req.params.id, req.body.status);
  sendSuccess(res, profile);
});
