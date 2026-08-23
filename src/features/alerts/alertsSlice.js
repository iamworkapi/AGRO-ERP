import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchExceptionsThunk = createAsyncThunk("alerts/fetchAll", api.fetchExceptions);
export const resolveExceptionThunk = createAsyncThunk("alerts/resolve", api.resolveException);

const initialState = {
  exceptions: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExceptionsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExceptionsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.exceptions = action.payload;
      })
      .addCase(fetchExceptionsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(resolveExceptionThunk.fulfilled, (state, action) => {
        if (!action.payload) return;
        const idx = state.exceptions.findIndex((e) => e._id === action.payload._id);
        if (idx !== -1) state.exceptions[idx] = action.payload;
      });
  },
});

export default alertsSlice.reducer;
