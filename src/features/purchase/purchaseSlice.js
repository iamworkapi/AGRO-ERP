import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchPurchaseOrdersThunk = createAsyncThunk("purchase/fetchOrders", api.fetchPurchaseOrders);
export const fetchVendorLedgerThunk = createAsyncThunk("purchase/fetchVendorLedger", api.fetchVendorLedger);
export const createPurchaseOrderThunk = createAsyncThunk("purchase/createOrder", api.createPurchaseOrder);

const initialState = {
  orders: [],
  vendorLedger: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseOrdersThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPurchaseOrdersThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.orders = action.payload;
      })
      .addCase(fetchPurchaseOrdersThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchVendorLedgerThunk.fulfilled, (state, action) => {
        state.vendorLedger = action.payload;
      })
      .addCase(createPurchaseOrderThunk.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      });
  },
});

export default purchaseSlice.reducer;
