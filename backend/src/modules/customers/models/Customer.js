import mongoose from "mongoose";
const { Schema, model } = mongoose;
const CustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "BiomassBuyer" },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    gstin: { type: String },
    creditLimit: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ warehouseId: 1 });
CustomerSchema.index({ status: 1 });
export default model("Customer", CustomerSchema);