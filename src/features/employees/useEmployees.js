import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployeesThunk,
  fetchTasksThunk,
  fetchLeaveRequestsThunk,
  createEmployeeThunk,
  updateEmployeeThunk,
  deactivateEmployeeThunk,
  approveLeaveThunk,
  rejectLeaveThunk,
  createLeaveThunk,
  createTaskThunk,
  completeTaskThunk,
} from "./employeesSlice";

export function useEmployees() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.employees);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchEmployeesThunk());
      dispatch(fetchTasksThunk());
      dispatch(fetchLeaveRequestsThunk());
    }
  }, [state.status, dispatch]);

  return {
    employees: state.employees,
    tasks: state.tasks,
    leaveRequests: state.leaveRequests,
    status: state.status,
    error: state.error,
    addEmployee: (payload) => dispatch(createEmployeeThunk(payload)),
    updateEmployee: (id, payload) => dispatch(updateEmployeeThunk({ id, ...payload })),
    deactivateEmployee: (id) => dispatch(deactivateEmployeeThunk(id)),
    approveLeave: (employee) => dispatch(approveLeaveThunk(employee)),
    rejectLeave: (employee) => dispatch(rejectLeaveThunk(employee)),
    createLeave: (payload) => dispatch(createLeaveThunk(payload)),
    createTask: (payload) => dispatch(createTaskThunk(payload)),
    completeTask: (idOrTitle) => dispatch(completeTaskThunk(idOrTitle)),
  };
}
