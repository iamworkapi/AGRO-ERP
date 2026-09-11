import axios from "axios";
import { toast } from "../utils/toast";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// ── Logout suppression ──────────────────────────────────────────────
// When the user logs out, background requests that race the token
// removal will 401.  We keep this flag raised for ~2 s after the
// logout call so none of those 401s surface a toast or redirect.
let suppressApiErrorsUntil = 0;
export function setLoggingOut(flag) {
  suppressApiErrorsUntil = flag ? Date.now() + 2500 : 0;
}

// ── Request interceptor ─────────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor ────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // During / just after logout: swallow everything silently so the
    // user only sees the dedicated "logged out" toast from authSlice.
    if (Date.now() < suppressApiErrorsUntil) {
      return Promise.reject(error);
    }

    const dataError = error.response?.data?.error;
    let backendMessage = dataError?.message;

    if (dataError?.details?.fieldErrors) {
      const firstEntry = Object.entries(dataError.details.fieldErrors).find(([_, msgs]) => msgs && msgs.length);
      if (firstEntry) backendMessage = `${firstEntry[0]}: ${firstEntry[1][0]}`;
    } else if (dataError?.details?.formErrors?.length) {
      backendMessage = dataError.details.formErrors[0];
    }

    if (backendMessage) error.message = backendMessage;

    const status = error.response?.status;

    if (!status) {
      toast.error("Network error — please check your connection and try again.");
    } else if (status === 401) {
      // Only warn if we're not already on the login page.
      if (!window.location.pathname.startsWith("/login")) {
        localStorage.removeItem("accessToken");
        toast.error("Your session has expired. Please sign in again.");
        window.location.href = "/login";
      }
    } else if (status === 400 || status === 409 || status === 422) {
      toast.error(error.message || "Invalid request or validation error.");
    } else if (status === 403) {
      toast.error(backendMessage || "You don't have permission to do that.");
    } else if (status === 429) {
      toast.error(backendMessage || "Too many requests. Please slow down and try again shortly.");
    } else if (status >= 500) {
      toast.error("Something went wrong on our end. Please try again.");
    }

    return Promise.reject(error);
  }
);
