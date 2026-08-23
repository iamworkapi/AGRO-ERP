import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchAttendanceRecordsThunk = createAsyncThunk("attendance/fetchRecords", api.fetchAttendanceRecords);
export const createAttendanceRecordThunk = createAsyncThunk("attendance/createRecord", api.createAttendanceRecord);
export const markAttendancePresentThunk = createAsyncThunk("attendance/markPresent", api.markAttendancePresent);

const initialState = {
  records: [],
  stats: null,
  status: "idle",
  error: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceRecordsThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAttendanceRecordsThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.records = action.payload;
      })
      .addCase(fetchAttendanceRecordsThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createAttendanceRecordThunk.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
      })
      .addCase(markAttendancePresentThunk.fulfilled, (state, action) => {
        if (!action.payload) return;
        const idx = state.records.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.records[idx] = action.payload;
      });
  },
});

export default attendanceSlice.reducer;
