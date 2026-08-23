import { useEffect, useMemo, useState } from "react";
import { X, FileText, RefreshCw } from "lucide-react";

function LucideIconWrapper({ children, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }}>
      {children}
    </span>
  );
}
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import AsyncState from "../components/common/AsyncState";
import { usePayrollSlips } from "../features/payroll/usePayrollSlips";
import { useEmployees } from "../features/employees/useEmployees";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useDisclosure } from "../hooks/useDisclosure";
import { useAuth } from "../hooks/useAuth";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Payroll() {
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses } = useWarehouses();
  const myWarehouse = isScopedRole ? warehouses[0] : null;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [slipDetail, setSlipDetail] = useState(null);

  const { slips, status, error, reload } = usePayrollSlips(
    isScopedRole ? myWarehouse?.id : null,
    selectedYear,
    selectedMonth
  );
  const { employees } = useEmployees();
  const { isOpen: detailOpen, open: openDetail, close: closeDetail } = useDisclosure();

  const payrollEmployees = useMemo(
    () =>
      employees.filter((e) => e.payrollEnabled && e.salaryType),
    [employees]
  );

  useEffect(() => {
    reload();
  }, [selectedYear, selectedMonth, reload]);

  const years = useMemo(() => {
    const ys = new Set();
    for (let y = currentYear; y >= currentYear - 3; y--) ys.add(y);
    return Array.from(ys).sort((a, b) => b - a);
  }, [currentYear]);

  function viewSlip(emp) {
    setSelectedEmployee(emp);
    setSlipDetail({
      grossSalary: emp.grossSalary || 0,
      netSalary: emp.netSalary || 0,
      presentDays: emp.presentDays || 0,
      absentDays: emp.absentDays || 0,
      leaveDays: emp.leaveDays || 0,
      basicSalary: emp.basicSalary || 0,
      allowances: emp.allowances || 0,
      deductions: emp.deductions || 0,
      salaryType: emp.salaryType || "monthly",
      description: emp.description || "",
      bankName: emp.bankName || "",
      accountNo: emp.accountNo || "",
      ifscCode: emp.ifscCode || "",
    });
    openDetail();
  }

  const totalPayroll = slips.reduce((sum, s) => sum + (s.netSalary || 0), 0);
  const totalGross = slips.reduce((sum, s) => sum + (s.grossSalary || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PageHeader
        title="Payroll"
        subtitle={`Salary calculation for ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
      />

      <AsyncState status={status} error={error} loadingLabel="Calculating payroll…" />

      {/* FILTER BAR */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <FormField
          label="Month"
          type="select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
          compact
          style={{ minWidth: 140 }}
        />
        <FormField
          label="Year"
          type="select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          options={years.map((y) => ({ value: y, label: String(y) }))}
          compact
          style={{ minWidth: 100 }}
        />
        <Button
          onClick={reload}
          style={{ padding: "7px 14px", fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gradient-primary)", boxShadow: "0 3px 10px rgba(0, 184, 107, 0.3)" }}
        >
          <LucideIconWrapper size={16}><RefreshCw size={16} /></LucideIconWrapper> Refresh
        </Button>
      </div>

      {/* SUMMARY TILES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="responsive-grid-2">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--primary)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Employees</span>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)", marginTop: 6 }}>{slips.length}</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#10B981" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Total Gross</span>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#059669", marginTop: 6 }}>Rs. {totalGross.toLocaleString("en-IN")}</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#3B82F6" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Total Deductions</span>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#2563EB", marginTop: 6 }}>Rs. {(totalGross - totalPayroll).toLocaleString("en-IN")}</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#7C3AED" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>Net Payable</span>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#7C3AED", marginTop: 6 }}>Rs. {totalPayroll.toLocaleString("en-IN")}</div>
        </div>
      </div>

      {/* PAYROLL TABLE */}
      <DataTable
        title="Payroll Register"
        searchable
        searchPlaceholder="Search employee, designation..."
        keyField="employeeId"
        rows={slips}
        emptyMessage="No employees with payroll data found for this month."
        columns={[
          {
            key: "employeeName",
            label: "Employee",
            emphasize: true,
            render: (r) => (
              <div>
                <div style={{ fontWeight: 700, color: "var(--ink)" }}>{r.employeeName}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.employeeCode} &middot; {r.designation}</div>
              </div>
            ),
          },
          { key: "salaryType", label: "Type", render: (r) => <Badge tone={r.salaryType === "monthly" ? "info" : r.salaryType === "daily" ? "warning" : "secondary"}>{r.salaryType?.replace("_", " ")}</Badge> },
          { key: "presentDays", label: "Present", render: (r) => <span style={{ color: "#059669", fontWeight: 700 }}>{r.presentDays}</span> },
          { key: "absentDays", label: "Absent", render: (r) => <span style={{ color: "#DC2626", fontWeight: 700 }}>{r.absentDays}</span> },
          { key: "leaveDays", label: "Leave", render: (r) => <span style={{ color: "#D97706", fontWeight: 700 }}>{r.leaveDays}</span> },
          { key: "basicSalary", label: "Basic", render: (r) => <span style={{ fontWeight: 600 }}>Rs. {(r.basicSalary || 0).toLocaleString("en-IN")}</span> },
          { key: "grossSalary", label: "Gross", render: (r) => <span style={{ fontWeight: 700, color: "var(--ink)" }}>Rs. {(r.grossSalary || 0).toLocaleString("en-IN")}</span> },
          { key: "deductions", label: "Deductions", render: (r) => <span style={{ color: "#DC2626" }}>- Rs. {(r.deductions || 0).toLocaleString("en-IN")}</span> },
          {
            key: "netSalary",
            label: "Net Pay",
            emphasize: true,
            render: (r) => <span style={{ fontWeight: 800, color: "#7C3AED", fontSize: 14 }}>Rs. {(r.netSalary || 0).toLocaleString("en-IN")}</span>,
          },
          {
            key: "actions",
            label: "",
            render: (r) => (
              <button
                onClick={() => viewSlip(r)}
                style={{ background: "var(--primary-tint)", color: "var(--primary-deep)", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
              >
                <LucideIconWrapper size={16}><FileText size={16} /></LucideIconWrapper> Slip
              </button>
            ),
          },
        ]}
      />

      {/* SLIP DETAIL MODAL */}
      <Modal open={detailOpen} title="Salary Slip" subtitle={slipDetail ? `${selectedEmployee?.employeeName} - ${MONTHS[selectedMonth - 1]} ${selectedYear}` : ""} onClose={closeModal}>
        {slipDetail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Attendance Summary */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Attendance Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[
                  { label: "Present", value: slipDetail.presentDays, color: "#059669" },
                  { label: "Absent", value: slipDetail.absentDays, color: "#DC2626" },
                  { label: "Leave", value: slipDetail.leaveDays, color: "#D97706" },
                  { label: "Type", value: slipDetail.salaryType, color: "#2563EB" },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>{item.label}</div>
                  </div>
                ))}
              </div>
              {slipDetail.description && (
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, fontStyle: "italic" }}>{slipDetail.description}</div>
              )}
            </div>

            {/* Earnings */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Earnings</div>
              {[
                { label: "Basic Salary", value: slipDetail.basicSalary },
                { label: "Allowances", value: slipDetail.allowances },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                  <span style={{ fontSize: 13, color: "var(--ink)" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Rs. {(item.value || 0).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px dashed var(--line)", marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Gross Salary</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>Rs. {slipDetail.grossSalary.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Deductions */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Deductions</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span style={{ fontSize: 13, color: "var(--ink)" }}>Deductions</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#DC2626" }}>- Rs. {(slipDetail.deductions || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Net Pay */}
            <div style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)", borderRadius: 10, padding: "14px 16px", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Net Payable</span>
                <span style={{ fontSize: 22, fontWeight: 800 }}>Rs. {slipDetail.netSalary.toLocaleString("en-IN")}</span>
              </div>
              {(slipDetail.bankName || slipDetail.accountNo) && (
                <div style={{ fontSize: 11, marginTop: 6, opacity: 0.85 }}>
                  Bank: {slipDetail.bankName} | A/C: {slipDetail.accountNo?.slice(-4) ? `****${slipDetail.accountNo.slice(-4)}` : slipDetail.accountNo} | IFSC: {slipDetail.ifscCode}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={closeModal} style={{ padding: "7px 14px", fontSize: 12.5 }}>
                <LucideIconWrapper size={16}><X size={16} /></LucideIconWrapper> Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
