import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function useLeaveRequests(warehouseId) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const reload = useCallback(() => {
    if (!warehouseId) return;
    setStatus("loading");
    Promise.all([
      api.fetchLeaveRequests(warehouseId),
      api.fetchLeaveSummary(warehouseId),
    ])
      .then(([list, sum]) => {
        setLeaveRequests(list);
        setSummary(sum);
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

  async function addLeaveRequest(payload) {
    const created = await api.createLeaveRequest(payload);
    setLeaveRequests((prev) => [created, ...prev]);
    return created;
  }

  async function doReview(id, decision) {
    const reviewed = await api.reviewLeaveRequest(id, decision);
    setLeaveRequests((prev) => prev.map((lr) => (lr.id === id ? reviewed : lr)));
    return reviewed;
  }

  return { leaveRequests, status, error, reload, addLeaveRequest, doReview, summary };
}
