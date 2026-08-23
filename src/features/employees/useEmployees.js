import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployeesThunk,
  fetchTasksThunk,
  createEmployeeThunk,
  updateEmployeeThunk,
  deactivateEmployeeThunk,
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
    }
  }, [state.status, dispatch]);

  return {
    employees: state.employees,
    tasks: state.tasks,
    status: state.status,
    error: state.error,
    addEmployee: (payload) => dispatch(createEmployeeThunk(payload)),
    updateEmployee: (id, payload) => dispatch(updateEmployeeThunk({ id, ...payload })),
    deactivateEmployee: (id) => dispatch(deactivateEmployeeThunk(id)),
    createTask: (payload) => dispatch(createTaskThunk(payload)),
    completeTask: (idOrTitle) => dispatch(completeTaskThunk(idOrTitle)),
  };
}
