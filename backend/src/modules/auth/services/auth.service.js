import { User } from "../models/User.js";
import { RevokedToken } from "../models/RevokedToken.js";
import { LoginAttempt } from "../models/LoginAttempt.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { signAccessToken } from "../../common/utils/jwt.js";
import { getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";
import { recordAudit } from "../../audit/services/audit.service.js";

function isEmail(identifier) {
  return identifier.includes("@");
}

// Per-account lockout: 5 failed attempts within 15 minutes blocks login
// for that identifier. Looser than global rate limiting (which protects
// the endpoint as a whole) - this protects a single account from a
// targeted credential-stuffing attack.
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

async function assertNotLockedOut(identifier) {
  const cutoff = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  const failedCount = await LoginAttempt.countDocuments({
    identifier,
    success: false,
    createdAt: { $gte: cutoff },
  });

  if (failedCount >= MAX_FAILED_ATTEMPTS) {
    const oldestFailure = await LoginAttempt.findOne({ identifier, success: false, createdAt: { $gte: cutoff } })
      .sort({ createdAt: 1 })
      .select("createdAt");
    const retryAfter = oldestFailure
      ? Math.ceil((oldestFailure.createdAt.getTime() + LOCKOUT_WINDOW_MS - Date.now()) / 1000)
      : 900;
    throw new ApiError(429, `Too many failed login attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`);
  }
}

async function recordAttempt(identifier, ip, success) {
  try {
    await LoginAttempt.create({ identifier, ip, success });
  } catch {
    // Don't let audit/attempt logging break login itself.
  }
}

async function clearFailedAttempts(identifier) {
  try {
    await LoginAttempt.deleteMany({ identifier, success: false });
  } catch {
    // Best-effort cleanup.
  }
}

function buildAuditActor(user) {
  // recordAudit expects an actor with .profile._id and .profile.role.
  // For pre-login success we have the user document; for failures there
  // is no actor, so we use a minimal synthetic shape.
  return {
    profile: {
      _id: user?._id ?? null,
      role: user?.role ?? "anonymous",
    },
  };
}

function getRequestMeta(req) {
  return { ip: req?.ip || req?.headers?.["x-forwarded-for"] || "unknown", userAgent: req?.get?.("user-agent") || "unknown" };
}

export async function login({ identifier, password }, req) {
  const meta = getRequestMeta(req);

  await assertNotLockedOut(identifier);

  const user = await User.findOne(isEmail(identifier) ? { email: identifier.toLowerCase() } : { phone: identifier });

  if (!user || !(await user.comparePassword(password))) {
    await recordAttempt(identifier, meta.ip, false);
    await recordAudit({
      actor: buildAuditActor(null),
      action: "auth.login_failed",
      entityType: "auth",
      metadata: { identifier, ...meta },
    });
    throw ApiError.unauthorized("Invalid login credentials - please check your phone/email and password.");
  }

  if (user.status !== "active") {
    await recordAttempt(identifier, meta.ip, false);
    throw ApiError.forbidden(
      user.status === "pending"
        ? "Your account is pending approval by a Super Admin."
        : "Your account has been deactivated."
    );
  }

  // Reset any prior failures for this account - successful login clears the slate.
  await recordAttempt(identifier, meta.ip, true);
  await clearFailedAttempts(identifier);

  const warehouseId = await getOwnWarehouseId(user);
  await recordAudit({
    actor: buildAuditActor(user),
    action: "auth.login_success",
    entityType: "auth",
    entityId: user._id,
    metadata: { identifier, ...meta },
  });

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