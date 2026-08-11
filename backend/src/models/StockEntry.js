import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";

// The weighment records a Supervisor logs against a warehouse's weight
// machine - the "weight machine stock" they're responsible for maintaining.
// netWeightKg is computed in a pre-save hook (Mongo has no generated
// columns like the Postgres version of this schema had) so it can never be
// set directly or drift from gross - tare.
const stockEntrySchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    weightMachine: { type: mongoose.Schema.Types.ObjectId, ref: "WeightMachine", required: true },
    slipNo: { type: String, required: true, trim: true },
    entryType: { type: String, required: true, enum: ["inward", "outward"] },
    commodity: { type: String, required: true, trim: true },
    partyName: { type: String, trim: true },
    vehicleNo: { type: String, trim: true },
    grossWeightKg: { type: Number, required: true, min: 0 },
    tareWeightKg: { type: Number, required: true, min: 0 },
    netWeightKg: { type: Number },
    moisturePct: { type: Number, min: 0, max: 100 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

stockEntrySchema.index({ warehouse: 1, slipNo: 1 }, { unique: true });
stockEntrySchema.index({ warehouse: 1, createdAt: -1 });

stockEntrySchema.pre("validate", function assertGrossNotBelowTare(next) {
  if (this.grossWeightKg < this.tareWeightKg) {
    next(new Error("Gross weight must be greater than or equal to tare weight."));
  } else {
    this.netWeightKg = this.grossWeightKg - this.tareWeightKg;
    next();
  }
});

toJSONPlugin(stockEntrySchema);

export const StockEntry = mongoose.model("StockEntry", stockEntrySchema);
