import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";

// Leave request logged by a supervisor for an employee, approved/rejected
// by warehouse admin or super admin.
const leaveRequestSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    leaveType: { type: String, enum: ["casual", "sick", "earned", "maternity", "paternity", "unpaid", "other"], default: "casual" },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    totalDays: { type: Number, min: 0.5 },
    reason: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewedRemark: { type: String, trim: true },
    appliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

leaveRequestSchema.index({ warehouse: 1, employee: 1, fromDate: -1 });
leaveRequestSchema.index({ warehouse: 1, status: 1 });

toJSONPlugin(leaveRequestSchema);

export const LeaveRequest = mongoose.model("LeaveRequest", leaveRequestSchema);
