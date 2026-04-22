import axios from "axios";
import { store } from "../store";
import {
  selectAccessToken,
  selectRefreshToken,
  setAccessToken,
  clearAuth,
} from "../store/authSlice";

// ============================================================
// AXIOS INSTANCE
// ============================================================
const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8081/api"
      : "/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor: lấy token từ Redux store ──────────
api.interceptors.request.use((config) => {
  const token = selectAccessToken(store.getState());
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: auto refresh khi 401 ─────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;

    // Gán lại message thân thiện
    error.message =
      error?.response?.data?.message || error.message || "Có lỗi xảy ra";

    // Nếu không phải 401, hoặc đã retry rồi → bỏ qua
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Đang có request khác đang refresh → queue lại
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = selectRefreshToken(store.getState());
      const { data } = await axios.post(
        `${
          import.meta.env.MODE === "development"
            ? "http://localhost:8081/api"
            : "/api"
        }/auth/refresh`,
        { refreshToken }
      );

      const newToken = data.accessToken;

      // Cập nhật token mới vào Redux store + localStorage
      store.dispatch(setAccessToken(newToken));

      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      // Refresh cũng thất bại → logout
      store.dispatch(clearAuth());
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
