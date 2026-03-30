import axios from "axios"
import { useAuthStore } from "/src/stores/authStore" 

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
})
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
       console.error("Поймана 401 ошибка: Пользователь не авторизован");
      // const auth = useAuthStore(); 
      // auth.logout();               

      // if (window.location.pathname !== "/") {
      //   window.location.href = "/";
      // }
    }
    return Promise.reject(error);
  }
);