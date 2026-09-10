import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchReportStatsThunk = createAsyncThunk("reports/fetchStats", async (warehouseId) => {
  return await api.fetchReportStats(warehouseId);
});

export const fetchAvailableReportsThunk = createAsyncThunk("reports/fetchAvailable", async () => {
  // Try the backend endpoint, fallback to static list
  try {
    const data = await api.fetchAvailableReports();
    return data;
  } catch {
    return [
      { name: "Warehouse-wise Stock Valuation", format: "PDF / Excel" },
      { name: "Attendance Summary (Monthly)", format: "PDF / Excel" },
      { name: "Moisture & Deduction Trend", format: "PDF / Excel" },
      { name: "Purchase vs Sales Trend", format: "PDF / Excel" },
      { name: "Vendor & Customer Outstanding", format: "PDF / Excel" },
    ];
  }
});

const initialState = {
  stats: [],
  warehouses: [],
  availableReports: [],
  status: "idle",
  error: null,
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportStatsThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchReportStatsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload.stats || [];
        state.warehouses = action.payload.warehouses || [];
      })
      .addCase(fetchReportStatsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchAvailableReportsThunk.fulfilled, (state, action) => {
        state.availableReports = action.payload;
      });
  },
});

export default reportsSlice.reducer;
