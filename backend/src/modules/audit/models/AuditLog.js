import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";

// Append-only trail of every mutation made through the API. This is what
// lets a warehouse_admin monitor their supervisor's activity, and what lets
// the super_admin monitor every admin and supervisor across every
// warehouse. Written by the service layer (not a DB hook) so the actor and
// a human-readable action name are always explicit.
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

auditLogSchema.index({ warehouse: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

toJSONPlugin(auditLogSchema);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
