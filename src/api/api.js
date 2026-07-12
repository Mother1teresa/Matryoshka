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
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

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
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error("Ошибка парсинга токена для заголовков", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { useAuthStore } = await import("/src/stores/authStore.js");
    const auth = useAuthStore();
    const originalRequest = error.config;
    const status = error.response?.status;
    const data = error.response?.data;

    // SESSION_EXPIRED — сразу logout
    if (data?.code === "SESSION_EXPIRED") {
      auth.logout();
      notify("Сессия истекла. Войдите заново.", "error");
      return Promise.reject(error);
    }

    const isRefreshRequest = originalRequest.url.includes("/auth/refresh");

    // Не 401 или уже ретраили или это сам запрос на рефреш
    if (status !== 401 || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    // Защита от бесконечного цикла: не более 3 попыток рефреша подряд
    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.warn("⛔ Слишком много попыток рефреша");
      refreshAttempts = 0;
      auth.logout();
      notify("Сессия истекла. Войдите заново.", "error");
      return Promise.reject(error);
    }

    // Очередь: другой запрос уже рефрешит — ждём
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;
    refreshAttempts++;

    try {
      const success = await auth.refreshToken();

      if (success) {
        refreshAttempts = 0; // сбрасываем при успехе
        processQueue(null);
        return api(originalRequest);
      } else {
        throw new Error("Refresh returned false");
      }
    } catch (refreshError) {
      processQueue(refreshError);
      auth.logout();
      notify("Сессия истекла. Войдите заново.", "error");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// Сброс счётчика при логине
export const resetRefreshCooldown = () => {
  refreshAttempts = 0;
};