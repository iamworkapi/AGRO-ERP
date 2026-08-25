import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import FormField from "../components/common/FormField";
import Button from "../components/common/Button";
import PhotoPicker from "../components/common/PhotoPicker";
import { useEmployees } from "../features/employees/useEmployees";
import { useWarehouses } from "../features/warehouses/useWarehouses";
import { useAuth } from "../hooks/useAuth";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/employeeValidators";
import { validateOrToast } from "../utils/validate";
import { toast } from "../utils/toast";

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "on_leave", label: "On Leave" },
  { value: "inactive", label: "Inactive" },
];

function emptyForm(defaultWarehouseId = "") {
  return {
    warehouseId: defaultWarehouseId,
    fullName: "",
    designation: "",
    phone: "",
    email: "",
    avatarUrl: "",
    dateOfJoining: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    employmentStatus: "active",
  };
}

function formFromEmployee(employee) {
  return {
    warehouseId: employee.warehouseId || "",
    fullName: employee.name || "",
    designation: employee.designation || "",
    phone: employee.phone || "",
    email: employee.email || "",
    avatarUrl: employee.avatarUrl || "",
    dateOfJoining: employee.dateOfJoiningRaw || "",
    address: employee.address || "",
    emergencyContactName: employee.emergencyContactName || "",
    emergencyContactPhone: employee.emergencyContactPhone || "",
    employmentStatus: employee.employmentStatus || "active",
  };
}

export default function AddEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { addEmployee, updateEmployee, employees, status: employeesStatus } = useEmployees();
  const { warehouses } = useWarehouses();

  const existingEmployee = isEditMode ? employees.find((e) => e.id === id) : null;
  const notFound = isEditMode && employeesStatus === "succeeded" && !existingEmployee;

  // A Supervisor/Warehouse Admin only ever has their own (server-scoped)
  // warehouse to enrol staff into; Super Admin can pick any warehouse in the org.
  const myWarehouse = isScopedRole ? warehouses[0] : null;
  const [form, setForm] = useState(() => emptyForm());
  const [saving, setSaving] = useState(false);
  const [loadedExistingId, setLoadedExistingId] = useState(null);

  // useWarehouses() resolves asynchronously, so a Supervisor/Warehouse
  // Admin's own warehouse isn't known yet on first render - fill it in as
  // soon as it arrives instead of only at mount. Skipped in edit mode - the
  // employee's existing warehouse is loaded separately below and can't be
  // changed via update anyway (see employee.service.js updateEmployee).
  useEffect(() => {
    if (!isEditMode && isScopedRole && myWarehouse?.id) {
      setForm((f) => (f.warehouseId ? f : { ...f, warehouseId: myWarehouse.id }));
    }
  }, [isEditMode, isScopedRole, myWarehouse?.id]);

  // The employee roster also loads asynchronously - fill the form in once
  // the record we're editing actually arrives.
  useEffect(() => {
    if (isEditMode && existingEmployee && loadedExistingId !== existingEmployee.id) {
      setForm(formFromEmployee(existingEmployee));
      setLoadedExistingId(existingEmployee.id);
    }
  }, [isEditMode, existingEmployee, loadedExistingId]);

  const set = useCallback((key) => (val) => setForm((f) => ({ ...f, [key]: val })), []);

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => String(w.id) === String(form.warehouseId)),
    [warehouses, form.warehouseId]
  );
  const perWarehouseCount = useMemo(
    () => (selectedWarehouse ? employees.filter((e) => e.warehouseId === selectedWarehouse.id).length : 0),
    [employees, selectedWarehouse]
  );
  const initials = useMemo(() => {
    const trimmed = form.fullName.trim();
    return trimmed ? trimmed.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "EM";
  }, [form.fullName]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (isEditMode) {
        const parsed = validateOrToast(updateEmployeeSchema, form);
        if (!parsed) return;

        setSaving(true);
        try {
          const updated = await updateEmployee(id, parsed).unwrap();
          toast.success(`${updated.name} updated.`);
          navigate("/employees");
        } catch (err) {
          toast.error(err?.message || "Could not update this employee. Please try again.");
        } finally {
          setSaving(false);
        }
        return;
      }

      const parsed = validateOrToast(createEmployeeSchema, form);
      if (!parsed) return;

      setSaving(true);
      try {
        const created = await addEmployee(parsed).unwrap();
        toast.success(`${created.name} added to the roster.`);
        navigate("/employees");
      } catch (err) {
        toast.error(err?.message || "Could not add this employee. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [isEditMode, form, id, updateEmployee, addEmployee, navigate]
  );

  if (notFound) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <PageHeader title="Edit Employee" subtitle="This employee record could not be found" />
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 24, textAlign: "center" }}>
          <p style={{ color: "var(--muted)", marginBottom: 12 }}>
            This employee doesn&apos;t exist, or you don&apos;t have access to it.
          </p>
          <Link to="/employees" style={{ color: "var(--primary-deep)", fontWeight: 600, textDecoration: "none" }}>
            &larr; Back to Employee Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader
        title={isEditMode ? "Edit Employee" : "Add Employee"}
        subtitle={
          isEditMode
            ? `Update HR details for ${existingEmployee?.name || "this employee"}`
            : "Enrol a new staff member and file their basic HR record"
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18 }} className="responsive-grid-2">
        {/* Main Form Section */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            boxShadow: "var(--shadow-sm)",
            padding: "22px 24px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              background: "linear-gradient(90deg, #059669 0%, #10B981 100%)",
            }}
          />

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Section 1: Profile Photo */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-camera" style={{ color: "var(--primary)", fontSize: 14 }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Profile Photo</h3>
              </div>
              <PhotoPicker value={form.avatarUrl} onChange={set("avatarUrl")} name={form.fullName} />
            </div>

            {/* Section 2: Basic Information */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-id-card" style={{ color: "var(--primary)", fontSize: 14 }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Basic Information</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="Full Name"
                  required
                  icon="fa-solid fa-user"
                  value={form.fullName}
                  onChange={set("fullName")}
                  placeholder="e.g. Manoj Kumar"
                  compact
                  marginBottom={12}
                />
                <FormField
                  label="Designation"
                  required
                  icon="fa-solid fa-briefcase"
                  value={form.designation}
                  onChange={set("designation")}
                  placeholder="e.g. Warehouse Staff"
                  compact
                  marginBottom={12}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isEditMode ? "1fr 1fr" : "1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="Warehouse"
                  type="select"
                  required
                  disabled={isEditMode || isScopedRole}
                  value={form.warehouseId}
                  onChange={set("warehouseId")}
                  options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                  compact
                  marginBottom={8}
                />
                {isEditMode && (
                  <FormField
                    label="Employment Status"
                    type="select"
                    required
                    value={form.employmentStatus}
                    onChange={set("employmentStatus")}
                    options={EMPLOYMENT_STATUS_OPTIONS}
                    compact
                    marginBottom={8}
                  />
                )}
              </div>
              {(isEditMode || isScopedRole) && (
                <p style={{ fontSize: 11, color: "var(--muted)", margin: "0 0 4px" }}>
                  {isEditMode ? "Warehouse can't be changed after enrolment." : "Locked to your assigned warehouse."}
                </p>
              )}
            </div>

            {/* Section 3: Contact Details */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-address-book" style={{ color: "var(--primary)", fontSize: 14 }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Contact Details</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="Phone"
                  type="tel"
                  icon="fa-solid fa-phone"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="98xxxxxxxx"
                  compact
                  marginBottom={12}
                />
                <FormField
                  label="Email"
                  type="email"
                  icon="fa-solid fa-envelope"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@company.com"
                  compact
                  marginBottom={12}
                />
              </div>

              <FormField
                label="Address"
                type="textarea"
                value={form.address}
                onChange={set("address")}
                placeholder="Current residential address"
                compact
                marginBottom={8}
              />
            </div>

            {/* Section 4: Employment Details */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-calendar-day" style={{ color: "var(--primary)", fontSize: 14 }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Employment Details</h3>
              </div>

              <FormField
                label="Date of Joining"
                type="date"
                icon="fa-solid fa-calendar"
                value={form.dateOfJoining}
                onChange={set("dateOfJoining")}
                compact
                marginBottom={8}
              />
            </div>

            {/* Section 5: Emergency Contact */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid var(--line)" }}>
                <i className="fa-solid fa-kit-medical" style={{ color: "var(--primary)", fontSize: 14 }} />
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Emergency Contact</h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }} className="responsive-grid-2">
                <FormField
                  label="Contact Name"
                  icon="fa-solid fa-user-shield"
                  value={form.emergencyContactName}
                  onChange={set("emergencyContactName")}
                  placeholder="e.g. Sunita Devi"
                  compact
                  marginBottom={8}
                />
                <FormField
                  label="Contact Phone"
                  type="tel"
                  icon="fa-solid fa-phone-volume"
                  value={form.emergencyContactPhone}
                  onChange={set("emergencyContactPhone")}
                  placeholder="98xxxxxxxx"
                  compact
                  marginBottom={8}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate("/employees")}
                style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              >
                <i className="fa-solid fa-xmark" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="btn-glow"
                style={{
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--gradient-primary)",
                  boxShadow: "0 4px 12px rgba(0, 184, 107, 0.3)",
                }}
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-circle-notch spin" /> Saving…
                  </>
                ) : isEditMode ? (
                  <>
                    <i className="fa-solid fa-check" /> Update Employee
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" /> Save Employee
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Live Summary / Preview Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "18px 20px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              <i className="fa-solid fa-eye" style={{ color: "var(--primary)", fontSize: 13 }} />
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Live Card Preview</h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {form.avatarUrl ? (
                  <img
                    src={form.avatarUrl}
                    alt={form.fullName || "Employee"}
                    style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "var(--primary-tint)",
                      color: "var(--primary-deep)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                )}
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", display: "block" }}>
                    {form.fullName || "Employee Name"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>
                    {form.designation || "Designation not set"}
                  </span>
                </div>
              </div>

              <div style={{ background: "var(--canvas)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="fa-solid fa-warehouse" style={{ color: "var(--primary)", fontSize: 11 }} /> Warehouse:
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                    {selectedWarehouse ? selectedWarehouse.name : "Not selected"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="fa-solid fa-phone" style={{ color: "var(--primary)", fontSize: 11 }} /> Phone:
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>{form.phone || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <span style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="fa-solid fa-users" style={{ color: "var(--primary)", fontSize: 11 }} /> Current Roster:
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                    {selectedWarehouse ? `${perWarehouseCount} ${perWarehouseCount === 1 ? "employee" : "employees"}` : "—"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{isEditMode ? "Current Status:" : "Initial Status:"}</span>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "#10B981", background: "var(--primary-tint)", padding: "2px 8px", borderRadius: 10 }}>
                  ● {EMPLOYMENT_STATUS_OPTIONS.find((o) => o.value === form.employmentStatus)?.label || "Active"}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #051F17 0%, #07281D 100%)",
              borderRadius: 14,
              padding: "16px 18px",
              color: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className="fa-solid fa-circle-info" style={{ color: "#33C689", fontSize: 14 }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "white" }}>{isEditMode ? "Update Guidelines" : "Enrolment Guidelines"}</span>
            </div>
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: 1.45 }}>
              {isEditMode
                ? "Changes are saved to this employee's HR record immediately. The employee code and warehouse assignment stay fixed."
                : "An employee code is generated automatically on save. A photo is optional but helps supervisors verify identity on-site."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
