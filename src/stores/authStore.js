import { defineStore } from "pinia"
import { api } from "/src/api/api.js"
import { useFavoritesStore } from "./favoritesStore";
import maskAvatar from "/src/assets/img/mask-avatar.png"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthenticated: false,
    user: null,
  }),
  getters: {
    userAvatar: (state) => state.user?.avatar || maskAvatar,
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
    login(userData) {
      this.isAuthenticated = true;
      const user = userData.user || userData;
      this.user = {
        id: user.id,
        name: user.name,
        avatar: user.avatar || null 
      };
      this.saveToStorage();
    },
    async loginAPI({ email, password }) {
      try {
        const res = await api.post("/auth/login", { login:email, password })
        
        // if (res.data.token) {
        //   localStorage.setItem("token", res.data.token);
        // }
        if (res.data && res.data.user) {
          this.login(res.data.user);
          
          const favStore = useFavoritesStore();
          await favStore.fetchFavorites();
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
          this.login(res.data);
        }
        return res.data;
      } catch (e) {
        throw e;
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
      if (!this.user?.id) {
        this.loadAuth();
      }
      if (!this.user?.id) return;
      try {
        const res = await api.get(`/profile/${this.user.id}`);
        if (res.data && res.data.user) {
          this.user = { ...this.user, ...res.data.user };
          this.saveToStorage(); 
        }
      } catch (e) {
        if (e.response?.status === 404) {
          console.warn("Пользователь не найден в БД сервера, используем локальные данные.");
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
      
      api.post("/auth/logout").catch(() => {});

      // 3. Редирект
      if (window.location.pathname !== "/") {
        setTimeout(() => {
            window.location.href = "/";
        }, 50);
      }
    },
    loadAuth() {
      const saved = localStorage.getItem("auth");
      if (saved) {
        const data = JSON.parse(saved);
        this.isAuthenticated = data.isAuthenticated;
        this.user = data.user;
      }
    }
  }
})