import axios from "axios";
import { notify } from "/src/utils/notify.js";

export const authApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
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

const doLogout = (auth, message = "Сессия истекла. Войдите заново.") => {
  notify(message, "error");
  auth.logout();
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) return Promise.reject(error);

    const { useAuthStore } = await import("/src/stores/authStore.js");
    const auth = useAuthStore();
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response.status;
    const data = error.response.data;
    const url = originalRequest.url || "";
    const errorMessage = data?.message || data?.error || (typeof data === 'string' ? data : "");

    // Не трогаем auth-эндпоинты
    if (url.includes("/auth/")) {
      return Promise.reject(error);
    }

    // === ФАТАЛЬНЫЕ ОШИБКИ: сразу логаут, без рефреша ===
    const isUserNotFound = errorMessage.includes("User not found") && url.includes("/profile");

    if (data?.code === "SESSION_EXPIRED" || isUserNotFound) {
      doLogout(auth, "Сессия истекла. Войдите заново.");
      return Promise.reject(error);
    }

    // Не 401 — просто прокидываем
    if (status !== 401) {
      return Promise.reject(error);
    }

    // === 401: логика рефреша ===
    if (!auth.isAuthenticated || !auth.user?.id) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      doLogout(auth, "Ошибка авторизации. Войдите заново.");
      return Promise.reject(error);
    }

    // Ждём, пока другой запрос рефрешит токен
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    // === ЗАПУСКАЕМ РЕФРЕШ ===
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const success = await auth.refreshToken();
      if (success) {
        processQueue(null);
        return api(originalRequest);
      }
      throw new Error("Refresh returned false");
    } catch (refreshError) {
      processQueue(refreshError);
      doLogout(auth);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);