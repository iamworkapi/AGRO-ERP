import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function useAttendance(warehouseId) {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setStatus("loading");
    api
      .fetchAttendanceRecords(warehouseId)
      .then((data) => {
        setRecords(data);
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

  async function addRecord(payload) {
    const created = await api.createAttendanceRecord(payload);
    setRecords((prev) => [created, ...prev]);
    return created;
  }

  async function markPresent(id) {
    const updated = await api.markAttendancePresent(id);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  }

  return { records, status, error, reload, addRecord, markPresent };
}
