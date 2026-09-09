import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function useItems(warehouseId) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reload = useCallback((opts = {}) => {
    setStatus("loading");
    setError(null);
    api
      .fetchItems(warehouseId, opts)
      .then(({ items: list, meta: m }) => {
        setItems(list);
        setMeta(m);
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
    if (meta) setMeta((m) => ({ ...m, total: (m?.total || 0) + 1 }));
    return created;
  }

  async function updateItem(id, payload) {
    const updated = await api.updateItem(id, payload);
    setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    return updated;
  }

  async function removeItem(id) {
    await api.deleteItem(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (meta) setMeta((m) => ({ ...m, total: Math.max((m?.total || 1) - 1, 0) }));
  }

  return { items, meta, status, error, reload, addItem, updateItem, removeItem };
}
