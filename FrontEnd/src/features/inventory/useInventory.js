import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInventoryStatsThunk,
  fetchItemsThunk,
  fetchLowStockAlertsThunk,
  createItemThunk,
} from "./inventorySlice";
import { useAuth } from "../../hooks/useAuth";
import { useWarehouses } from "../warehouses/useWarehouses";

// Inventory has no real backend yet (items/lowStockAlerts are still mock),
// so warehouse scoping happens here instead of server-side. GET /warehouses
// is already scoped to the caller's own warehouse for anyone below Super
// Admin (see warehouse.service.js listWarehouses) - that's the one real,
// ID-based fact we trust, so every mock record shown to a Supervisor or
// Warehouse Admin gets stamped with their real warehouse name rather than
// matched (or mismatched) against the mock data's fictional warehouse names.
export function useInventory() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.inventory);
  const { user } = useAuth();
  const isScopedRole = user?.roleKey === "supervisor" || user?.roleKey === "warehouse_admin";
  const { warehouses: ownScopedWarehouses } = useWarehouses();
  const myWarehouseName = isScopedRole ? ownScopedWarehouses[0]?.name : null;

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchInventoryStatsThunk());
      dispatch(fetchItemsThunk());
      dispatch(fetchLowStockAlertsThunk());
    }
  }, [state.status, dispatch]);

  const items = useMemo(() => {
    if (!isScopedRole) return state.items;
    if (!myWarehouseName) return [];
    return state.items.map((item) => ({ ...item, warehouse: myWarehouseName }));
  }, [state.items, isScopedRole, myWarehouseName]);

  const lowStockAlerts = useMemo(() => {
    if (!isScopedRole) return state.lowStockAlerts;
    if (!myWarehouseName) return [];
    return state.lowStockAlerts.map((alert) => ({ ...alert, warehouse: myWarehouseName }));
  }, [state.lowStockAlerts, isScopedRole, myWarehouseName]);

  const stats = useMemo(() => {
    if (!isScopedRole) return state.stats;
    return [
      { label: "Total SKUs", value: String(items.length), trend: `at ${myWarehouseName || "your warehouse"}` },
      { label: "Total Stock Value", value: state.stats[1]?.value ?? "—", trend: "this warehouse" },
      { label: "Low Stock Items", value: String(lowStockAlerts.length), trend: "below reorder level" },
      { label: "Batches Ageing > 60 Days", value: state.stats[3]?.value ?? "0", trend: "flagged for review" },
    ];
  }, [state.stats, isScopedRole, items.length, lowStockAlerts.length, myWarehouseName]);

  return {
    stats,
    items,
    lowStockAlerts,
    isScopedRole,
    myWarehouseName,
    status: state.status,
    error: state.error,
    addItem: (payload) => dispatch(createItemThunk(payload)),
  };
}
