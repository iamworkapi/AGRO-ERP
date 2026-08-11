import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function useItems(warehouseId) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setStatus("loading");
    api
      .fetchItems(warehouseId)
      .then((data) => {
        setItems(data);
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

  async function addItem(payload) {
    const created = await api.createItem(payload);
    setItems((prev) => [created, ...prev]);
    return created;
  }

  async function removeItem(id) {
    await api.deleteItem(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  return { items, status, error, reload, addItem, removeItem };
}
