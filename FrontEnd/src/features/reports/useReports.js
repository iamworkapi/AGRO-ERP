import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportStatsThunk, fetchAvailableReportsThunk } from "./reportsSlice";
import { apiClient } from "../../services/apiClient";

export function useReports() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.reports);
  const [warehouseBreakdown, setWarehouseBreakdown] = useState([]);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchReportStatsThunk());
      dispatch(fetchAvailableReportsThunk());
    }
  }, [state.status, dispatch]);

  // Fetch warehouse breakdown data for tables
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get("/reports/warehouse-breakdown")
      .then((res) => {
        if (!cancelled) setWarehouseBreakdown(res.data.data?.warehouses || []);
      })
      .catch(() => {
        if (!cancelled) setWarehouseBreakdown([]);
      });
    return () => { cancelled = true; };
  }, [dispatch]);

  return {
    stats: state.stats,
    warehouses: state.warehouses,
    warehouseBreakdown,
    availableReports: state.availableReports,
    status: state.status,
    error: state.error,
  };
}
