import mongoose from "mongoose";
const { Schema, model } = mongoose;

const GoodsSchema = new Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    supplierInvoiceNo: { type: String },
    supplierInvoiceDate: { type: Date },
    ewayBillNo: { type: String },
    supplier: { type: String, required: true, trim: true },
    supplierGstin: { type: String, trim: true },
    consignee: { type: String, trim: true },
    consigneeGstin: { type: String, trim: true },
    consigneeAddress: { type: String },
    warehouse: { type: String, required: true, trim: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    items: [
      {
        description: { type: String, required: true },
        hsnCode: { type: String },
        quantity: { type: Number, required: true, min: 0 },
        unit: { type: String, default: "PCS" },
        rate: { type: Number, required: true, min: 0 },
        amount: { type: Number, required: true, min: 0 },
        discountPct: { type: Number, default: 0 },
      },
    ],
    totalItemAmount: { type: Number, required: true, min: 0 },
    cgstPct: { type: Number, default: 0 },
    sgstPct: { type: Number, default: 0 },
    igstPct: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    amountInWords: { type: String },
    invoiceDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Purchased", "In Stock", "Dispatched", "Sold", "Cancelled"],
      default: "Purchased",
    },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

GoodsSchema.index({ warehouseId: 1 });
GoodsSchema.index({ status: 1 });
GoodsSchema.index({ supplier: 1 });
GoodsSchema.index({ invoiceDate: -1 });

export default model("Goods", GoodsSchema);
