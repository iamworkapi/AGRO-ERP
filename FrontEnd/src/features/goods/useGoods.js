import { useDispatch, useSelector } from "react-redux";
import { useEffect, useCallback } from "react";
import { fetchGoodsThunk, createGoodsThunk, updateGoodsStatusThunk, deleteGoodsThunk } from "./goodsSlice";

export function useGoods() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.goods);

  useEffect(() => { dispatch(fetchGoodsThunk()); }, [dispatch]);

  const add = useCallback((payload) => dispatch(createGoodsThunk(payload)).unwrap(), [dispatch]);
  const changeStatus = useCallback((id, status) => dispatch(updateGoodsStatusThunk({ id, status })).unwrap(), [dispatch]);
  const remove = useCallback((id) => dispatch(deleteGoodsThunk(id)).unwrap(), [dispatch]);

  return { items, status, error, add, changeStatus, remove };
}
