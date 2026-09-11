import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SalesInvoiceSchema = new Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    customer: { type: String, required: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    vendorId: { type: Schema.Types.ObjectId, ref: "BiomassVendor" },
    warehouse: { type: String, required: true, trim: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    item: { type: String },
    itemId: { type: Schema.Types.ObjectId, ref: "Item" },
    lineItems: [
      {
        productId: { type: String },
        productName: { type: String, trim: true },
        quantity: { type: Number, required: true, min: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
      },
    ],
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Pending", "Dispatched", "Delivered", "Cancelled"], default: "Pending" },
    dispatchId: { type: Schema.Types.ObjectId, ref: "Dispatch" },
    notes: { type: String },
    deliveredAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

SalesInvoiceSchema.index({ customerId: 1 });
SalesInvoiceSchema.index({ warehouseId: 1 });
SalesInvoiceSchema.index({ status: 1 });

export default model("SalesInvoice", SalesInvoiceSchema);
