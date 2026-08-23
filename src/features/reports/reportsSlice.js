import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchDashboardStats = createAsyncThunk("reports/fetchDashboardStats", (warehouseId) =>
  api.fetchDashboardStats(warehouseId)
);

export const fetchStockValuation = createAsyncThunk("reports/fetchStockValuation", ({ warehouseId, from, to, page = 1, limit = 200 } = {}) =>
  api.fetchStockValuation(warehouseId, { from, to, page, limit })
);

export const fetchAttendanceSummaryReport = createAsyncThunk("reports/fetchAttendanceSummaryReport", ({ warehouseId, month } = {}) =>
  api.fetchAttendanceSummaryReport(warehouseId, month)
);

export const fetchMoistureTrend = createAsyncThunk("reports/fetchMoistureTrend", ({ warehouseId, from, to, groupBy = "day" } = {}) =>
  api.fetchMoistureTrend(warehouseId, { from, to, groupBy })
);

export const fetchPurchaseVsSales = createAsyncThunk("reports/fetchPurchaseVsSales", ({ warehouseId, from, to, groupBy = "month" } = {}) =>
  api.fetchPurchaseVsSales(warehouseId, { from, to, groupBy })
);

export const fetchOutstandingReport = createAsyncThunk("reports/fetchOutstandingReport", (warehouseId) =>
  api.fetchOutstanding(warehouseId)
);

// ─── Slice ────────────────────────────────────────────────────────────────

const initialState = {
  // Dashboard
  dashboardStats: null,
  // Stock valuation
  stockRows: [],
  stockMeta: null,
  stockStatus: "idle",
  // Attendance
  attendanceRows: [],
  attendanceStatus: "idle",
  // Moisture
  moistureRows: [],
  moistureStatus: "idle",
  // Financial
  financialRows: [],
  financialStatus: "idle",
  // Outstanding
  outstandingVendors: [],
  outstandingBuyers: [],
  outstandingStatus: "idle",
  // Shared
  error: null,
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchDashboardStats.pending, (s) => { s.dashboardStats = null; })
      .addCase(fetchDashboardStats.fulfilled, (s, { payload }) => { s.dashboardStats = payload; })
      .addCase(fetchDashboardStats.rejected, (s, { error }) => { s.error = error.message; });

    // Stock valuation
    builder
      .addCase(fetchStockValuation.pending, (s) => { s.stockStatus = "loading"; })
      .addCase(fetchStockValuation.fulfilled, (s, { payload }) => {
        s.stockRows = payload.list;
        s.stockMeta = payload.meta;
        s.stockStatus = "succeeded";
      })
      .addCase(fetchStockValuation.rejected, (s, { error }) => { s.stockStatus = "failed"; s.error = error.message; });

    // Attendance
    builder
      .addCase(fetchAttendanceSummaryReport.pending, (s) => { s.attendanceStatus = "loading"; })
      .addCase(fetchAttendanceSummaryReport.fulfilled, (s, { payload }) => {
        s.attendanceRows = payload;
        s.attendanceStatus = "succeeded";
      })
      .addCase(fetchAttendanceSummaryReport.rejected, (s, { error }) => { s.attendanceStatus = "failed"; s.error = error.message; });

    // Moisture
    builder
      .addCase(fetchMoistureTrend.pending, (s) => { s.moistureStatus = "loading"; })
      .addCase(fetchMoistureTrend.fulfilled, (s, { payload }) => {
        s.moistureRows = payload;
        s.moistureStatus = "succeeded";
      })
      .addCase(fetchMoistureTrend.rejected, (s, { error }) => { s.moistureStatus = "failed"; s.error = error.message; });

    // Financial
    builder
      .addCase(fetchPurchaseVsSales.pending, (s) => { s.financialStatus = "loading"; })
      .addCase(fetchPurchaseVsSales.fulfilled, (s, { payload }) => {
        s.financialRows = payload;
        s.financialStatus = "succeeded";
      })
      .addCase(fetchPurchaseVsSales.rejected, (s, { error }) => { s.financialStatus = "failed"; s.error = error.message; });

    // Outstanding
    builder
      .addCase(fetchOutstandingReport.pending, (s) => { s.outstandingStatus = "loading"; })
      .addCase(fetchOutstandingReport.fulfilled, (s, { payload }) => {
        s.outstandingVendors = payload.vendors;
        s.outstandingBuyers = payload.customers;
        s.outstandingStatus = "succeeded";
      })
      .addCase(fetchOutstandingReport.rejected, (s, { error }) => { s.outstandingStatus = "failed"; s.error = error.message; });
  },
});

export const resetError = (state) => {
  state.error = null;
};

export const selectReportsError = (s) => s.reports.error;
export const selectDashboardStats = (s) => s.reports.dashboardStats;
export const selectStockRows = (s) => s.reports.stockRows;
export const selectStockMeta = (s) => s.reports.stockMeta;
export const selectStockStatus = (s) => s.reports.stockStatus;
export const selectAttendanceRows = (s) => s.reports.attendanceRows;
export const selectAttendanceStatus = (s) => s.reports.attendanceStatus;
export const selectMoistureRows = (s) => s.reports.moistureRows;
export const selectMoistureStatus = (s) => s.reports.moistureStatus;
export const selectFinancialRows = (s) => s.reports.financialRows;
export const selectFinancialStatus = (s) => s.reports.financialStatus;
export const selectOutstandingVendors = (s) => s.reports.outstandingVendors;
export const selectOutstandingBuyers = (s) => s.reports.outstandingBuyers;
export const selectOutstandingStatus = (s) => s.reports.outstandingStatus;

export default reportsSlice.reducer;