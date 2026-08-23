import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function adaptPayrollSlip(s) {
  return {
    id: s.id || s._id,
    employeeId: s.employeeId,
    employeeName: s.employeeName || "",
    employeeCode: s.employeeCode || "",
    designation: s.designation || "",
    salaryType: s.salaryType || "monthly",
    year: s.year,
    month: s.month,
    presentDays: s.presentDays || 0,
    absentDays: s.absentDays || 0,
    leaveDays: s.leaveDays || 0,
    halfDays: s.halfDays || 0,
    basicSalary: s.basicSalary || 0,
    allowances: s.allowances || 0,
    deductions: s.deductions || 0,
    grossSalary: s.grossSalary || 0,
    netSalary: s.netSalary || 0,
    description: s.description || "",
    bankName: s.bankName || "",
    accountNo: s.accountNo || "",
    ifscCode: s.ifscCode || "",
  };
}

export async function fetchPayrollSlips(warehouseId, year, month) {
  const { data } = await apiClient.get("/payroll/slips", {
    params: { warehouseId, year, month },
  });
  return unwrapList(data).map(adaptPayrollSlip);
}

export async function fetchPayrollSlip(employeeId, year, month) {
  const { data } = await apiClient.get(`/payroll/slip/${employeeId}`, {
    params: { year, month },
  });
  return adaptPayrollSlip(data.data);
}
