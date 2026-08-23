import axios from "axios";
import { toast } from "../utils/toast";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// The backend always replies with { success: false, error: { message } }
// on failure (see backend/src/middleware/errorHandler.js). Without this,
// error.message everywhere in the app would be axios's generic "Request
// failed with status code 409" instead of the actual validation text -
// fixed once, here, instead of unwrapping response.data.error in every
// feature's api.js and catch block.
//
// This is also the single place that reacts to *systemic* failures (session
// expired/revoked, forbidden, rate-limited, network down, server error)
// with a toast - one-off validation errors (400/409/422) are left for each
// form to show inline, since a global toast on top of that would just be
// noise.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage = error.response?.data?.error?.message;
    if (backendMessage) error.message = backendMessage;

    const status = error.response?.status;
    // /auth/* endpoints handle their own errors inline (Login/Register
    // forms, bootstrapAuthThunk) - a 401 from a bad password or an expired
    // bootstrap check isn't a "your session died mid-use" event.
    const isAuthEndpoint = (error.config?.url || "").includes("/auth/");

    if (!status) {
      toast.error("Network error — please check your connection and try again.");
    } else if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("accessToken");
      toast.error("Your session has expired. Please sign in again.");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
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
