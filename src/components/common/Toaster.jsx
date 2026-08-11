import { useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { subscribeToasts } from "../../utils/toast";

const SEVERITY = { error: "error", success: "success", warning: "warn", info: "info" };
const SUMMARY = { error: "Error", success: "Success", warning: "Warning", info: "Notice" };

// Bridges the plain pub/sub store in utils/toast.js (callable from anywhere,
// including apiClient's response interceptor and thunks - not just React
// components) into PrimeReact's imperative Toast API. Mounted once at the
// app root (see App.jsx) so it's available regardless of route.
export default function Toaster() {
  const toastRef = useRef(null);
  const shownIds = useRef(new Set());

  useEffect(() => {
    return subscribeToasts((items) => {
      const currentIds = new Set(items.map((i) => i.id));
      for (const id of shownIds.current) {
        if (!currentIds.has(id)) shownIds.current.delete(id);
      }

      for (const item of items) {
        if (shownIds.current.has(item.id)) continue;
        shownIds.current.add(item.id);
        toastRef.current?.show({
          severity: SEVERITY[item.type] || "info",
          summary: SUMMARY[item.type] || "Notice",
          detail: item.message,
          life: item.duration || 5000,
        });
      }
    });
  }, []);

  return <Toast ref={toastRef} position="top-right" className="pr-toast-compact" />;
}
