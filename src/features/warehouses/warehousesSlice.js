import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchWarehousesThunk = createAsyncThunk("warehouses/fetchAll", api.fetchWarehouses);
export const createWarehouseThunk = createAsyncThunk("warehouses/create", api.createWarehouse);
export const updateWarehouseThunk = createAsyncThunk("warehouses/update", async ({ id, payload }) => {
  return await api.updateWarehouse(id, payload);
});
export const deleteWarehouseThunk = createAsyncThunk("warehouses/delete", async (id) => {
  await api.deleteWarehouse(id);
  return id;
});

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
      })
      .addCase(updateWarehouseThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex((w) => String(w.id) === String(action.payload.id));
        if (idx !== -1) {
          state.list[idx] = { ...state.list[idx], ...action.payload };
        }
      })
      .addCase(deleteWarehouseThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((w) => String(w.id) !== String(action.payload));
      });
  },
});

export default warehousesSlice.reducer;
