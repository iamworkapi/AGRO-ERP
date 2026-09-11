import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchInvoicesThunk = createAsyncThunk("sales/fetchInvoices", api.fetchInvoices);
export const createInvoiceThunk = createAsyncThunk("sales/createInvoice", api.createInvoice);
export const directSaleThunk = createAsyncThunk("sales/directSale", api.directSaleToVendor);

const initialState = {
  invoices: [],
  status: "idle",
  error: null,
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoicesThunk.pending, (state) => { state.status = "loading"; })
      .addCase(fetchInvoicesThunk.fulfilled, (state, action) => { state.status = "succeeded"; state.invoices = action.payload; })
      .addCase(fetchInvoicesThunk.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; })
      .addCase(createInvoiceThunk.fulfilled, (state, action) => { state.invoices.unshift(action.payload); })
      .addCase(directSaleThunk.fulfilled, (state, action) => { state.invoices.unshift(action.payload); });
  },
});

export default salesSlice.reducer;
