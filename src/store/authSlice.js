import { createSlice } from "@reduxjs/toolkit";

// Lấy token từ localStorage khi khởi động app (persist đơn giản)
const initialState = {
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  user: JSON.parse(localStorage.getItem("user") || "null"),
  // role: "USER" | "ADMIN" | null
  role: localStorage.getItem("role") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Gọi sau khi login thành công
    setCredentials: (state, action) => {
      const { accessToken, refreshToken, role, user } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.role = role;
      state.user = user ?? state.user;
      state.isAuthenticated = true;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("role", role);
      if (user) localStorage.setItem("user", JSON.stringify(user));
    },

    // Gọi khi refresh token thành công
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem("accessToken", action.payload);
    },

    // Gọi sau khi lấy profile (/user/me)
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    // Gọi khi logout hoặc refresh thất bại
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, setAccessToken, setUser, clearAuth } =
  authSlice.actions;

// Selectors
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectRefreshToken = (state) => state.auth.refreshToken;
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.role === "ADMIN";

export default authSlice.reducer;
