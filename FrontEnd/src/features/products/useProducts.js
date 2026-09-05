import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  fetchProductsThunk,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
} from "./productsSlice";

export function useProducts() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.products);

  const load = useCallback(() => dispatch(fetchProductsThunk()), [dispatch]);

  const add = useCallback(
    (payload) => dispatch(createProductThunk(payload)).unwrap(),
    [dispatch]
  );

  const update = useCallback(
    ({ id, payload }) => dispatch(updateProductThunk({ id, payload })).unwrap(),
    [dispatch]
  );

  const remove = useCallback((id) => dispatch(deleteProductThunk(id)).unwrap(), [dispatch]);

  return { items, status, error, load, add, update, remove };
}
