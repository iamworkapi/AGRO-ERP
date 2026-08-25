import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, logoutUser, fetchCurrentUser } from "./api";
import { toast } from "../../utils/toast";

export const loginThunk = createAsyncThunk("auth/login", loginUser);

// Always resolves (never rejected) - the token is already cleared
// client-side by logoutUser()'s finally block regardless of whether the
// server call to revoke it succeeds, so a flaky connection shouldn't be
// able to strand the UI in a logged-in-looking state.
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await logoutUser();
  } catch {
    // best-effort server-side revoke; client-side logout still proceeds
  }
  toast.success("You've been logged out.");
});

// Runs once on app load (see App.jsx). A token surviving in localStorage
// from a previous visit doesn't mean it's still valid - it may have expired
// or been revoked by a logout on another tab/device - so this always
// confirms against GET /auth/me rather than trusting the stored token.
export const bootstrapAuthThunk = createAsyncThunk("auth/bootstrap", async (_, { rejectWithValue }) => {
  const hadToken = Boolean(localStorage.getItem("accessToken"));
  if (!hadToken) return rejectWithValue(null);
  try {
    return await fetchCurrentUser();
  } catch (err) {
    localStorage.removeItem("accessToken");
    toast.info("Your previous session has expired. Please sign in again.");
    return rejectWithValue(err.message);
  }
});

const initialState = {
  user: null,
  isAuthenticated: false,
  bootstrapped: false, // true once the initial /auth/me check has resolved (either way)
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.isAuthenticated = false;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
      })
      .addCase(bootstrapAuthThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.bootstrapped = true;
      })
      .addCase(bootstrapAuthThunk.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.bootstrapped = true;
      });
  },
});

export const { updateUser } = authSlice.actions;

export default authSlice.reducer;
