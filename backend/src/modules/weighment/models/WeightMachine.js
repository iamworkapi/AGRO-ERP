import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";

const weightMachineSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    machineCode: { type: String, required: true, unique: true, trim: true },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    capacityKg: { type: Number, min: 0 },
    installedOn: { type: Date },
    lastCalibratedOn: { type: Date },
    nextCalibrationDue: { type: Date },
    status: { type: String, enum: ["active", "maintenance", "inactive"], default: "active" },
  },
  { timestamps: true }
);

toJSONPlugin(weightMachineSchema);

export const WeightMachine = mongoose.model("WeightMachine", weightMachineSchema);
