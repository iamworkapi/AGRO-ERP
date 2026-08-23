import mongoose from "mongoose";
const { Schema, model } = mongoose;
const VendorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    vendorCode: { type: String, unique: true, sparse: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "BiomassVendor" },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    gstin: { type: String },
    category: { type: String },
    creditLimit: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
VendorSchema.index({ name: 1 });
VendorSchema.index({ warehouseId: 1 });
VendorSchema.index({ status: 1 });
export default model("Vendor", VendorSchema);