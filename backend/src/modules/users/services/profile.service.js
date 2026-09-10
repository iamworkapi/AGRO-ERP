import { User } from "../models/User.js";
import { Warehouse } from "../../warehouses/models/Warehouse.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { ROLES } from "../../common/constants/roles.js";
import { recordAudit } from "../../audit/services/audit.service.js";
import { getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";

// Returns the logged-in user's own profile with warehouse info attached.
export async function getOwnProfile(actor) {
  const user = await User.findById(actor.profile._id);
  if (!user) throw ApiError.notFound("Account not found.");

  const warehouseId = await getOwnWarehouseId(actor.profile);
  let warehouse = null;
  if (warehouseId) {
    warehouse = await Warehouse.findById(warehouseId).select("name code address commodity status");
  }

  return { ...user.toJSON(), warehouseId, warehouse };
}

// Two very different actors can call this:
//  - Super Admin: can create a Warehouse Admin OR a Supervisor, unassigned
//    to any warehouse (assigned later via warehouse create/update).
//  - Warehouse Admin: can only create a Supervisor, and it's auto-assigned
//    to their own warehouse in the same step - a Warehouse Admin only has
//    one warehouse to staff, so there's no separate "assign" step for them.
// Either way the account is active immediately - whoever created it *is*
// the approval, unlike self-registration which starts pending.
export async function createProfile(actor, { fullName, email, phone, password, role, avatarUrl, address, warehouseId }) {
  const isWarehouseAdmin = actor.profile.role === ROLES.WAREHOUSE_ADMIN;
  const isSuperAdmin = actor.profile.role === ROLES.SUPER_ADMIN;

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
  } else if (isSuperAdmin && warehouseId) {
    targetWarehouse = await Warehouse.findById(warehouseId);
    if (!targetWarehouse) {
      throw ApiError.notFound("Target warehouse not found.");
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
      address,
    });

    if (targetWarehouse) {
      if (role === ROLES.WAREHOUSE_ADMIN) {
        targetWarehouse.admin = user._id;
      } else if (role === ROLES.SUPERVISOR) {
        targetWarehouse.supervisor = user._id;
      }
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

export async function updateOwnProfile(actor, { fullName, email, phone, avatarUrl, address }) {
  const updates = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (email !== undefined) {
    const normalized = email.toLowerCase().trim();
    if (normalized && normalized !== actor.profile.email) {
      const existing = await User.findOne({ email: normalized, _id: { $ne: actor.profile._id } });
      if (existing) throw ApiError.conflict("This email is already in use by another account.");
    }
    updates.email = normalized || undefined;
  }
  if (phone !== undefined) {
    const trimmed = phone.trim();
    if (trimmed && trimmed !== actor.profile.phone) {
      const existing = await User.findOne({ phone: trimmed, _id: { $ne: actor.profile._id } });
      if (existing) throw ApiError.conflict("This phone number is already in use by another account.");
    }
    updates.phone = trimmed || undefined;
  }
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl || null;
  if (address !== undefined) updates.address = address?.trim() || undefined;

  if (!Object.keys(updates).length) {
    throw ApiError.badRequest("No fields to update.");
  }

  const user = await User.findByIdAndUpdate(actor.profile._id, updates, { new: true });
  await recordAudit({
    actor,
    action: "profile.self_update",
    entityType: "profile",
    entityId: actor.profile._id,
    metadata: { changed: Object.keys(updates) },
  });
  return user;
}

export async function changePassword(actor, currentPassword, newPassword) {
  const user = await User.findById(actor.profile._id);
  if (!user) throw ApiError.notFound("Account not found.");

  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw ApiError.badRequest("Current password is incorrect.");

  user.passwordHash = await User.hashPassword(newPassword);
  // Incrementing tokenVersion invalidates every existing JWT —
  // the client gets a fresh token on next login.
  user.tokenVersion += 1;
  await user.save();

  await recordAudit({
    actor,
    action: "auth.password_change",
    entityType: "auth",
    entityId: user._id,
  });
  return { message: "Password changed successfully. Please sign in again." };
}

// Super Admin or Warehouse Admin updating an existing Admin or Supervisor profile
export async function updateProfileById(actor, profileId, { fullName, email, phone, password, avatarUrl, address }) {
  if (actor.profile.role === ROLES.WAREHOUSE_ADMIN) {
    const ownWarehouse = await Warehouse.findOne({ admin: actor.profile._id });
    const isSelf = String(actor.profile._id) === String(profileId);
    const isOwnSupervisor = ownWarehouse?.supervisor && String(ownWarehouse.supervisor) === String(profileId);
    if (!isSelf && !isOwnSupervisor) {
      throw ApiError.forbidden("Warehouse Admins can only update their own profile or their assigned supervisor.");
    }
  }

  const user = await User.findById(profileId);
  if (!user) throw ApiError.notFound("User profile not found.");

  if (fullName !== undefined) user.fullName = fullName.trim();
  if (email !== undefined) {
    const normalized = email ? email.toLowerCase().trim() : "";
    if (normalized && normalized !== user.email) {
      const existing = await User.findOne({ email: normalized, _id: { $ne: profileId } });
      if (existing) throw ApiError.conflict("This email is already in use by another account.");
    }
    if (normalized) {
      user.email = normalized;
    } else {
      user.set("email", undefined);
    }
  }
  if (phone !== undefined) {
    const trimmed = phone ? phone.trim() : "";
    if (trimmed && trimmed !== user.phone) {
      const existing = await User.findOne({ phone: trimmed, _id: { $ne: profileId } });
      if (existing) throw ApiError.conflict("This phone number is already in use by another account.");
    }
    if (trimmed) {
      user.phone = trimmed;
    } else {
      user.set("phone", undefined);
    }
  }
  if (password && password.length >= 6) {
    user.passwordHash = await User.hashPassword(password);
    user.tokenVersion += 1;
  }
  if (avatarUrl !== undefined) {
    if (avatarUrl) {
      user.avatarUrl = avatarUrl;
    } else {
      user.set("avatarUrl", undefined);
    }
  }
  if (address !== undefined) {
    const trimmed = address ? address.trim() : "";
    if (trimmed) {
      user.address = trimmed;
    } else {
      user.set("address", undefined);
    }
  }

  await user.save();

  // Sync denormalized staff fields on the linked warehouse document
  // so the Admin Management page reflects updates without a second reload.
  const isAdminRole = user.role === ROLES.WAREHOUSE_ADMIN;
  const warehouseQuery = isAdminRole ? { admin: user._id } : { supervisor: user._id };
  const warehousePatch = {
    [isAdminRole ? "adminName" : "supervisorName"]: user.fullName,
    [isAdminRole ? "adminPhone" : "supervisorPhone"]: user.phone || "",
    [isAdminRole ? "adminEmail" : "supervisorEmail"]: user.email || "",
    [isAdminRole ? "adminAddress" : "supervisorAddress"]: user.address || "",
    [isAdminRole ? "adminAvatarUrl" : "supervisorAvatarUrl"]: user.avatarUrl || "",
  };
  await Warehouse.updateMany(warehouseQuery, { $set: warehousePatch });

  await recordAudit({
    actor,
    action: "profile.admin_update",
    entityType: "profile",
    entityId: user._id,
    metadata: { updatedBy: actor.profile._id },
  });

  return user;
}

export async function deleteProfile(actor, profileId) {
  const user = await User.findById(profileId);
  if (!user) throw ApiError.notFound("User profile not found.");

  // If deleting a Super Admin, make sure at least one other Super Admin exists
  if (user.role === ROLES.SUPER_ADMIN) {
    const superAdminCount = await User.countDocuments({ role: ROLES.SUPER_ADMIN });
    if (superAdminCount <= 1) {
      throw ApiError.badRequest("Cannot delete the only Super Administrator account.");
    }
  }

  // Non-super-admins cannot delete other accounts unless it's their own account
  const isSelf = String(actor.profile._id) === String(profileId);
  if (!isSelf && actor.profile.role !== ROLES.SUPER_ADMIN) {
    throw ApiError.forbidden("Only Super Administrators can delete other user profiles.");
  }

  // Detach user from any assigned warehouses
  await Warehouse.updateMany({ admin: profileId }, { $set: { admin: null } });
  await Warehouse.updateMany({ supervisor: profileId }, { $set: { supervisor: null } });

  await User.findByIdAndDelete(profileId);

  await recordAudit({
    actor,
    action: "profile.delete",
    entityType: "profile",
    entityId: profileId,
    metadata: { deletedName: user.fullName, deletedEmail: user.email, deletedRole: user.role },
  });

  return { success: true, message: "Profile successfully deleted." };
}

// Return user counts grouped by role for the governance dashboard.
export async function getCountsByRole(actor) {
  const isSuperAdmin = actor.profile.role === ROLES.SUPER_ADMIN;

  // Warehouse Admin sees only their own count + supervisor count for their warehouse
  if (!isSuperAdmin) {
    const ownId = actor.profile._id;
    const ownWarehouse = await Warehouse.findOne({ admin: actor.profile._id });
    const supId = ownWarehouse?.supervisor;

    const total = await User.countDocuments({
      $or: [
        { _id: ownId },
        ...(supId ? [{ _id: supId }] : []),
      ],
    });
    const adminCount = await User.countDocuments({ _id: ownId });
    const supCount = supId ? await User.countDocuments({ _id: supId }) : 0;

    return { [ROLES.SUPER_ADMIN]: 0, [ROLES.WAREHOUSE_ADMIN]: adminCount, [ROLES.SUPERVISOR]: supCount };
  }

  // Super Admin sees org-wide counts
  const counts = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  const result = {};
  for (const c of counts) {
    result[c._id] = c.count;
  }
  return result;
}
