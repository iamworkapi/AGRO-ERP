import { User } from "../models/User.js";
import { RevokedToken } from "../models/RevokedToken.js";
import { ApiError } from "../utils/ApiError.js";
import { signAccessToken } from "../utils/jwt.js";
import { getOwnWarehouseId } from "./warehouseScope.service.js";

function isEmail(identifier) {
  return identifier.includes("@");
}

export async function login({ identifier, password }) {
  const user = await User.findOne(isEmail(identifier) ? { email: identifier.toLowerCase() } : { phone: identifier });
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid login credentials - please check your phone/email and password.");
  }
  if (user.status !== "active") {
    throw ApiError.forbidden(
      user.status === "pending"
        ? "Your account is pending approval by a Super Admin."
        : "Your account has been deactivated."
    );
  }

  const warehouseId = await getOwnWarehouseId(user);

  return {
    accessToken: signAccessToken(user),
    profile: user,
    warehouseId,
  };
}

// Self-registration is only for Warehouse Admins and Supervisors - see
// validators/auth.validator.js. The Super Admin is provisioned separately
// (scripts/createSuperAdmin.js) so that role can never be granted through a
// public-facing form.
export async function register({ fullName, email, phone, password, role }) {
  const existing = await User.findOne({ $or: [{ email: email?.toLowerCase() }, { phone }].filter((clause) => Object.values(clause)[0]) });
  if (existing) {
    throw ApiError.conflict("An account with this email/phone already exists.");
  }

  const passwordHash = await User.hashPassword(password);

  try {
    const user = await User.create({
      fullName,
      email: email?.toLowerCase(),
      phone,
      passwordHash,
      role,
      status: "pending", // Requires Super Admin approval before first login.
    });
    return user;
  } catch (error) {
    if (error.code === 11000) throw ApiError.conflict("An account with this email/phone already exists.");
    if (error.name === "ValidationError") throw ApiError.badRequest(error.message);
    throw error;
  }
}

export async function getSessionProfile(user) {
  const warehouseId = await getOwnWarehouseId(user.profile);
  return { ...user.profile.toJSON(), warehouseId };
}

// Real logout: records this specific token's jti as revoked until it would
// have expired anyway, so authenticate.js rejects it on the very next
// request even though the JWT signature itself is still valid. Without
// this, "logout" would only ever be a client-side illusion.
export async function logout(tokenPayload) {
  await RevokedToken.updateOne(
    { jti: tokenPayload.jti },
    { $setOnInsert: { jti: tokenPayload.jti, expiresAt: new Date(tokenPayload.exp * 1000) } },
    { upsert: true }
  );
}
