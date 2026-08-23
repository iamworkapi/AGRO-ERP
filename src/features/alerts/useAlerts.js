import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchExceptionsThunk, resolveExceptionThunk } from "./alertsSlice";

export function useAlerts() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.alerts);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchExceptionsThunk());
    }
  }, [state.status, dispatch]);

  return {
    exceptions: state.exceptions,
    status: state.status,
    error: state.error,
    resolveException: (id) => dispatch(resolveExceptionThunk(id)),
  };
}
