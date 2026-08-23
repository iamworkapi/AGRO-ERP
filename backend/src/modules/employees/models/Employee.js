import mongoose from "mongoose";
import { toJSONPlugin } from "../../common/models/plugins/toJSON.js";
import { nextSequence } from "../../common/models/Counter.js";

// Warehouse staff/field-employee records a Supervisor maintains. These are
// managed records, not login accounts - employees don't get a User document
// unless the business later decides they need portal access.
const employeeSchema = new mongoose.Schema(
  {
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    employeeCode: { type: String, unique: true },
    fullName: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    avatarUrl: { type: String },
    dateOfJoining: { type: Date },
    address: { type: String, trim: true },
    emergencyContactName: { type: String, trim: true },
    emergencyContactPhone: { type: String, trim: true },
    employmentStatus: { type: String, enum: ["active", "on_leave", "inactive"], default: "active" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Payroll
    salaryType: { type: String, enum: ["monthly", "daily", "piece_rate"], default: "monthly" },
    basicSalary: { type: Number, min: 0, default: 0 },
    allowances: { type: Number, min: 0, default: 0 },
    deductions: { type: Number, min: 0, default: 0 },
    bankName: { type: String, trim: true },
    accountNo: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    panNo: { type: String, trim: true },
    pfAccountNo: { type: String, trim: true },
    esiNo: { type: String, trim: true },
    uan: { type: String, trim: true },
  },
  { timestamps: true }
);

employeeSchema.pre("save", async function generateEmployeeCode(next) {
  if (this.isNew && !this.employeeCode) {
    const seq = await nextSequence("employee_code");
    this.employeeCode = `EMP-${String(seq).padStart(4, "0")}`;
  }
  next();
});

toJSONPlugin(employeeSchema);

export const Employee = mongoose.model("Employee", employeeSchema);
