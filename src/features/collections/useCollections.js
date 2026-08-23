import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function useCollections(warehouseId) {
  const [collections, setCollections] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    if (!warehouseId) return;
    setStatus("loading");
    api
      .fetchCollections(warehouseId)
      .then((data) => {
        setCollections(data);
        setStatus("succeeded");
      })
      .catch((err) => {
        setError(err?.response?.data?.error?.message || err.message);
        setStatus("failed");
      });
  }, [warehouseId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function addCollection(payload) {
    const created = await api.createCollection(payload);
    setCollections((prev) => [created, ...prev]);
    return created;
  }

  return { collections, status, error, reload, addCollection };
}
