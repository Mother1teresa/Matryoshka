import { defineStore } from "pinia";
import { router } from "/src/router/index.js";
import { api } from "/src/api/api.js";
import { useFavoritesStore } from "/src/stores/favoritesStore.js";
import maskAvatar from "/src/assets/img/mask-avatar.png";
import { useRegionModalStore } from "/src/stores/regionModal.js";

export const useAuthStore = defineStore("auth", {
  state: () => {
    const saved = localStorage.getItem("auth");
    try {
      const data = saved ? JSON.parse(saved) : null;
      return {
        isAuthenticated: data?.isAuthenticated || false,
        user: data?.user || null,
        allVideos: [],
        isVideosLoading: false,
      };
    } catch {
      localStorage.removeItem("auth");
      return { isAuthenticated: false, user: null };
    }
  },
  getters: {
    userAvatar: (state) =>
      state.user?.avatarUrl || state.user?.avatar || maskAvatar,
    formattedPhone: (state) => {
      const phone = state.user?.phone;
      if (!phone) return "Не указан";
      const cleaned = ("" + phone).replace(/\D/g, "");
      const match = cleaned.match(/^(\d|7|8)(\d{3})(\d{3})(\d{2})(\d{2})$/);
      if (match) {
        return `+7 (${match[2]}) ${match[3]} ${match[4]}-${match[5]}`;
      }
      return phone;
    },
  },
  actions: {
    saveToStorage() {
      localStorage.setItem("auth", JSON.stringify({
        isAuthenticated: this.isAuthenticated,
        user: this.user,
      }));
    },
    login(user) {
      this.isAuthenticated = true;
      this.user = { ...user };
      this.saveToStorage();
    },
    async loginAPI({ email, password }) {
      try {
        const res = await api.post("/auth/login", { login: email, password });
        if (res.data && res.data.user) {
          this.login(res.data.user);

          if (res.data.user.city) {
            useRegionModalStore().setRegion(res.data.user.city, res.data.user.coordinates || [37.6173, 55.7558]);
          }
          await useFavoritesStore().fetchFavorites().catch(() => {});
          return true;
        }
      } catch (e) {
        console.error("Login error:", e.response?.data || e);
        throw e;
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
    async sendSms(phone) {
      return await api.post("/auth/sendsms", { phone });
    },
    async fetchProfile() {
      try {
        const res = await api.get("/profile/");
        const userData = res.data.user;
        if (userData) {
          this.user = { ...this.user, ...userData };
          this.isAuthenticated = true;
          this.saveToStorage();

          const regionStore = useRegionModalStore();
          if (userData.city) {
            regionStore.setRegion(userData.city, userData.coordinates || [37.6173, 55.7558]);
          }
        }
      } catch (e) {
        console.error("Profile fetch error:", e);
        if (e.response?.data?.code === "SESSION_EXPIRED") this.logout();
      }
    },
    async fetchVideos() {
      if (!this.user?.id) return;
      this.isVideosLoading = true;
      try {
        const res = await api.get(`/media/user/${this.user.id}`);
        this.allVideos = (res.data.data || []).map(v => ({
          ...v,
          isArchived: false,
          thumbnail: v.previewUrl || v.cdnUrl || v.url
        }));
      } catch (e) {
        console.error("Ошибка загрузки роликов:", e);
      } finally {
        this.isVideosLoading = false;
      }
    },
    async deleteVideo(videoId) {
      if (!this.user?.id) return;
      try {
        // DELETE /api/media/user/{id}?videoId={videoId}
        await api.delete(`/media/user/${this.user.id}`, {
          params: { videoId }
        });
        // Удаляем из стейта только после успешного ответа сервера
        this.allVideos = this.allVideos.filter(v => v.id !== videoId);
        return true;
      } catch (e) {
        console.error("Ошибка при удалении видео:", e.response?.data || e.message);
        throw e;
      }
    },
    toggleArchiveLocal(videoId, status) {
      const video = this.allVideos.find(v => v.id === videoId);
      if (video) {
        video.isArchived = status;
      }
    },
    async validateAndFormatCity(query) {
      if (!query || query.length < 3) return null;
      const url = `https://geocode-maps.yandex.ru/1.x/?apikey=ab3a562f-41f9-4eb0-94ab-b982e13c7742&format=json&geocode=${encodeURIComponent(query)}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        const feature =
          data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
        return feature ? feature.name : null;
      } catch (e) {
        console.error("Ошибка геокодера:", e);
        return null;
      }
    },
    async logout() {
      this.isAuthenticated = false;
      this.user = null;
      useRegionModalStore().$patch({
        selectedRegion: null,
        coordinates: [37.6173, 55.7558]
      });
      ["auth", "region", "regionCoords", "products"].forEach(key => localStorage.removeItem(key));
      useFavoritesStore().clear();

      const favStore = useFavoritesStore();
      favStore.clear();

      if (window.location.pathname !== "/") {
        try {
          await router.push("/");
        } catch (e) {
          window.location.href = "/";
        }
      }
    },
  },
});
