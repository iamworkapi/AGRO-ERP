import { useCallback, useEffect, useState } from "react";
import * as api from "./api";

export function usePayrollSlips(warehouseId, year, month) {
  const [slips, setSlips] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setStatus("loading");
    api
      .fetchPayrollSlips(warehouseId, year, month)
      .then((data) => {
        setSlips(data);
        setStatus("succeeded");
      })
      .catch((err) => {
        setError(err?.response?.data?.error?.message || err.message);
        setStatus("failed");
      });
  }, [warehouseId, year, month]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { slips, status, error, reload };
}
