import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";
import { nextSequence } from "../../common/models/Counter.js";

// StockMovement tracks every godown-level stock change (inward, outward,
// transfer, adjustment). Each movement auto-updates the related Item's
// stockQty via the service layer so the two never drift.
const stockMovementSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    godown: { type: mongoose.Schema.Types.ObjectId, ref: "Godown", required: true, index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true, index: true },
    movementType: { type: String, required: true, enum: ["inward", "outward", "transfer", "adjustment"] },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, required: true, trim: true },
    fromGodown: { type: mongoose.Schema.Types.ObjectId, ref: "Godown" },
    toGodown: { type: mongoose.Schema.Types.ObjectId, ref: "Godown" },
    reason: { type: String, trim: true },
    referenceNo: { type: String, trim: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

stockMovementSchema.index({ warehouse: 1, createdAt: -1 });
stockMovementSchema.index({ item: 1, createdAt: -1 });
stockMovementSchema.index({ godown: 1, createdAt: -1 });

stockMovementSchema.pre("save", async function generateRefNo(next) {
  if (this.isNew && !this.referenceNo) {
    const seq = await nextSequence("stock_movement_ref");
    const date = new Date();
    const yymm = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}`;
    this.referenceNo = `SM-${yymm}-${String(seq).padStart(5, "0")}`;
  }
  next();
});

toJSONPlugin(stockMovementSchema);

export const StockMovement = mongoose.model("StockMovement", stockMovementSchema);
