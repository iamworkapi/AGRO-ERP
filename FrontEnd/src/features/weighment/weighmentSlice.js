import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchWeighmentSlipsThunk = createAsyncThunk("weighment/fetchSlips", api.fetchWeighmentSlips);
export const fetchDeductionSlabsThunk = createAsyncThunk("weighment/fetchSlabs", api.fetchDeductionSlabs);
export const createWeighmentSlipThunk = createAsyncThunk("weighment/createSlip", api.createWeighmentSlip);

const initialState = {
  slips: [],
  slabs: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const weighmentSlice = createSlice({
  name: "weighment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeighmentSlipsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWeighmentSlipsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.slips = action.payload;
      })
      .addCase(fetchWeighmentSlipsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchDeductionSlabsThunk.fulfilled, (state, action) => {
        state.slabs = action.payload;
      })
      .addCase(createWeighmentSlipThunk.fulfilled, (state, action) => {
        state.slips.unshift(action.payload);
      });
  },
});

export default weighmentSlice.reducer;
