import { Employee } from "../models/index.js";
import { AttendanceRecord } from "../../attendance/models/AttendanceRecord.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { assertCanAccessWarehouse, getOwnWarehouseId } from "../../warehouses/services/warehouseScope.service.js";
import { ROLES } from "../../common/constants/roles.js";

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export async function getPayrollSlip(actor, { employeeId, year, month }) {
  if (!employeeId) throw ApiError.badRequest("employeeId is required.");
  if (!year || !month) throw ApiError.badRequest("year and month are required (e.g. 2026-08).");

  const employee = await Employee.findById(employeeId);
  if (!employee) throw ApiError.notFound("Employee not found.");

  // Scope check
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    const ownWarehouseId = await getOwnWarehouseId(actor.profile);
    if (!ownWarehouseId || ownWarehouseId !== employee.warehouse.toString()) {
      throw ApiError.forbidden("You can only view payroll for employees in your own warehouse.");
    }
  }
  await assertCanAccessWarehouse(actor, employee.warehouse);

  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  const totalDays = daysInMonth(y, m);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59);

  const attendanceRecords = await AttendanceRecord.find({
    employee: employeeId,
    date: { $gte: start, $lte: end },
  });

  const presentDays = attendanceRecords.filter((r) => r.status === "present" || r.status === "late").length;
  const absentDays = attendanceRecords.filter((r) => r.status === "absent").length;
  const leaveDays = attendanceRecords.filter((r) => r.status === "pending").length;
  const halfDays = attendanceRecords.filter((r) => r.reason && r.reason.toLowerCase().includes("half")).length;

  const salaryType = employee.salaryType || "monthly";
  const basicSalary = employee.basicSalary || 0;
  const allowances = employee.allowances || 0;
  const deductions = employee.deductions || 0;

  let grossSalary = 0;
  let description = "";

  if (salaryType === "monthly") {
    grossSalary = basicSalary + allowances;
    description = "Full monthly salary";
  } else if (salaryType === "daily") {
    const perDay = basicSalary;
    grossSalary = perDay * presentDays;
    description = `${presentDays} present days @ ${perDay}/day`;
  } else if (salaryType === "piece_rate") {
    grossSalary = basicSalary + allowances;
    description = "Piece rate (see production records for exact amount)";
  }

  const netSalary = Math.max(0, grossSalary - deductions);

  return {
    employeeId: employee._id,
    employeeName: employee.fullName,
    employeeCode: employee.employeeCode,
    designation: employee.designation,
    salaryType,
    year: y,
    month: m,
    totalDaysInMonth: totalDays,
    presentDays,
    absentDays,
    leaveDays,
    halfDays,
    basicSalary,
    allowances,
    deductions,
    grossSalary: Math.round(grossSalary * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
    description,
    bankName: employee.bankName || "",
    accountNo: employee.accountNo || "",
    ifscCode: employee.ifscCode || "",
  };
}

export async function listPayrollSlips(actor, { warehouseId, year, month, page, limit }) {
  let effectiveWarehouseId = warehouseId;
  if (actor.profile.role !== ROLES.SUPER_ADMIN) {
    effectiveWarehouseId = await getOwnWarehouseId(actor.profile);
  }
  if (!effectiveWarehouseId) {
    return { list: [], meta: { page: 1, limit: 0, total: 0, totalPages: 0 } };
  }
  await assertCanAccessWarehouse(actor, effectiveWarehouseId);

  const employees = await Employee.find({ warehouse: effectiveWarehouseId }).select("fullName employeeCode designation salaryType basicSalary allowances deductions bankName accountNo ifscCode");
  const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
  const y = year || new Date().getFullYear();

  const list = await Promise.all(
    employees.map(async (emp) => {
      const slip = await getPayrollSlip(actor, { employeeId: emp._id.toString(), year: y, month: m });
      return slip;
    })
  );

  return {
    list,
    meta: {
      page: 1,
      limit: list.length,
      total: list.length,
      totalPages: 1,
    },
  };
}
