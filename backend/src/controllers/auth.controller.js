import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";
import * as authService from "../services/auth.service.js";
import * as passwordResetService from "../services/passwordReset.service.js";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req);
  sendSuccess(res, result);
});

export const register = asyncHandler(async (req, res) => {
  const profile = await authService.register(req.body);
  sendSuccess(res, profile, 201);
});

export const me = asyncHandler(async (req, res) => {
  const profile = await authService.getSessionProfile(req.user);
  sendSuccess(res, profile);
});

// Revokes this specific token (see services/auth.service.js) so it stops
// working immediately, not just once it naturally expires.
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.tokenPayload);
  sendSuccess(res, null);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await passwordResetService.requestPasswordReset(req.body.identifier);
  sendSuccess(res, result);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await passwordResetService.resetPassword(req.body);
  sendSuccess(res, result);
});
