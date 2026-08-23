import mongoose from "mongoose";
const { Schema, model } = mongoose;

const AlertSchema = new Schema(
  {
    type: { type: String, enum: ["Low Stock", "Overdue", "Anomaly", "System"], required: true },
    severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    title: { type: String, required: true },
    description: { type: String },
    entityType: { type: String },
    entityId: { type: Schema.Types.ObjectId },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    status: { type: String, enum: ["Open", "Acknowledged", "Resolved"], default: "Open" },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acknowledgedAt: { type: Date },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

AlertSchema.index({ warehouseId: 1, status: 1 });
AlertSchema.index({ type: 1, severity: 1 });
AlertSchema.index({ status: 1 });

export default model("Alert", AlertSchema);
