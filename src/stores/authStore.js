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
    userAvatar: (state) => state.user?.avatar || maskAvatar
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
        if (res.data.user) {
          this.login(res.data)
          const favStore = useFavoritesStore();
          await favStore.fetchFavorites();
        }
        return true
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
      try {
        if (!this.user?.id) {
          this.loadAuth();
        }
        if (!this.user?.id) return;
        const res = await api.get(`/profile/${this.user.id}`);
        if (res.data && res.data.user) {
          this.user = { ...this.user, ...res.data.user };
          this.saveToStorage(); 
        }
      } catch (e) {
        console.error("Ошибка загрузки профиля:", e.response?.status);
      }
    },
    async sendSms(phone) {
      return await api.post("/auth/sendsms", { phone })
    },
    logout() {
      this.isAuthenticated = false
      this.user = null
      localStorage.removeItem("auth")
      localStorage.removeItem("products")
      const favStore = useFavoritesStore();
      favStore.clear();
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