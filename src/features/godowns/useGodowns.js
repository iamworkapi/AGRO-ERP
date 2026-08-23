import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function useGodowns(warehouseId) {
  const [godowns, setGodowns] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setStatus("loading");
    api
      .fetchGodowns(warehouseId)
      .then((data) => {
        setGodowns(data);
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

  async function addGodown(payload) {
    const created = await api.createGodown(payload);
    setGodowns((prev) => [...prev, created]);
    return created;
  }

  async function editGodown(id, payload) {
    const updated = await api.updateGodown(id, payload);
    setGodowns((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }

  async function removeGodown(id) {
    await api.deleteGodown(id);
    setGodowns((prev) => prev.filter((g) => g.id !== id));
  }

  return { godowns, status, error, reload, addGodown, editGodown, removeGodown };
}
