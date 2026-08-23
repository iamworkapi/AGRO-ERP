import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";
import { nextSequence } from "../../common/models/Counter.js";

// Dispatch records outbound delivery of processed biomass to industrial
// buyers — the "factory dispatch" stage of the supply chain.
const dispatchSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    gatePassNo: { type: String, required: true, trim: true, unique: true, index: true },
    buyerId: { type: String, trim: true },
    buyerName: { type: String, required: true, trim: true },
    dispatchDate: { type: Date, default: Date.now },
    vehicleNo: { type: String, required: true, trim: true },
    driverName: { type: String, trim: true },
    driverMobile: { type: String, trim: true },
    dispatchedTonnageMt: { type: Number, required: true, min: 0 },
    baleCount: { type: Number, required: true, min: 0 },
    ratePerMt: { type: Number, required: true, min: 0 },
    totalInvoiceAmount: { type: Number, required: true, min: 0 },
    poNo: { type: String, trim: true },
    poDate: { type: String, trim: true },
    ewayBillNo: { type: String, trim: true },
    lrNo: { type: String, trim: true },
    status: { type: String, enum: ["pending", "in_transit", "delivered", "cancelled"], default: "pending" },
    remarks: { type: String, trim: true },
    dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

dispatchSchema.index({ warehouse: 1, dispatchDate: -1 });

dispatchSchema.pre("save", async function generateGatePassNo(next) {
  if (this.isNew && !this.gatePassNo) {
    const seq = await nextSequence("dispatch_gate_pass_no");
    const date = new Date();
    const yymm = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}`;
    this.gatePassNo = `GP-${yymm}-${String(seq).padStart(5, "0")}`;
  }
  next();
});

toJSONPlugin(dispatchSchema);

export const Dispatch = mongoose.model("Dispatch", dispatchSchema);
