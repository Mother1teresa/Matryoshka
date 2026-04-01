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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Получаем сообщение от бэкенда
    const message = error.response?.data?.message;
    const status = error.response?.status;

    if (message === "SESSION_EXPIRED" || status === 401) {
      const auth = useAuthStore();
      auth.logout();
      notify("Сессия истекла. Войдите заново.");
    }
    return Promise.reject(error);
  }
);