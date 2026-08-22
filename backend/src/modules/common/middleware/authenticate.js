import { User } from "../models/User.js";
import { RevokedToken } from "../models/RevokedToken.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

// Verifies the bearer JWT, rejects it if it's been logged-out/revoked, then
// loads the matching User (role + status) so every downstream handler can
// rely on req.user without re-querying. Runs before every /api/v1 route
// except /auth/login and /auth/register.
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized("Missing bearer token.");

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired session.");
  }

  const revoked = await RevokedToken.exists({ jti: payload.jti });
  if (revoked) throw ApiError.unauthorized("This session has been logged out. Please sign in again.");

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized("No account found for this session.");
  if (payload.tokenVersion !== user.tokenVersion) {
    throw ApiError.unauthorized("Your password was reset. Please sign in again.");
  }
  if (user.status !== "active") {
    throw ApiError.forbidden(
      user.status === "pending"
        ? "Your account is pending approval by a Super Admin."
        : "Your account has been deactivated."
    );
  }

  req.user = { profile: user, tokenPayload: payload };
  next();
});
