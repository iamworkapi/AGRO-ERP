import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/ApiResponse.js";
import * as profileService from "../services/profile.service.js";

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, await profileService.getOwnProfile(req.user));
});

export const list = asyncHandler(async (req, res) => {
  const profiles = await profileService.listProfiles(req.user, req.query);
  sendSuccess(res, profiles);
});

export const countsByRole = asyncHandler(async (req, res) => {
  const counts = await profileService.getCountsByRole(req.user);
  sendSuccess(res, counts);
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

export const updateOwnProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateOwnProfile(req.user, req.body);
  sendSuccess(res, profile);
});

export const update = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfileById(req.user, req.params.id, req.body);
  sendSuccess(res, profile);
});

export const deleteOwnProfile = asyncHandler(async (req, res) => {
  const result = await profileService.deleteProfile(req.user, req.user.profile._id);
  sendSuccess(res, result);
});

export const deleteProfile = asyncHandler(async (req, res) => {
  const result = await profileService.deleteProfile(req.user, req.params.id);
  sendSuccess(res, result);
});
