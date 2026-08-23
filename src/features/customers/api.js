import { apiClient } from "../../services/apiClient";

function unwrapList(data) {
  return Array.isArray(data?.data) ? data.data : [];
}

function adaptCustomer(c) {
  if (!c) return c;
  return {
    id: c._id || c.id,
    name: c.name,
    email: c.email || "",
    company: c.company || c.gstin || "",
    phone: c.phone || "",
    receivables: typeof c.creditLimit === "number" ? `USD ${c.creditLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "USD 0.00",
    status: c.status || "Pending",
    avatar: c.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
    address: c.address || "",
    gstin: c.gstin || "",
  };
}

function adaptStats(customers) {
  const list = unwrapList(customers);
  const total = list.length;
  const active = list.filter((c) => c.status === "Active").length;
  return [
    { label: "Total Customers", value: total.toLocaleString(), trend: "in customer master", iconColor: "#00B86B", iconBg: "#E5F8F0", type: "success" },
    { label: "Active Customers", value: String(active), trend: `~ ${total > 0 ? Math.round((active / total) * 100) : 0}% of total`, iconColor: "#3B82F6", iconBg: "#EFF6FF", type: "info" },
    { label: "Pending Customers", value: String(total - active), trend: `~ ${total > 0 ? Math.round(((total - active) / total) * 100) : 0}% of total`, iconColor: "#EF4444", iconBg: "#FEE2E2", type: "error" },
    { label: "Total Credit", value: "—", trend: "check customer ledger", iconColor: "#F59E0B", iconBg: "#FEF3C7", type: "warning" },
  ];
}

export async function fetchCustomerStats() {
  const { data } = await apiClient.get("/customers");
  return adaptStats(data);
}

export async function fetchCustomers() {
  const { data } = await apiClient.get("/customers");
  return unwrapList(data).map(adaptCustomer);
}

export async function createCustomer(payload) {
  const { data } = await apiClient.post("/customers", {
    name: payload.name,
    company: payload.company || "",
    email: payload.email || "",
    phone: payload.phone || "",
    gstin: payload.gstin || "",
    address: payload.address || "",
    status: payload.status || "Active",
    warehouseId: "",
    creditLimit: 0,
  });
  return adaptCustomer(data.data || data);
}
