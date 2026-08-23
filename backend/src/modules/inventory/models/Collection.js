import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";
import { nextSequence } from "../../common/models/Counter.js";

// Collection slip records raw biomass received at a warehouse from a farmer
// or vendor, with weighbridge readings, moisture/ash, and GRN calculations.
const collectionSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    slipNo: { type: String, required: true, trim: true, unique: true, index: true },
    vendorId: { type: String, trim: true },
    vendorName: { type: String, trim: true },
    cropId: { type: String, trim: true, required: true },
    cropName: { type: String, trim: true, required: true },
    villageName: { type: String, required: true, trim: true },
    farmerName: { type: String, required: true, trim: true },
    farmerMobile: { type: String, trim: true },
    vehicleNo: { type: String, required: true, trim: true },
    vehicleType: { type: String, trim: true, default: "Tractor Trolley" },
    grossWeightMt: { type: Number, required: true, min: 0 },
    tareWeightMt: { type: Number, required: true, min: 0 },
    actualNetWeightMt: { type: Number, required: true, min: 0 },
    actualMoisturePct: { type: Number, required: true, min: 0, max: 100 },
    actualAshPct: { type: Number, required: true, min: 0, max: 100 },
    agreedMoisturePct: { type: Number, default: 20, min: 0, max: 100 },
    agreedAshPct: { type: Number, default: 20, min: 0, max: 100 },
    moistureDeductionPct: { type: Number, default: 0 },
    ashDeductionPct: { type: Number, default: 0 },
    totalDeductionPct: { type: Number, default: 0 },
    invoiceWeightMt: { type: Number, default: 0 },
    isRejected: { type: Boolean, default: false },
    rejectionReason: { type: String, trim: true },
    baleCountProduced: { type: Number, default: 0, min: 0 },
    balerMachine: { type: String, trim: true },
    totalAmountRs: { type: Number, default: 0 },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

collectionSchema.index({ warehouse: 1, createdAt: -1 });

collectionSchema.pre("save", async function generateSlipNo(next) {
  if (this.isNew && !this.slipNo) {
    const seq = await nextSequence("collection_slip_no");
    const date = new Date();
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    this.slipNo = `COL-${yy}${mm}-${String(seq).padStart(5, "0")}`;
  }
  next();
});

toJSONPlugin(collectionSchema);

export const Collection = mongoose.model("Collection", collectionSchema);
