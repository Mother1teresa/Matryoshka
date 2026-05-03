import axios from "axios";
import { notify } from "/src/utils/notify.js";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};
api.interceptors.request.use(
  (config) => {
    if (config.headers.Authorization) return config;
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      try {
        const { user } = JSON.parse(savedAuth);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error("Ошибка парсинга токена для заголовков", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { useAuthStore } = await import("/src/stores/authStore.js");
    const auth = useAuthStore();
    const originalRequest = error.config;
    const status = error.response?.status;
    // const code = error.response?.data?.code;
    const data = error.response?.data;
    if (data?.code === "SESSION_EXPIRED"){
      auth.logout();
      notify("Сессия истекла. Войдите заново.", "error");
      return Promise.reject(error);
    }
    const isRefreshRequest = originalRequest.url.includes("/auth/refresh");
    // Ошибка 401 — пытаемся обновить токен (если это не сам запрос на рефреш)
    if (status === 401 && !originalRequest._retry && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const success = await auth.refreshToken();

        isRefreshing = false;
        if (success) {
          processQueue(null);
          return api(originalRequest);
        } else {
          auth.logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        auth.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
