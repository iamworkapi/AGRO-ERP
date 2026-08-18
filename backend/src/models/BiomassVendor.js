import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";
import { nextSequence } from "./Counter.js";

const biomassVendorSchema = new mongoose.Schema(
  {
    vendorCode: { type: String, unique: true, index: true },
    companyName: { type: String, required: true, trim: true },
    gstin: { type: String, trim: true, default: "" },
    panNo: { type: String, trim: true, default: "" },
    representative: { type: String, trim: true, default: "" },
    contactNo: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    sourcingArea: { type: String, trim: true, default: "Unnao & Surrounding Villages" },
    poNo: { type: String, trim: true, default: "" },
    poDate: { type: String, trim: true, default: "" },
    tenure: { type: String, trim: true, default: "" },
    contractedQtyMt: { type: Number, default: 1000, min: 0 },
    agreedPricePerMt: { type: Number, default: 1400, min: 0 },
    fulfilledQtyMt: { type: Number, default: 0, min: 0 },
    bankName: { type: String, trim: true, default: "" },
    accountNo: { type: String, trim: true, default: "" },
    ifscCode: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "COMPLETED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

biomassVendorSchema.pre("save", async function generateVendorCode(next) {
  if (this.isNew && !this.vendorCode) {
    const seq = await nextSequence("biomass_vendor_code");
    this.vendorCode = `KGASPL${String(seq).padStart(3, "0")}`;
  }
  next();
});

toJSONPlugin(biomassVendorSchema);

export const BiomassVendor = mongoose.model("BiomassVendor", biomassVendorSchema);
