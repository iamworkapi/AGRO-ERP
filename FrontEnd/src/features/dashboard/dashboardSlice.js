import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchOverviewThunk = createAsyncThunk("dashboard/fetchOverview", async (warehouseId, { rejectWithValue }) => {
  try {
    return await api.fetchOverview(warehouseId);
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error?.message || err.message || "Failed to load dashboard overview");
  }
});

const initialState = {
  isWarehouseScoped: false,
  currentWarehouse: null,
  allWarehouses: [],
  kpis: {},
  buyerStockTable: [],
  buyerFulfillment: [],
  vendorSummary: [],
  warehouseDetails: [],
  recentActivity: [],
  recentDispatches: [],
  recentCollections: [],
  staffOnDuty: [],
  godownsList: [],
  inflowTrend: [],
  commodityBreakdown: [],
  alertSummary: [],
  status: "idle",
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboardStatus: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverviewThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOverviewThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        Object.assign(state, action.payload);
      })
      .addCase(fetchOverviewThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { resetDashboardStatus } = dashboardSlice.actions;
export default dashboardSlice.reducer;

