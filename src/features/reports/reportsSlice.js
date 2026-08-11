import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchReportStatsThunk = createAsyncThunk("reports/fetchStats", api.fetchReportStats);
export const fetchAvailableReportsThunk = createAsyncThunk("reports/fetchAvailable", api.fetchAvailableReports);

const initialState = {
  stats: [],
  availableReports: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
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
      })
      .addCase(fetchReportStatsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload;
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
