import { defineStore } from "pinia"
import { router } from "/src/router/index.js";
import { api } from "/src/api/api.js"
import { useFavoritesStore } from "/src/stores/favoritesStore.js";
import maskAvatar from "/src/assets/img/mask-avatar.png";


export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null,
  }),
  getters: {
    userAvatar: (state) => state.user?.avatarUrl || state.user?.avatar || maskAvatar,
    formattedPhone: (state) => {
      const phone = state.user?.phone;
      if (!phone) return "Не указан";
      const cleaned = ('' + phone).replace(/\D/g, '');
      const match = cleaned.match(/^(\d|7|8)(\d{3})(\d{3})(\d{2})(\d{2})$/);
      if (match) {
        return `+7 (${match[2]}) ${match[3]} ${match[4]}-${match[5]}`;
      }
      return phone; 
    }
  },
  actions: {
    saveToStorage() {
      localStorage.setItem("auth", JSON.stringify({
        isAuthenticated: this.isAuthenticated,
        user: this.user
      }));
    },
    login(user) {
      this.isAuthenticated = true;
      this.user = { ...user };
      this.saveToStorage();
    },
    async loginAPI({ email, password }) {
      try {
        const res = await api.post("/auth/login", { login:email, password })
        if (res.data && res.data.user) {
          this.login(res.data.user);
          const favStore = useFavoritesStore();
          await favStore.fetchFavorites().catch(() => {});
          return true
        }
      } catch (e) {
        console.error("Login error:",  e.response?.data || e)
        throw e
      }
    },
    async registerAPI(userData) {
      try {
        const res = await api.post("/auth/register", userData);
        if (res.data && res.data.user) {
          this.login(res.data.user);
        }
        return res.data;
      } catch (e) {
        console.error("Register error:", e.response?.data || e);
        throw e;
      }
    },
    async refreshToken() {
      try {
        await api.post("/auth/refresh");
        return true;
      } catch (e) {
        this.logout();
        return false;
      }
    },
    async verifyCodeAPI(payload) { 
      try {
        const res = await api.post("/auth/check-code", payload);
        return res.data;
      } catch (e) {
        console.error("Ошибка в verifyCodeAPI:", e.response?.data);
        throw e;
      }
    },
    async fetchProfile() {
      try {
        const res = await api.get('/profile/');
        if (res.data && res.data.user) {
          this.login(res.data.user);
        }
      } catch (e) {
        if (e.response?.data?.code === "SESSION_EXPIRED" || e.response?.status === 401) {
          this.logout();
        }
        console.error("Ошибка загрузки профиля:", e.response?.status);
      }
    },
    async sendSms(phone) {
      return await api.post("/auth/sendsms", { phone })
    },
    async validateAndFormatCity(query) {
      if (!query || query.length < 3) return null;
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=ab3a562f-41f9-4eb0-94ab-b982e13c7742&format=json&geocode=${encodeURIComponent(query)}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        const feature = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
        return feature ? feature.name : null;
      } catch (e) {
        console.error("Ошибка геокодера:", e);
        return null;
      }
    },
    async logout() {
        this.isAuthenticated = false;
        this.user = null;
        localStorage.removeItem("auth");
        localStorage.removeItem("products");
        localStorage.removeItem("token");
        
        const favStore = useFavoritesStore();
        favStore.clear();

        if (window.location.pathname !== "/") {
        try {
          await router.push('/');
        } catch (e) {
          window.location.href = "/";
        }
      }
    },
    loadAuth() {
      const saved = localStorage.getItem("auth");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.isAuthenticated = data.isAuthenticated;
          this.user = data.user;
        } catch (e) {
          localStorage.removeItem("auth");
        }
      }
    }
  }
})