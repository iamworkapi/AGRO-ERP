import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function useWeightMachines(warehouseId) {
  const [machines, setMachines] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setStatus("loading");
    api
      .fetchWeightMachines(warehouseId)
      .then((data) => {
        setMachines(data);
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

  async function addMachine(payload) {
    const created = await api.createWeightMachine(payload);
    setMachines((prev) => [created, ...prev]);
    return created;
  }

  async function updateMachine(id, payload) {
    const updated = await api.updateWeightMachine(id, payload);
    setMachines((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  }

  return { machines, status, error, reload, addMachine, updateMachine };
}
