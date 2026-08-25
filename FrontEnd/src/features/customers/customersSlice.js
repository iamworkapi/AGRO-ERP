import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchCustomerStatsThunk = createAsyncThunk("customers/fetchStats", api.fetchCustomerStats);
export const fetchCustomersThunk = createAsyncThunk("customers/fetchAll", api.fetchCustomers);
export const createCustomerThunk = createAsyncThunk("customers/create", api.createCustomer);

const initialState = {
  stats: [],
  list: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomersThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomersThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchCustomersThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchCustomerStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(createCustomerThunk.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export default customersSlice.reducer;
