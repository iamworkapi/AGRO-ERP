import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWeighmentSlipsThunk,
  fetchDeductionSlabsThunk,
  createWeighmentSlipThunk,
} from "./weighmentSlice";

export function useWeighment() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.weighment);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchWeighmentSlipsThunk());
      dispatch(fetchDeductionSlabsThunk());
    }
  }, [state.status, dispatch]);

  return {
    slips: state.slips,
    slabs: state.slabs,
    status: state.status,
    error: state.error,
    addWeighmentSlip: (payload) => dispatch(createWeighmentSlipThunk(payload)),
  };
}
