import { apiClient } from "../../services/apiClient";

// Backend role enum -> the display label the sidebar/topbar already expect
// (see SidebarFooter.jsx, Topbar.jsx - role is shown as text only, nothing
// gates on it yet).
const ROLE_LABELS = {
  super_admin: "Super Admin",
  warehouse_admin: "Warehouse Admin",
  supervisor: "Supervisor",
};

function adaptProfile(profile, warehouseId) {
  return {
    id: profile.id,
    name: profile.fullName,
    role: ROLE_LABELS[profile.role] || profile.role,
    roleKey: profile.role,
    identifier: profile.email || profile.phone,
    warehouseId,
  };
}

export async function loginUser({ identifier, password }) {
  const { data } = await apiClient.post("/auth/login", { identifier, password });
  const { accessToken, profile, warehouseId } = data.data;

  localStorage.setItem("accessToken", accessToken);

  return adaptProfile(profile, warehouseId);
}

// Restores a session on app load: if a token is already in localStorage
// (from a previous visit), this confirms it's still valid/not revoked and
// fetches the current profile, rather than trusting the stored token blindly.
export async function fetchCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  return adaptProfile(data.data, data.data.warehouseId);
}

export async function logoutUser() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    localStorage.removeItem("accessToken");
  }
}

// Self-registration only exists for Warehouse Admin / Supervisor - see
// backend/src/validators/auth.validator.js. Warehouse Staff / Field
// Employees are Employee records a Supervisor adds after the warehouse
// exists, not logins, so Register.jsx doesn't offer those as roles.
const ROLE_KEYS = { "Warehouse Admin": "warehouse_admin", Supervisor: "supervisor" };

export async function registerUser({ role, fullName, email, phone, password }) {
  const { data } = await apiClient.post("/auth/register", {
    role: ROLE_KEYS[role] || role,
    fullName,
    email: email || undefined,
    phone: phone || undefined,
    password,
  });
  return { ...data.data, status: "Pending Approval" };
}

// Sends a 6-digit reset code to every contact channel the account has on
// file (email + SMS) - see backend/src/services/passwordReset.service.js.
export async function requestPasswordReset(identifier) {
  const { data } = await apiClient.post("/auth/forgot-password", { identifier });
  return data.data.message;
}

export async function resetPassword({ identifier, otp, newPassword }) {
  const { data } = await apiClient.post("/auth/reset-password", { identifier, otp, newPassword });
  return data.data.message;
}
