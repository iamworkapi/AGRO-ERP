import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function useDispatches(warehouseId) {
  const [dispatches, setDispatches] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    if (!warehouseId) return;
    setStatus("loading");
    api
      .fetchDispatches(warehouseId)
      .then((data) => {
        setDispatches(data);
        setStatus("succeeded");
      })
      .catch((err) => {
        setError(err?.response?.data?.error?.message || err.message);
        setStatus("failed");
      });
  }, [warehouseId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function addDispatch(payload) {
    const created = await api.createDispatch(payload);
    setDispatches((prev) => [created, ...prev]);
    return created;
  }

  return { dispatches, status, error, reload, addDispatch };
}
