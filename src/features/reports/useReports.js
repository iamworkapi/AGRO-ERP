import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  resetError,
  selectDashboardStats,
  selectReportsError,
  selectStockStatus,
  selectAttendanceStatus,
  selectMoistureStatus,
  selectFinancialStatus,
  selectOutstandingStatus,
} from "./reportsSlice";

export function useReports() {
  const dispatch = useDispatch();
  const stats = useSelector(selectDashboardStats);
  const error = useSelector(selectReportsError);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const statuses = [
    useSelector(selectStockStatus),
    useSelector(selectAttendanceStatus),
    useSelector(selectMoistureStatus),
    useSelector(selectFinancialStatus),
    useSelector(selectOutstandingStatus),
  ];

  const status = statuses.some((s) => s === "loading") ? "loading"
    : statuses.some((s) => s === "failed") ? "failed"
    : "idle";

  return { stats, status, error, resetError: () => dispatch(resetError()) };
}
