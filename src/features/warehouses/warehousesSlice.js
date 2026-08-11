import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchWarehousesThunk = createAsyncThunk("warehouses/fetchAll", api.fetchWarehouses);
export const createWarehouseThunk = createAsyncThunk("warehouses/create", api.createWarehouse);

const initialState = {
  list: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const warehousesSlice = createSlice({
  name: "warehouses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehousesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWarehousesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchWarehousesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createWarehouseThunk.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export default warehousesSlice.reducer;
