import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchSummaryStatsThunk = createAsyncThunk("dashboard/fetchSummaryStats", api.fetchSummaryStats);
export const fetchWarehouseOverviewThunk = createAsyncThunk("dashboard/fetchWarehouseOverview", api.fetchWarehouseOverview);
export const fetchRecentActivityThunk = createAsyncThunk("dashboard/fetchRecentActivity", api.fetchRecentActivity);
export const fetchMoistureSnapshotThunk = createAsyncThunk("dashboard/fetchMoistureSnapshot", api.fetchMoistureSnapshot);

const initialState = {
  summaryStats: [],
  warehouses: [],
  recentActivity: [],
  moistureSnapshot: null,
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSummaryStatsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSummaryStatsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.summaryStats = action.payload;
      })
      .addCase(fetchSummaryStatsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchWarehouseOverviewThunk.fulfilled, (state, action) => {
        state.warehouses = action.payload;
      })
      .addCase(fetchRecentActivityThunk.fulfilled, (state, action) => {
        state.recentActivity = action.payload;
      })
      .addCase(fetchMoistureSnapshotThunk.fulfilled, (state, action) => {
        state.moistureSnapshot = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
