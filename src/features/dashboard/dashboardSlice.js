import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../services/apiClient";

export const loadDashboardThunk = createAsyncThunk("dashboard/load", async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get("/reports/dashboard");
    return data.data || {};
  } catch (err) {
    return rejectWithValue(err?.message || "Failed to load dashboard data.");
  }
});

const initialState = {
  summaryStats: [],
  warehouses: [],
  recentActivity: [],
  moistureSnapshot: null,
  status: "idle",
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboardThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadDashboardThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.summaryStats = action.payload.summaryStats || [];
        state.warehouses = action.payload.warehouses || [];
        state.recentActivity = action.payload.recentActivity || [];
        state.moistureSnapshot = action.payload.moistureSnapshot || null;
      })
      .addCase(loadDashboardThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
