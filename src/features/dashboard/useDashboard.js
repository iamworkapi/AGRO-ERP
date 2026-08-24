import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadDashboardThunk } from "./dashboardSlice";

export function useDashboard() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.dashboard);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(loadDashboardThunk());
    }
  }, [state.status, dispatch]);

  return {
    summaryStats: state.summaryStats,
    warehouses: state.warehouses,
    recentActivity: state.recentActivity,
    moistureSnapshot: state.moistureSnapshot,
    status: state.status,
    error: state.error,
  };
}
