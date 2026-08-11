import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSummaryStatsThunk,
  fetchWarehouseOverviewThunk,
  fetchRecentActivityThunk,
  fetchMoistureSnapshotThunk,
} from "./dashboardSlice";

export function useDashboard() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.dashboard);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchSummaryStatsThunk());
      dispatch(fetchWarehouseOverviewThunk());
      dispatch(fetchRecentActivityThunk());
      dispatch(fetchMoistureSnapshotThunk());
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
