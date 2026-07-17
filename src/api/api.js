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

// Проверяем, является ли токен anonymous (для диагностики)
const isAnonymousToken = () => {
  return false; // Заглушка, реальная проверка через API
};

// ОБРАБОТКА REFRESH КУК
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

    // Перехват 500 ошибки из-за зависшей анонимной сессии
    if (status === 500 && url.includes('/media/create')) {
      const hasAnonymousPayload = originalRequest.data && 
        JSON.stringify(originalRequest.data).includes("anonymousUser");
      
      if (hasAnonymousPayload) {
        console.warn("⚠️ anonymousUser detected in payload, logging out");
        auth.logout();
        notify("Ошибка авторизации. Войдите заново.", "error");
        return Promise.reject(error);
      }
    }

    // проверка на anonymous токен в ответе
    if (status === 403 || status === 401) {
      const responseData = error.response?.data;
      if (responseData?.message?.includes('anonymous') || 
          responseData?.error?.includes('anonymous') ||
          responseData?.sub === 'anonymousUser') {
        console.warn("⚠️ Anonymous token detected, logging out");
        auth.logout();
        notify("Ошибка авторизации. Войдите заново.", "error");
        return Promise.reject(error);
      }
    }

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
      console.warn("⛔ Слишком много попыток рефреша кук.");
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
        processQueue(null);
        return api(originalRequest);
      }
      throw new Error("Refresh failed");
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