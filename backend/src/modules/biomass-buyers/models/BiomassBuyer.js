import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";
import { nextSequence } from "../../common/models/Counter.js";

const biomassBuyerSchema = new mongoose.Schema(
  {
    buyerCode: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    division: { type: String, trim: true, default: "" },
    address: { type: String, required: true, trim: true },
    gstin: { type: String, required: true, trim: true },
    plantType: {
      type: String,
      enum: [
        "Bio-Ethanol Plant",
        "CBG Plant / Ethanol Division",
        "Biomass Power Plant",
        "Biomass Power Plant (Co-firing)",
        "CBG & Bio-Energy Plant",
        "Pellet / Briquette Mill",
        "Paper & Packaging Mill",
      ],
      default: "Bio-Ethanol Plant",
    },
    agreedRatePerMt: { type: Number, default: 1850, min: 0 },
    targetQtyMt: { type: Number, default: 5000, min: 0 },
    fulfilledQtyMt: { type: Number, default: 0, min: 0 },
    contactPerson: { type: String, trim: true, default: "" },
    contactMobile: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    poNo: { type: String, trim: true, default: "" },
    paymentTerms: { type: String, trim: true, default: "Net 15 Days" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "COMPLETED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

biomassBuyerSchema.pre("save", async function generateBuyerCode(next) {
  if (this.isNew && !this.buyerCode) {
    const seq = await nextSequence("biomass_buyer_code");
    this.buyerCode = `KGABYR${String(seq).padStart(3, "0")}`;
  }
  next();
});

toJSONPlugin(biomassBuyerSchema);

export const BiomassBuyer = mongoose.model("BiomassBuyer", biomassBuyerSchema);
