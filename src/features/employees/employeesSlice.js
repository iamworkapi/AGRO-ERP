import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchEmployeesThunk = createAsyncThunk("employees/fetchAll", api.fetchEmployees);
export const fetchTasksThunk = createAsyncThunk("employees/fetchTasks", api.fetchTasks);
export const fetchLeaveRequestsThunk = createAsyncThunk("employees/fetchLeaveRequests", api.fetchLeaveRequests);
export const createEmployeeThunk = createAsyncThunk("employees/create", api.createEmployee);
export const updateEmployeeThunk = createAsyncThunk("employees/update", api.updateEmployee);
export const deactivateEmployeeThunk = createAsyncThunk("employees/deactivate", api.deactivateEmployee);
export const approveLeaveThunk = createAsyncThunk("employees/approveLeave", api.approveLeave);
export const rejectLeaveThunk = createAsyncThunk("employees/rejectLeave", api.rejectLeave);
export const createLeaveThunk = createAsyncThunk("employees/createLeave", api.createLeaveRequest);
export const createTaskThunk = createAsyncThunk("employees/createTask", api.createTask);
export const completeTaskThunk = createAsyncThunk("employees/completeTask", api.completeTask);

const initialState = {
  employees: [],
  tasks: [],
  leaveRequests: [],
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEmployeesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.employees = action.payload;
      })
      .addCase(fetchEmployeesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchTasksThunk.fulfilled, (state, action) => {
        state.tasks = action.payload;
      })
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(completeTaskThunk.fulfilled, (state, action) => {
        if (!action.payload) return;
        const idx = state.tasks.findIndex((t) => (t.id && t.id === action.payload.id) || t.task === action.payload.task);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(fetchLeaveRequestsThunk.fulfilled, (state, action) => {
        state.leaveRequests = action.payload;
      })
      .addCase(createEmployeeThunk.fulfilled, (state, action) => {
        state.employees.unshift(action.payload);
      })
      .addCase(deactivateEmployeeThunk.fulfilled, (state, action) => {
        const idx = state.employees.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.employees[idx] = action.payload;
      })
      .addCase(updateEmployeeThunk.fulfilled, (state, action) => {
        const idx = state.employees.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.employees[idx] = action.payload;
      })
      .addCase(createLeaveThunk.fulfilled, (state, action) => {
        state.leaveRequests.unshift(action.payload);
      })
      .addCase(approveLeaveThunk.fulfilled, (state, action) => {
        if (!action.payload) return;
        const idx = state.leaveRequests.findIndex((r) => (r.id && r.id === action.payload.id) || r.employee === action.payload.employee);
        if (idx !== -1) state.leaveRequests[idx] = action.payload;
      })
      .addCase(rejectLeaveThunk.fulfilled, (state, action) => {
        if (!action.payload) return;
        const idx = state.leaveRequests.findIndex((r) => (r.id && r.id === action.payload.id) || r.employee === action.payload.employee);
        if (idx !== -1) state.leaveRequests[idx] = action.payload;
      });
  },
});

export default employeesSlice.reducer;
