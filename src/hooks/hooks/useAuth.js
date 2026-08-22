import { useDispatch, useSelector } from "react-redux";
import { loginThunk, logoutThunk, bootstrapAuthThunk } from "../features/auth/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, bootstrapped, status, error } = useSelector((s) => s.auth);

  return {
    user,
    isAuthenticated,
    bootstrapped,
    status,
    error,
    login: (credentials) => dispatch(loginThunk(credentials)),
    logout: () => dispatch(logoutThunk()),
    bootstrap: () => dispatch(bootstrapAuthThunk()),
  };
}
