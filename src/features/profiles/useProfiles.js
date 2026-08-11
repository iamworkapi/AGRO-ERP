import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

// Plain component state, not Redux - this is the Users page's own data,
// not shared across the app the way warehouses/auth are (see
// useAvailableWarehouseStaff for the same pattern elsewhere).
export function useProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setStatus("loading");
    return api
      .fetchProfiles()
      .then((data) => {
        setProfiles(data);
        setStatus("succeeded");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("failed");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createProfile(payload) {
    const created = await api.createProfile(payload);
    setProfiles((prev) => [created, ...prev]);
    return created;
  }

  async function approveProfile(id) {
    const updated = await api.approveProfile(id);
    setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  async function updateProfileStatus(id, status) {
    const updated = await api.updateProfileStatus(id, status);
    setProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }

  return { profiles, status, error, reload: load, createProfile, approveProfile, updateProfileStatus };
}
