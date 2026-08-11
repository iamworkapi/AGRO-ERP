import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./api";

export const fetchRolesThunk = createAsyncThunk("settings/fetchRoles", api.fetchRoles);
export const fetchAuditLogThunk = createAsyncThunk("settings/fetchAuditLog", api.fetchAuditLog);
export const fetchOrgProfileThunk = createAsyncThunk("settings/fetchOrgProfile", api.fetchOrgProfile);
export const createRoleThunk = createAsyncThunk("settings/createRole", api.createRole);
export const updateOrgProfileThunk = createAsyncThunk("settings/updateOrgProfile", api.updateOrgProfile);

const initialState = {
  roles: [],
  auditLog: [],
  orgProfile: null,
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRolesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.roles = action.payload;
      })
      .addCase(fetchRolesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchAuditLogThunk.fulfilled, (state, action) => {
        state.auditLog = action.payload;
      })
      .addCase(fetchOrgProfileThunk.fulfilled, (state, action) => {
        state.orgProfile = action.payload;
      })
      .addCase(createRoleThunk.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      .addCase(updateOrgProfileThunk.fulfilled, (state, action) => {
        state.orgProfile = action.payload;
      });
  },
});

export default settingsSlice.reducer;
