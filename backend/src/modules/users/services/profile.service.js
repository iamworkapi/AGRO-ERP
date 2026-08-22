import { User } from "../models/User.js";
import { Warehouse } from "../../warehouses/models/Warehouse.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "../../audit/services/audit.service.js";

// Two very different actors can call this:
//  - Super Admin: can create a Warehouse Admin OR a Supervisor, unassigned
//    to any warehouse (assigned later via warehouse create/update).
//  - Warehouse Admin: can only create a Supervisor, and it's auto-assigned
//    to their own warehouse in the same step - a Warehouse Admin only has
//    one warehouse to staff, so there's no separate "assign" step for them.
// Either way the account is active immediately - whoever created it *is*
// the approval, unlike self-registration which starts pending.
export async function createProfile(actor, { fullName, email, phone, password, role, avatarUrl }) {
  const isWarehouseAdmin = actor.profile.role === ROLES.WAREHOUSE_ADMIN;

  let targetWarehouse = null;
  if (isWarehouseAdmin) {
    if (role !== ROLES.SUPERVISOR) {
      throw ApiError.forbidden("Warehouse Admins can only create Supervisor accounts.");
    }
    targetWarehouse = await Warehouse.findOne({ admin: actor.profile._id });
    if (!targetWarehouse) {
      throw ApiError.badRequest("You are not currently assigned to a warehouse.");
    }
    if (targetWarehouse.supervisor) {
      throw ApiError.conflict("Your warehouse already has a Supervisor assigned. Deactivate or reassign them first.");
    }
  }

  const passwordHash = await User.hashPassword(password);

  try {
    const user = await User.create({
      fullName,
      email: email?.toLowerCase(),
      phone,
      passwordHash,
      role,
      status: "active",
      avatarUrl,
    });

    if (targetWarehouse) {
      targetWarehouse.supervisor = user._id;
      await targetWarehouse.save();
    }

    await recordAudit({
      actor,
      action: "profile.create",
      entityType: "profile",
      entityId: user._id,
      warehouseId: targetWarehouse?.id,
      metadata: { role, fullName, autoAssignedWarehouse: targetWarehouse?.name },
    });
    return user;
  } catch (error) {
    if (error.code === 11000) throw ApiError.conflict("An account with this email/phone already exists.");
    if (error.name === "ValidationError") throw ApiError.badRequest(error.message);
    throw error;
  }
}

// Powers the "monitor admins and supervisors" view. Super Admin sees
// everyone, org-wide, with an optional role/status filter. A Warehouse
// Admin only ever sees themselves and their own warehouse's Supervisor (if
// any) - the people directly relevant to running their warehouse, not the
// whole organisation's account list.
export async function listProfiles(actor, { role, status }) {
  if (actor.profile.role === ROLES.WAREHOUSE_ADMIN) {
    const ownWarehouse = await Warehouse.findOne({ admin: actor.profile._id }).select("name code supervisor");
    const ids = [actor.profile._id, ownWarehouse?.supervisor].filter(Boolean);
    const users = await User.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
    // Both the actor and their Supervisor (if any) belong to this same
    // warehouse - no per-user lookup needed, unlike the org-wide branch
    // below where every user could belong to a different one.
    const warehouseSummary = ownWarehouse ? { id: ownWarehouse.id, name: ownWarehouse.name, code: ownWarehouse.code } : null;
    return users.map((u) => ({ ...u.toJSON(), warehouse: warehouseSummary }));
  }

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const [users, warehouses] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }),
    Warehouse.find({ $or: [{ admin: { $ne: null } }, { supervisor: { $ne: null } }] }).select("name code admin supervisor"),
  ]);

  const warehouseByUserId = new Map();
  for (const w of warehouses) {
    if (w.admin) warehouseByUserId.set(w.admin.toString(), { id: w.id, name: w.name, code: w.code });
    if (w.supervisor) warehouseByUserId.set(w.supervisor.toString(), { id: w.id, name: w.name, code: w.code });
  }

  return users.map((u) => ({ ...u.toJSON(), warehouse: warehouseByUserId.get(u.id) ?? null }));
}

export async function approveProfile(actor, profileId) {
  const user = await User.findOneAndUpdate({ _id: profileId, status: "pending" }, { status: "active" }, { new: true });
  if (!user) throw ApiError.notFound("No pending profile found with that id.");

  await recordAudit({ actor, action: "profile.approve", entityType: "profile", entityId: profileId });
  return user;
}

export async function updateProfileStatus(actor, profileId, status) {
  if (String(profileId) === String(actor.profile._id)) {
    throw ApiError.badRequest("You cannot change your own account status.");
  }

  const user = await User.findByIdAndUpdate(profileId, { status }, { new: true });
  if (!user) throw ApiError.notFound("No profile found with that id.");

  await recordAudit({ actor, action: "profile.status_update", entityType: "profile", entityId: profileId, metadata: { status } });
  return user;
}
