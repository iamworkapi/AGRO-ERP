import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";
import { nextSequence } from "../../common/models/Counter.js";

const productSchema = new mongoose.Schema(
  {
    productCode: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    hsnCode: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    unit: { type: String, trim: true, default: "PCS" },
    defaultRate: { type: Number, min: 0, default: 0 },
    image: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

productSchema.pre("save", async function generateProductCode(next) {
  if (this.isNew && !this.productCode) {
    const seq = await nextSequence("product_code");
    this.productCode = `PRD-${String(seq).padStart(4, "0")}`;
  }
  next();
});

toJSONPlugin(productSchema);

export const Product = mongoose.model("Product", productSchema);
