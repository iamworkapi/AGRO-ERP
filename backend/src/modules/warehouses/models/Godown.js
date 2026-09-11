import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";
import { nextSequence } from "../../common/models/Counter.js";

// A Godown (storage unit) is a physical subdivision inside a Warehouse.
// Each godown has a capacity, and stock balance is tracked against it
// so the supervisor can see fill % per godown in real time.
const godownSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, index: true },
    capacityMt: { type: Number, required: true, min: 0 },
    currentStockMt: { type: Number, default: 0, min: 0 },
    areaSqFt: { type: Number, min: 0 },
    godownType: { type: String, enum: ["covered", "open", "shed"], default: "covered" },
    status: { type: String, enum: ["active", "full", "maintenance"], default: "active" },
    notes: { type: String, trim: true, default: "" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

godownSchema.index({ warehouse: 1, name: 1 }, { unique: true });

godownSchema.pre("save", async function generateGodownCode(next) {
  if (this.isNew && !this.code) {
    const seq = await nextSequence("godown_code");
    let whPrefix = "WH";
    try {
      const wh = await mongoose.model("Warehouse").findById(this.warehouse).select("code name");
      if (wh?.code) {
        whPrefix = wh.code;
      } else if (wh?.name) {
        whPrefix = wh.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 5).toUpperCase();
      }
    } catch {}
    this.code = `${whPrefix}-GDW-${String(seq).padStart(3, "0")}`;
  }
  next();
});

toJSONPlugin(godownSchema);

export const Godown = mongoose.model("Godown", godownSchema);
