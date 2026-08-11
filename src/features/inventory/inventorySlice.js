import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchInventoryStatsThunk = createAsyncThunk("inventory/fetchStats", api.fetchInventoryStats);
export const fetchItemsThunk = createAsyncThunk("inventory/fetchItems", api.fetchItems);
export const fetchLowStockAlertsThunk = createAsyncThunk("inventory/fetchLowStock", api.fetchLowStockAlerts);
export const createItemThunk = createAsyncThunk("inventory/createItem", api.createItem);

const initialState = {
  stats: [],
  items: [],
  lowStockAlerts: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItemsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchItemsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchItemsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchInventoryStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchLowStockAlertsThunk.fulfilled, (state, action) => {
        state.lowStockAlerts = action.payload;
      })
      .addCase(createItemThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export default inventorySlice.reducer;
