import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchGoodsThunk = createAsyncThunk("goods/fetchAll", api.fetchGoods);
export const createGoodsThunk = createAsyncThunk("goods/create", api.createGoods);
export const updateGoodsStatusThunk = createAsyncThunk("goods/updateStatus", async ({ id, status }, thunkAPI) => {
  return api.updateGoodsStatus(id, status);
});
export const deleteGoodsThunk = createAsyncThunk("goods/delete", async (id, thunkAPI) => {
  await api.deleteGoods(id);
  return id;
});

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const goodsSlice = createSlice({
  name: "goods",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoodsThunk.pending, (state) => { state.status = "loading"; })
      .addCase(fetchGoodsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchGoodsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createGoodsThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteGoodsThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((g) => g._id !== action.payload);
      });
  },
});

export default goodsSlice.reducer;
