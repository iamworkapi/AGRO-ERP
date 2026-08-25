import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRolesThunk,
  fetchAuditLogThunk,
  fetchOrgProfileThunk,
  createRoleThunk,
  updateOrgProfileThunk,
} from "./settingsSlice";

export function useSettings() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.settings);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchRolesThunk());
      dispatch(fetchAuditLogThunk());
      dispatch(fetchOrgProfileThunk());
    }
  }, [state.status, dispatch]);

  return {
    roles: state.roles,
    auditLog: state.auditLog,
    orgProfile: state.orgProfile,
    status: state.status,
    error: state.error,
    addRole: (payload) => dispatch(createRoleThunk(payload)),
    updateOrgProfile: (payload) => dispatch(updateOrgProfileThunk(payload)),
  };
}
