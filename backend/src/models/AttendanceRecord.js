import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";

// A Supervisor/Warehouse Admin logs a manual check-in/out correction for one
// of their employees; it starts life 'pending' for a Warehouse Admin/Super
// Admin to review, mirroring the same create->pending->review split used by
// StockEntry (supervisor logs, admin signs off).
const attendanceRecordSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    checkInTime: { type: String, trim: true },
    checkOutTime: { type: String, trim: true },
    status: { type: String, enum: ["present", "late", "absent", "pending"], default: "pending" },
    reason: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// One attendance record per employee per warehouse per day.
attendanceRecordSchema.index({ warehouse: 1, employee: 1, date: 1 }, { unique: true });
attendanceRecordSchema.index({ warehouse: 1, createdAt: -1 });

toJSONPlugin(attendanceRecordSchema);

export const AttendanceRecord = mongoose.model("AttendanceRecord", attendanceRecordSchema);
