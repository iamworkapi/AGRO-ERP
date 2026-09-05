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

  async function updateEntry(id, payload) {
    const updated = await api.updateStockEntry(id, payload);
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    return updated;
  }

  async function deleteEntry(id) {
    const result = await api.deleteStockEntry(id);
    if (result?.deleted) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
    return result;
  }

  return { entries, status, error, reload, addEntry, updateEntry, deleteEntry };
}
