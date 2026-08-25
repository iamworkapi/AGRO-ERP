import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerStatsThunk, fetchCustomersThunk, createCustomerThunk } from "./customersSlice";

export function useCustomers() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.customers);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchCustomerStatsThunk());
      dispatch(fetchCustomersThunk());
    }
  }, [state.status, dispatch]);

  return {
    stats: state.stats,
    customers: state.list,
    status: state.status,
    error: state.error,
    addCustomer: (payload) => dispatch(createCustomerThunk(payload)),
  };
}
