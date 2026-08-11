import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";
import { nextSequence } from "./Counter.js";

// The central entity. admin/supervisor are UNIQUE (sparse) refs into User -
// a warehouse always has exactly one of each, and a person can run at most
// one warehouse at a time. Role/status of the assigned user is validated in
// warehouse.service.js before every create/update (Mongo has no
// cross-collection triggers like the Postgres version of this schema did).
const warehouseSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    commodity: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    gpsLat: { type: Number, min: -90, max: 90 },
    gpsLng: { type: Number, min: -180, max: 180 },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    status: { type: String, enum: ["active", "inactive", "attention"], default: "active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

warehouseSchema.pre("validate", function assertDistinctStaff(next) {
  if (this.admin && this.supervisor && this.admin.equals(this.supervisor)) {
    next(new Error("A warehouse's admin and supervisor must be different people."));
  } else {
    next();
  }
});

warehouseSchema.pre("save", async function generateCode(next) {
  if (this.isNew && !this.code) {
    const seq = await nextSequence("warehouse_code");
    this.code = `WH-${String(seq).padStart(4, "0")}`;
  }
  next();
});

toJSONPlugin(warehouseSchema);

export const Warehouse = mongoose.model("Warehouse", warehouseSchema);
