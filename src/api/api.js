import axios from "axios";
import { notify } from "/src/utils/notify.js";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  // headers: {
  //   "Content-Type": "application/json",
  // },
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

api.interceptors.request.use(
  (config) => {
    // if (config.headers.Authorization) return config;
    // if (isAuthUrl(config.url)) return config;
    // const savedAuth = localStorage.getItem("auth");
    // if (savedAuth) {
    //   try {
    //     const { user } = JSON.parse(savedAuth);
    //     if (user?.token) {
    //       config.headers.Authorization = `Bearer ${user.token}`;
    //     }
    //   } catch (e) {
    //     console.error("Ошибка парсинга токена для заголовков", e);
    //   }
    // }
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
      console.warn("⛔ Слишком много попыток рефреша");
      refreshAttempts = 0;
      auth.logout();
      notify("Сессия истекла. Войдите заново.", "error");
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        originalRequest._retry = true;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;
    refreshAttempts++;

    try {
      const success = await auth.refreshToken();

      if (success) {
        refreshAttempts = 0;
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