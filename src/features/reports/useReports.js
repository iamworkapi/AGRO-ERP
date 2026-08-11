import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportStatsThunk, fetchAvailableReportsThunk } from "./reportsSlice";

export function useReports() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.reports);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchReportStatsThunk());
      dispatch(fetchAvailableReportsThunk());
    }
  }, [state.status, dispatch]);

  return {
    stats: state.stats,
    availableReports: state.availableReports,
    status: state.status,
    error: state.error,
  };
}
