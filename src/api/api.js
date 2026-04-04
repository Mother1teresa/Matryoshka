import axios from "axios"
import { useAuthStore } from "/src/stores/authStore.js" 
import { notify } from "/src/utils/notify.js";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
})
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const auth = useAuthStore();
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Критическая ошибка сессии — сразу на выход
    if (code === "SESSION_EXPIRED") {
      auth.logout();
      notify("Сессия истекла. Войдите заново.", "error");
      return Promise.reject(error);
    }

    // Ошибка 401 — пытаемся обновить токен (если это не сам запрос на рефреш)
    if (status === 401 && !originalRequest._retry && !originalRequest.url.includes('/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest)).catch(err => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await auth.refreshToken();
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        auth.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);