import api from "../lib/axios"; // đường dẫn đến file axios đã cấu hình

// ─── Đăng nhập ───────────────────────────────────────────────
// POST /auth/login
// Response: { status, message, accessToken, refreshToken, role }
export const loginApi = (email, password) =>
  api.post("/auth/login", { email, password });

// ─── Đăng ký ─────────────────────────────────────────────────
// POST /auth/register
// Response: { status, message }
export const registerApi = (data) => api.post("/auth/register", data);
// data = { email, password, fullName, phone? }

// ─── Đăng xuất ───────────────────────────────────────────────
// POST /auth/logout  (cần Bearer token)
export const logoutApi = () => api.post("/auth/logout");

export const refreshTokenApi = (refreshToken) =>
  api.post("/auth/refresh", { refreshToken });

export const forgotPasswordApi = (email) => api.post("/auth/forgot", { email });

export const resetPasswordApi = (token, password) =>
  api.post("/auth/reset", { token, password });
