import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";
import { nextSequence } from "./Counter.js";

// Item / Parts Master - per-warehouse stock of named items (seeds,
// fertiliser bags, spare parts, etc.), distinct from StockEntry which is
// the weighment ledger for bulk commodity in/out.
const itemSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    itemCode: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    stockQty: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

itemSchema.pre("save", async function generateItemCode(next) {
  if (this.isNew && !this.itemCode) {
    const seq = await nextSequence("item_code");
    this.itemCode = `ITM-${String(seq).padStart(4, "0")}`;
  }
  next();
});

toJSONPlugin(itemSchema);

export const Item = mongoose.model("Item", itemSchema);
