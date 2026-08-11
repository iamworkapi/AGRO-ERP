import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInvoicesThunk, createInvoiceThunk } from "./salesSlice";

export function useSales() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.sales);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchInvoicesThunk());
    }
  }, [state.status, dispatch]);

  return {
    invoices: state.invoices,
    status: state.status,
    error: state.error,
    addInvoice: (payload) => dispatch(createInvoiceThunk(payload)),
  };
}
