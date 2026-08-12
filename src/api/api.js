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
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

const doLogout = (auth, message = "Сессия истекла. Войдите заново.") => {
  notify(message, "error");
  auth.logout();
};

const handleServerUnavailable = (error) => {
  if (!error.response) {
    notify("Нет соединения с сервером. Проверьте интернет.", "error");
    return true;
  }
  if (error.response.status === 502) {
    notify("Сервер взят в работу. Попробуйте позже.", "error");
    return true;
  }
  return false;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (handleServerUnavailable(error)) {
      return Promise.reject(error);
    }
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const { status, data } = error.response || {};
    const url = originalRequest.url || "";
    const errorMessage = data?.message || data?.error || "";
    if (status !== 401) return Promise.reject(error);
    if (url.includes("/auth/")) return Promise.reject(error);

    const { useAuthStore } = await import("/src/stores/authStore.js");
    const auth = useAuthStore();

    // Не залогинен — сразу logout
    if (!auth.isAuthenticated) {
      doLogout(auth);
      return Promise.reject(error);
    }
    const isUserNotFound = errorMessage.includes("User not found") && url.includes("/profile");
    if (isUserNotFound) {
      doLogout(auth);
      return Promise.reject(error);
    }
    if (originalRequest._retry) {
      doLogout(auth, "Ошибка авторизации. Войдите заново.");
      return Promise.reject(error);
    }
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
      if (!success) throw new Error("Refresh failed");

      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      doLogout(auth);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (handleServerUnavailable(error)) {
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);