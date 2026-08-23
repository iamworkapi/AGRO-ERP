import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PurchaseOrderSchema = new Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    vendor: { type: String, required: true, trim: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor" },
    warehouse: { type: String, required: true, trim: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    item: { type: String },
    itemId: { type: Schema.Types.ObjectId, ref: "Item" },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Pending", "Approved", "Received", "Cancelled"], default: "Pending" },
    expectedDelivery: { type: Date },
    notes: { type: String },
    receivedAt: { type: Date },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

PurchaseOrderSchema.index({ vendorId: 1 });
PurchaseOrderSchema.index({ warehouseId: 1 });
PurchaseOrderSchema.index({ status: 1 });

export default model("PurchaseOrder", PurchaseOrderSchema);
