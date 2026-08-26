import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOverviewThunk } from "./dashboardSlice";

export function useDashboard(warehouseId) {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchOverviewThunk(warehouseId));
  }, [warehouseId, dispatch]);

  const reload = useCallback(
    (whId) => dispatch(fetchOverviewThunk(whId !== undefined ? whId : warehouseId)),
    [dispatch, warehouseId]
  );

  return {
    isWarehouseScoped: state.isWarehouseScoped,
    currentWarehouse: state.currentWarehouse,
    allWarehouses: state.allWarehouses,
    kpis: state.kpis,
    buyerStockTable: state.buyerStockTable,
    buyerFulfillment: state.buyerFulfillment,
    vendorSummary: state.vendorSummary,
    warehouseDetails: state.warehouseDetails,
    recentActivity: state.recentActivity,
    recentDispatches: state.recentDispatches,
    recentCollections: state.recentCollections,
    staffOnDuty: state.staffOnDuty,
    godownsList: state.godownsList,
    inflowTrend: state.inflowTrend,
    commodityBreakdown: state.commodityBreakdown,
    alertSummary: state.alertSummary,
    status: state.status,
    error: state.error,
    reload,
  };
}

