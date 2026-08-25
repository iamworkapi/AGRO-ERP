import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchAttendanceStatsThunk = createAsyncThunk("attendance/fetchStats", api.fetchAttendanceStats);
export const fetchAttendanceRecordsThunk = createAsyncThunk("attendance/fetchRecords", api.fetchAttendanceRecords);
export const fetchEmployeeLocationsThunk = createAsyncThunk("attendance/fetchLocations", api.fetchEmployeeLocations);
export const createAttendanceRecordThunk = createAsyncThunk("attendance/createRecord", api.createAttendanceRecord);
export const markAttendancePresentThunk = createAsyncThunk("attendance/markPresent", api.markAttendancePresent);

const initialState = {
  stats: [],
  records: [],
  locations: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
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
      .addCase(fetchAttendanceStatsThunk.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchEmployeeLocationsThunk.fulfilled, (state, action) => {
        state.locations = action.payload;
      })
      .addCase(createAttendanceRecordThunk.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
      })
      .addCase(markAttendancePresentThunk.fulfilled, (state, action) => {
        if (!action.payload) return;
        const idx = state.records.findIndex((r) => r.employee === action.payload.employee);
        if (idx !== -1) state.records[idx] = action.payload;
      });
  },
});

export default attendanceSlice.reducer;
