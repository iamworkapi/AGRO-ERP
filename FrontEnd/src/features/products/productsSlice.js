import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchProductsThunk = createAsyncThunk("products/fetchAll", api.fetchProducts);
export const createProductThunk = createAsyncThunk("products/create", api.createProduct);
export const updateProductThunk = createAsyncThunk("products/update", async ({ id, payload }, thunkAPI) => {
  return api.updateProduct(id, payload);
});
export const deleteProductThunk = createAsyncThunk("products/delete", async (id, thunkAPI) => {
  await api.deleteProduct(id);
  return id;
});

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state) => { state.status = "loading"; })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export default productsSlice.reducer;
