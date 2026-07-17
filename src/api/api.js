import axios from "axios";
import { notify } from "/src/utils/notify.js";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

// Эндпоинты, на которых не нужен ни Bearer, ни рефреш
const AUTH_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/check-code",
  "/auth/sendsms",
];
const isAuthUrl = (url = "") => AUTH_URLS.some((p) => url.includes(p));

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

// 1. ПОДКЛЮЧАЕМ ПРОВЕРКУ И ПОДСТАНОВКУ ТОКЕНА ДЛЯ КАЖДОГО ЗАПРОСА
api.interceptors.request.use(
  (config) => {
    if (config.headers.Authorization) return config;
    if (isAuthUrl(config.url)) return config;

    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        const token = parsed?.token || parsed?.user?.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Ошибка парсинга токена для заголовков", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. ОБРАБОТКА ИСТЕЧЕНИЯ ТОКЕНА И REFRESH
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { useAuthStore } = await import("/src/stores/authStore.js");
    const auth = useAuthStore();

    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);
    const status = error.response?.status;
    const data = error.response?.data;
    const url = originalRequest.url || "";

    if (data?.code === "SESSION_EXPIRED") {
      auth.logout();
      notify("Сессия истекла. Войдите заново.", "error");
      return Promise.reject(error);
    }
    if (isAuthUrl(url)) {
      if (url.includes("/auth/refresh")) {
        auth.logout();
        notify("Сессия истекла. Войдите заново.", "error");
      }
      return Promise.reject(error);
    }
    if ((status !== 401 && status !== 403) || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.warn("⛔ Слишком много попыток рефреша. Принудительный выход.");
      refreshAttempts = 0;
      auth.logout();
      notify("Сессия истекла. Войдите заново.", "error");
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          originalRequest._retry = true;
          const savedAuth = localStorage.getItem("auth");
          if (savedAuth) {
            const parsed = JSON.parse(savedAuth);
            const token = parsed?.token || parsed?.user?.token;
            if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }
    originalRequest._retry = true;
    isRefreshing = true;
    refreshAttempts++;

    try {
      const success = await auth.refreshToken();
      if (success) {
        refreshAttempts = 0;
        const savedAuth = localStorage.getItem("auth");
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          const token = parsed?.token || parsed?.user?.token;
          if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        processQueue(null);
        return api(originalRequest);
      }
      throw new Error("Refresh returned false");
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

export const resetRefreshCooldown = () => {
  refreshAttempts = 0;
};
