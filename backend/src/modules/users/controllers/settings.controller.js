import fs from "fs";
import path from "path";
import { ApiError } from "../../common/utils/ApiError.js";
import { recordAudit, listAuditLogs } from "../../audit/services/audit.service.js";

const PROFILE_PATH = path.join(process.cwd(), "data", "org-profile.json");

function ensureProfile() {
  try {
    if (!fs.existsSync(PROFILE_PATH)) {
      fs.mkdirSync(path.dirname(PROFILE_PATH), { recursive: true });
      fs.writeFileSync(PROFILE_PATH, JSON.stringify({
        orgName: "ORISH AGRO", address: "", phone: "", email: "", gstin: "", logo: "",
      }));
    }
  } catch {}
}

function readProfile() {
  ensureProfile();
  try { return JSON.parse(fs.readFileSync(PROFILE_PATH, "utf-8")); }
  catch { return {}; }
}

function writeProfile(profile) {
  ensureProfile();
  fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2));
}

const ROLES = [
  { key: "super_admin", label: "Super Admin", permissions: ["all"] },
  { key: "warehouse_admin", label: "Warehouse Admin", permissions: ["manage_warehouse", "manage_users", "manage_stock", "view_reports"] },
  { key: "supervisor", label: "Supervisor", permissions: ["manage_stock", "create_weighment", "view_reports"] },
  { key: "operator", label: "Operator", permissions: ["create_weighment", "view_stock"] },
  { key: "viewer", label: "Viewer", permissions: ["view_reports", "view_stock"] },
];

export async function getOrgProfile(req, res, next) {
  try { res.json({ success: true, data: readProfile() }); }
  catch (err) { next(err); }
}

export async function updateOrgProfile(req, res, next) {
  try {
    const current = readProfile();
    const updated = { ...current, ...req.body };
    writeProfile(updated);
    await recordAudit({ actorId: req.user.id, action: "org_profile_updated", entity: "OrgProfile" });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

export async function getRoles(req, res, next) {
  try { res.json({ success: true, data: ROLES }); }
  catch (err) { next(err); }
}

export async function createRole(req, res, next) {
  try {
    const { role, permissions } = req.body;
    if (!role) throw ApiError.badRequest("Role name is required.");
    const record = { key: role.toLowerCase().replace(/\s+/g, "_"), label: role, permissions: permissions || [], users: 0 };
    ROLES.push(record);
    await recordAudit({ actorId: req.user.id, action: "role_created", entity: "Role", entityId: record.key });
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
}

export async function listAuditLogsCtrl(req, res, next) {
  try {
    const logs = await listAuditLogs({ actor: req.user });
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
}