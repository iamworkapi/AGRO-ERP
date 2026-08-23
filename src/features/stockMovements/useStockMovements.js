import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function useStockMovements(warehouseId) {
  const [movements, setMovements] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    if (!warehouseId) return;
    setStatus("loading");
    api
      .fetchStockMovements(warehouseId)
      .then((data) => {
        setMovements(data);
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

  async function addMovement(payload) {
    const created = await api.createStockMovement(payload);
    setMovements((prev) => [created, ...prev]);
    return created;
  }

  return { movements, status, error, reload, addMovement };
}
