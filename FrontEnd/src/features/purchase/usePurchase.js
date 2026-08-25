import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPurchaseOrdersThunk,
  fetchVendorLedgerThunk,
  createPurchaseOrderThunk,
} from "./purchaseSlice";

export function usePurchase() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.purchase);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchPurchaseOrdersThunk());
      dispatch(fetchVendorLedgerThunk());
    }
  }, [state.status, dispatch]);

  return {
    orders: state.orders,
    vendorLedger: state.vendorLedger,
    status: state.status,
    error: state.error,
    addPurchaseOrder: (payload) => dispatch(createPurchaseOrderThunk(payload)),
  };
}
