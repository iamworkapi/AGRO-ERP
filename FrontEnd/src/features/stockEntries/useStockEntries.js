import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function useStockEntries(warehouseId) {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setStatus("loading");
    api
      .fetchStockEntries(warehouseId)
      .then((data) => {
        setEntries(data);
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

  async function addEntry(payload) {
    const created = await api.createStockEntry(payload);
    setEntries((prev) => [created, ...prev]);
    return created;
  }

  return { entries, status, error, reload, addEntry };
}
