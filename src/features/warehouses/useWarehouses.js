import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWarehousesThunk, createWarehouseThunk } from "./warehousesSlice";
import * as api from "./api";

export function useWarehouses() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.warehouses);

  useEffect(() => {
    if (state.status === "idle") {
      dispatch(fetchWarehousesThunk());
    }
  }, [state.status, dispatch]);

  // Derived from the single warehouses list (each warehouse already carries
  // its admin/supervisor) instead of separate network calls - one fetch,
  // one source of truth, no risk of the two views drifting apart.
  const admins = useMemo(
    () =>
      state.list
        .filter((w) => w.admin)
        .map((w) => ({ name: w.admin, warehouse: w.name, warehouseId: w.id, phone: w.adminPhone || "—", email: w.adminEmail || "—" })),
    [state.list]
  );
  const supervisors = useMemo(
    () =>
      state.list
        .filter((w) => w.supervisor)
        .map((w) => ({
          name: w.supervisor,
          warehouse: w.name,
          warehouseId: w.id,
          reportsTo: w.admin || "—",
          phone: w.supervisorPhone || "—",
          email: w.supervisorEmail || "—",
        })),
    [state.list]
  );

  return {
    warehouses: state.list,
    admins,
    supervisors,
    status: state.status,
    error: state.error,
    addWarehouse: (payload) => dispatch(createWarehouseThunk(payload)),
  };
}

// Powers the Create Warehouse form's admin/supervisor pickers: active
// profiles with the right role that aren't already running another
// warehouse. Kept separate from useWarehouses() above - this is transient
// form data, not shared app state, so plain component state is enough.
export function useAvailableWarehouseStaff() {
  const [admins, setAdmins] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    Promise.all([api.fetchAvailableWarehouseAdmins(), api.fetchAvailableWarehouseSupervisors()])
      .then(([availableAdmins, availableSupervisors]) => {
        if (cancelled) return;
        setAdmins(availableAdmins);
        setSupervisors(availableSupervisors);
        setStatus("succeeded");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.error?.message || err.message);
        setStatus("failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { admins, supervisors, status, error };
}
